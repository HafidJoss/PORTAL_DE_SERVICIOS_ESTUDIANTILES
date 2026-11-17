"""Auditor determinista de solo lectura para la skill `cierre-fase-tdd`.

Inspecciona el estado real del repositorio frente a OpenSpec, TDD, fronteras
modulares (ADR-008), nomenclatura v2.0 y formato documental (CRLF), sin modificar
ningún archivo del proyecto.
"""

from __future__ import annotations

import argparse
import ast
import json
import re
import subprocess
import sys
from dataclasses import asdict, dataclass, field
from pathlib import Path

MODULOS_MVP = (
    "asistencia",
    "auditoria",
    "evaluacion",
    "identidad",
    "institucion",
    "matriculas",
    "personas",
    "reportes",
    "seguimiento",
)

SUBCARPETAS_FEATURE_VALIDAS = {"vistas", "componentes", "utilidades", "pruebas"}
SUBCARPETAS_SHARED_VALIDAS = {
    "componentes",
    "estilos",
    "ganchos",
    "preferencias",
    "utilidades",
    "pruebas",
}
PATRON_TEST_FRONTEND = re.compile(
    r"^test(Unitario|Componente|Integracion|E2e)[A-Z].*\.test\.tsx?$"
)
PATRON_TEST_BACKEND = re.compile(r"^test_(unitario|integracion|e2e)_[a-z0-9_]+\.py$")
PATRON_ANTIPATRON_TDD = re.compile(
    r"\b(?:it|describe|test)\.(?:skip|only|todo)\s*\("
    r"|@pytest\.mark\.(?:skip|xfail)\b"
    r"|@ts-ignore\b|@ts-expect-error\b|eslint-disable\b"
)
PATRON_SPEC_COMENTARIO = re.compile(r"^\s*(?://|#)\s*Spec:\s*(.+)$", re.MULTILINE)
PATRON_IMPORT_JS = re.compile(r"""from\s+["'](\.[^"']+)["']""")


@dataclass
class EstadoSpec:
    nombre: str
    requisitos: int
    escenarios: int
    archivos_prueba: list[str] = field(default_factory=list)
    casos_prueba: int = 0


@dataclass
class ReporteAuditoria:
    raiz: str
    rama_git: str
    cambios_git_pendientes: int
    cambios_openspec_activos: list[str]
    cambios_openspec_archivados: int
    specs: dict[str, EstadoSpec]
    modulos_mvp: list[dict[str, str]]
    violaciones_nomenclatura: list[str]
    violaciones_adr008: list[str]
    antipatrones_tdd: list[str]
    pruebas_sin_cabecera_spec: list[str]
    utilidades_sin_prueba_unitaria: list[str]
    docs_sin_crlf: list[str]
    herramientas_backend_pendientes: list[str]


def detectar_raiz(inicio: Path | None = None) -> Path:
    """Sube desde `inicio` o CWD hasta encontrar el directorio que contiene `.git`."""
    actual = (inicio or Path.cwd()).resolve()
    for candidato in (actual, *actual.parents):
        if (candidato / ".git").exists() or (candidato / "AGENTS.md").exists():
            return candidato
    return actual


def ejecutar_git(raiz: Path, *args: str) -> str:
    """Ejecuta un comando git de solo lectura y devuelve stdout limpio."""
    try:
        res = subprocess.run(
            ["git", *args],
            cwd=raiz,
            capture_output=True,
            text=True,
            encoding="utf-8",
            check=False,
        )
        return res.stdout.strip()
    except OSError:
        return ""


def auditar_openspec(raiz: Path) -> tuple[list[str], int, dict[str, EstadoSpec]]:
    """Lee cambios activos, archivados y requisitos/escenarios de `openspec/`."""
    changes_dir = raiz / "openspec" / "changes"
    activos: list[str] = []
    archivados = 0
    if changes_dir.is_dir():
        for entry in sorted(changes_dir.iterdir()):
            if not entry.is_dir():
                continue
            if entry.name == "archive":
                archivados = sum(1 for sub in entry.iterdir() if sub.is_dir())
            else:
                activos.append(entry.name)

    specs: dict[str, EstadoSpec] = {}
    specs_dir = raiz / "openspec" / "specs"
    if specs_dir.is_dir():
        for spec_file in sorted(specs_dir.glob("*/spec.md")):
            cap = spec_file.parent.name
            texto = spec_file.read_text(encoding="utf-8")
            reqs = len(re.findall(r"^###\s+Requirement:", texto, re.MULTILINE))
            escs = len(re.findall(r"^####\s+Scenario:", texto, re.MULTILINE))
            specs[cap] = EstadoSpec(nombre=cap, requisitos=reqs, escenarios=escs)

    return activos, archivados, specs


def _contar_casos_prueba(texto: str, es_python: bool) -> int:
    if es_python:
        return len(re.findall(r"^\s*(?:async\s+)?def\s+test_", texto, re.MULTILINE))
    basicos = len(re.findall(r"\b(?:it|test)\s*\(", texto))
    it_each = len(re.findall(r"\bit\.each\s*\(", texto))
    return basicos + it_each


def _extraer_capacidades_spec(linea: str, capacidades_conocidas: set[str]) -> list[str]:
    parte_caps = linea.split("·", 1)[0]
    encontradas = []
    for token in re.split(r"[,;/\s]+", parte_caps.strip()):
        limpio = token.strip().lower()
        if limpio in capacidades_conocidas:
            encontradas.append(limpio)
    if not encontradas:
        for cap in capacidades_conocidas:
            if re.search(rf"\b{re.escape(cap)}\b", linea.lower()):
                encontradas.append(cap)
    return sorted(set(encontradas))


def auditar_pruebas_y_trazabilidad(
    raiz: Path, specs: dict[str, EstadoSpec]
) -> tuple[list[str], list[str], list[str]]:
    """Audita referencias `Spec:`, anti-patrones TDD y emparejamiento de lógica pura."""
    capacidades = set(specs.keys())
    antipatrones: list[str] = []
    sin_cabecera: list[str] = []
    imports_unitarios_fe: set[str] = set()

    archivos_test: list[tuple[Path, bool]] = []
    fe_src = raiz / "frontend" / "src"
    if fe_src.is_dir():
        for p in sorted(fe_src.rglob("*.test.ts*")):
            if "api/generated" not in p.as_posix():
                archivos_test.append((p, False))
    be_tests = raiz / "backend" / "tests"
    if be_tests.is_dir():
        for p in sorted(be_tests.rglob("test_*.py")):
            archivos_test.append((p, True))

    for archivo, es_py in archivos_test:
        rel = archivo.relative_to(raiz).as_posix()
        texto = archivo.read_text(encoding="utf-8")
        casos = _contar_casos_prueba(texto, es_py)

        for match in PATRON_ANTIPATRON_TDD.finditer(texto):
            antipatrones.append(f"{rel}: `{match.group(0).strip()}`")

        spec_match = PATRON_SPEC_COMENTARIO.search(texto)
        if not spec_match:
            sin_cabecera.append(rel)
        else:
            caps = _extraer_capacidades_spec(spec_match.group(1), capacidades)
            for cap in caps:
                specs[cap].archivos_prueba.append(rel)
                specs[cap].casos_prueba += casos

        if not es_py and archivo.name.startswith("testUnitario"):
            for imp in PATRON_IMPORT_JS.findall(texto):
                resuelto = (archivo.parent / imp).resolve()
                for sufijo in (".ts", ".tsx"):
                    candidato = Path(f"{resuelto}{sufijo}")
                    if candidato.is_file():
                        imports_unitarios_fe.add(candidato.relative_to(raiz).as_posix())

    # Escanear también código productivo por silenciadores TDD/lint
    for carpeta in (fe_src, raiz / "backend" / "app"):
        if not carpeta.is_dir():
            continue
        for p in sorted(carpeta.rglob("*")):
            if not p.is_file() or p.suffix not in {".ts", ".tsx", ".py"}:
                continue
            posix = p.as_posix()
            if "api/generated" in posix or "__pycache__" in posix:
                continue
            texto = p.read_text(encoding="utf-8")
            for match in PATRON_ANTIPATRON_TDD.finditer(texto):
                antipatrones.append(f"{p.relative_to(raiz).as_posix()}: `{match.group(0).strip()}`")

    sin_unitaria: list[str] = []
    fe_features = fe_src / "features"
    if fe_features.is_dir():
        for util in sorted(fe_features.glob("*/utilidades/*.ts")):
            rel_util = util.relative_to(raiz).as_posix()
            if rel_util not in imports_unitarios_fe:
                sin_unitaria.append(rel_util)

    be_modules = raiz / "backend" / "app" / "modules"
    if be_modules.is_dir():
        for mod_dir in sorted(be_modules.iterdir()):
            if not mod_dir.is_dir():
                continue
            for capa in ("reglas.py", "service.py"):
                archivo_capa = mod_dir / capa
                if archivo_capa.is_file():
                    unitarias = list((be_tests / mod_dir.name).glob("test_unitario_*.py"))
                    if not unitarias:
                        sin_unitaria.append(archivo_capa.relative_to(raiz).as_posix())

    return sorted(set(antipatrones)), sin_cabecera, sin_unitaria


def auditar_nomenclatura_y_modulos(raiz: Path) -> tuple[list[str], list[dict[str, str]]]:
    """Audita nomenclatura v2.0 en frontend/backend y construye tabla de módulos MVP."""
    violaciones: list[str] = []

    fe_src = raiz / "frontend" / "src"
    if fe_src.is_dir():
        for item in sorted(fe_src.rglob("*")):
            rel = item.relative_to(fe_src).as_posix()
            if rel == "api/generated" or rel.startswith("api/generated/"):
                continue
            if item.name == ".gitkeep":
                entradas = list(item.parent.iterdir())
                if len(entradas) > 1:
                    violaciones.append(
                        f"frontend/src/{rel}: .gitkeep redundante en carpeta con archivos"
                    )
                continue
            if item.name[0].isupper():
                violaciones.append(
                    f"frontend/src/{rel}: inicia con mayúscula (se exige camelCase)"
                )
            if item.is_file() and ".test." in item.name:
                if item.parent.name != "pruebas":
                    violaciones.append(
                        f"frontend/src/{rel}: prueba fuera de carpeta pruebas/"
                    )
                elif not PATRON_TEST_FRONTEND.match(item.name):
                    violaciones.append(
                        f"frontend/src/{rel}: nombre no sigue test<Tipo><Contexto>.test.ts(x)"
                    )

        shared_dir = fe_src / "shared"
        if shared_dir.is_dir():
            for sub in sorted(shared_dir.iterdir()):
                if sub.is_dir() and sub.name not in SUBCARPETAS_SHARED_VALIDAS:
                    violaciones.append(
                        f"frontend/src/shared/{sub.name}: subcarpeta fuera de estándar español"
                    )

        features_dir = fe_src / "features"
        if features_dir.is_dir():
            for mod in sorted(features_dir.iterdir()):
                if not mod.is_dir():
                    continue
                for sub in sorted(mod.iterdir()):
                    if sub.is_dir() and sub.name not in SUBCARPETAS_FEATURE_VALIDAS:
                        violaciones.append(
                            f"frontend/src/features/{mod.name}/{sub.name}: subcarpeta no permitida"
                        )

    be_dir = raiz / "backend"
    if be_dir.is_dir():
        for gk in sorted(be_dir.rglob(".gitkeep")):
            if ".venv" in gk.parts:
                continue
            entradas = list(gk.parent.iterdir())
            if len(entradas) > 1:
                violaciones.append(
                    f"{gk.relative_to(raiz).as_posix()}: .gitkeep redundante en carpeta con archivos"
                )
        be_tests = be_dir / "tests"
        if be_tests.is_dir():
            for py_test in sorted(be_tests.rglob("*.py")):
                if "__pycache__" in py_test.parts or py_test.name in {"__init__.py", "conftest.py"}:
                    continue
                if not PATRON_TEST_BACKEND.match(py_test.name):
                    violaciones.append(
                        f"{py_test.relative_to(raiz).as_posix()}: no sigue test_<tipo>_<contexto>.py"
                    )

    estado_modulos: list[dict[str, str]] = []
    for mod in MODULOS_MVP:
        fe_mod = fe_src / "features" / mod
        be_mod = raiz / "backend" / "app" / "modules" / mod

        if not fe_mod.is_dir():
            fe_estado = "ausente"
            violaciones.append(f"frontend/src/features/{mod}: falta módulo espejo MVP")
        elif (fe_mod / "vistas").is_dir() and any((fe_mod / "vistas").glob("*.tsx")):
            fe_estado = "implementado"
        else:
            fe_estado = "reservado"

        if not be_mod.is_dir():
            be_estado = "ausente"
            violaciones.append(f"backend/app/modules/{mod}: falta módulo espejo MVP")
        elif (be_mod / "service.py").is_file() or (be_mod / "repository.py").is_file():
            be_estado = "activo"
        elif (be_mod / "router.py").is_file():
            be_estado = "stub_contractual"
        else:
            be_estado = "reservado"

        estado_modulos.append({"modulo": mod, "frontend": fe_estado, "backend": be_estado})

    return violaciones, estado_modulos


def auditar_fronteras_adr008(raiz: Path) -> list[str]:
    """Comprueba aislamiento entre módulos en frontend y capas estrictas en backend."""
    violaciones: list[str] = []

    fe_features = (raiz / "frontend" / "src" / "features").resolve()
    if fe_features.is_dir():
        for archivo in sorted(fe_features.rglob("*.ts*")):
            if not archivo.is_file() or "pruebas" in archivo.parts:
                continue
            mod_origen = archivo.relative_to(fe_features).parts[0]
            texto = archivo.read_text(encoding="utf-8")
            for spec_imp in PATRON_IMPORT_JS.findall(texto):
                destino = (archivo.parent / spec_imp).resolve()
                try:
                    rel_dest = destino.relative_to(fe_features)
                except ValueError:
                    continue
                mod_dest = rel_dest.parts[0]
                if mod_dest != mod_origen and not (
                    mod_origen == "seguimiento" and mod_dest == "evaluacion"
                ):
                    violaciones.append(
                        f"{archivo.relative_to(raiz).as_posix()}: importa desde feature '{mod_dest}' ({spec_imp})"
                    )

    be_modules = raiz / "backend" / "app" / "modules"
    if be_modules.is_dir():
        for py in sorted(be_modules.rglob("*.py")):
            if "__pycache__" in py.parts:
                continue
            mod_origen = py.relative_to(be_modules).parts[0]
            tree = ast.parse(py.read_text(encoding="utf-8"), filename=str(py))
            for node in ast.walk(tree):
                modulos_imp: list[str] = []
                if isinstance(node, ast.Import):
                    modulos_imp = [alias.name for alias in node.names]
                elif isinstance(node, ast.ImportFrom) and node.module:
                    modulos_imp = [node.module]
                for mod_name in modulos_imp:
                    if py.name in {"reglas.py", "service.py", "exceptions.py"} and (
                        mod_name.startswith("fastapi") or mod_name.startswith("starlette")
                    ):
                        violaciones.append(
                            f"{py.relative_to(raiz).as_posix()}: capa de negocio importa {mod_name}"
                        )
                    if py.name == "reglas.py" and mod_name.startswith("sqlalchemy"):
                        violaciones.append(
                            f"{py.relative_to(raiz).as_posix()}: reglas.py importa {mod_name}"
                        )
                    m = re.match(r"^app\.modules\.([a-z0-9_]+)\.(repository|models)$", mod_name)
                    if m and m.group(1) != mod_origen:
                        violaciones.append(
                            f"{py.relative_to(raiz).as_posix()}: accede directo a {mod_name} de otro módulo"
                        )

    return violaciones


def auditar_docs_y_herramientas(raiz: Path) -> tuple[list[str], list[str]]:
    """Verifica CRLF en Markdown raíz/docs y presencia de linters backend en pyproject.toml."""
    sin_crlf: list[str] = []
    candidatos = [raiz / "AGENTS.md", raiz / "CLAUDE.md"]
    docs_dir = raiz / "docs"
    if docs_dir.is_dir():
        candidatos.extend(sorted(docs_dir.rglob("*.md")))
    for md in candidatos:
        if not md.is_file():
            continue
        raw = md.read_bytes()
        if re.search(rb"(?<!\r)\n", raw):
            sin_crlf.append(md.relative_to(raiz).as_posix())

    herramientas_faltantes: list[str] = []
    pyproject = raiz / "backend" / "pyproject.toml"
    if pyproject.is_file():
        txt = pyproject.read_text(encoding="utf-8")
        if "[tool.ruff]" not in txt and "ruff" not in txt:
            herramientas_faltantes.append("ruff no configurado aún en backend/pyproject.toml (previsto para Fase 2)")
        if "import-linter" not in txt and "[tool.importlinter]" not in txt:
            herramientas_faltantes.append("import-linter no configurado aún en backend/pyproject.toml (previsto para Fase 2)")

    return sin_crlf, herramientas_faltantes


def construir_reporte(raiz: Path) -> ReporteAuditoria:
    """Ejecuta todas las auditorías de solo lectura y devuelve el ReporteAuditoria."""
    rama = ejecutar_git(raiz, "branch", "--show-current") or "(desconocida)"
    status_lines = [ln for ln in ejecutar_git(raiz, "status", "--porcelain").splitlines() if ln.strip()]
    activos, archivados, specs = auditar_openspec(raiz)
    antipatrones, sin_cabecera, sin_unitaria = auditar_pruebas_y_trazabilidad(raiz, specs)
    viol_nom, estado_modulos = auditar_nomenclatura_y_modulos(raiz)
    viol_adr = auditar_fronteras_adr008(raiz)
    sin_crlf, herramientas_pend = auditar_docs_y_herramientas(raiz)

    return ReporteAuditoria(
        raiz=raiz.as_posix(),
        rama_git=rama,
        cambios_git_pendientes=len(status_lines),
        cambios_openspec_activos=activos,
        cambios_openspec_archivados=archivados,
        specs=specs,
        modulos_mvp=estado_modulos,
        violaciones_nomenclatura=viol_nom,
        violaciones_adr008=viol_adr,
        antipatrones_tdd=antipatrones,
        pruebas_sin_cabecera_spec=sin_cabecera,
        utilidades_sin_prueba_unitaria=sin_unitaria,
        docs_sin_crlf=sin_crlf,
        herramientas_backend_pendientes=herramientas_pend,
    )


def renderizar_markdown(rep: ReporteAuditoria) -> str:
    """Formatea el reporte como diagnóstico Markdown legible."""
    lineas = [
        "# Diagnóstico estático de fase (`cierre-fase-tdd`)",
        "",
        f"- **Rama Git actual:** `{rep.rama_git}` (archivos sin commit: {rep.cambios_git_pendientes})",
        f"- **OpenSpec archivados:** {rep.cambios_openspec_archivados} · **Activos sin archivar:** {', '.join(rep.cambios_openspec_activos) or 'ninguno'}",
        "",
        "## 1. Cobertura de especificaciones (`openspec/specs/` → pruebas)",
        "",
        "| Capacidad (Spec) | Requirements | Escenarios | Archivos de prueba | Casos (`it`/`test_`) | Estado |",
        "|---|---:|---:|---:|---:|---|",
    ]
    for sp in rep.specs.values():
        estado = "Cubierta" if sp.archivos_prueba else "SIN PRUEBAS"
        lineas.append(
            f"| `{sp.nombre}` | {sp.requisitos} | {sp.escenarios} | {len(sp.archivos_prueba)} | {sp.casos_prueba} | {estado} |"
        )

    lineas.extend([
        "",
        "## 2. Estado espejo de los 9 módulos MVP (`ADR-008`)",
        "",
        "| Módulo | Frontend (`features/`) | Backend (`app/modules/`) |",
        "|---|---|---|",
    ])
    for m in rep.modulos_mvp:
        lineas.append(f"| `{m['modulo']}` | {m['frontend']} | {m['backend']} |")

    def _bloque(titulo: str, items: list[str]) -> None:
        lineas.append("")
        lineas.append(f"### {titulo} ({len(items)})")
        if not items:
            lineas.append("- Sin hallazgos.")
        else:
            for item in items:
                lineas.append(f"- {item}")

    lineas.extend(["", "## 3. Hallazgos y puntos sueltos"])
    _bloque("Violaciones de nomenclatura o estructura", rep.violaciones_nomenclatura)
    _bloque("Violaciones de fronteras o capas (ADR-008)", rep.violaciones_adr008)
    _bloque("Anti-patrones TDD (`skip`/`xfail`/`eslint-disable`)", rep.antipatrones_tdd)
    _bloque("Pruebas sin cabecera de trazabilidad (`Spec:`)", rep.pruebas_sin_cabecera_spec)
    _bloque("Módulos de lógica pura sin prueba unitaria dedicada", rep.utilidades_sin_prueba_unitaria)
    _bloque("Documentos Markdown sin CRLF", rep.docs_sin_crlf)
    _bloque("Herramientas backend pendientes de configurar", rep.herramientas_backend_pendientes)

    return "\n".join(lineas) + "\n"


def tiene_fallos_criticos(rep: ReporteAuditoria) -> bool:
    """Determina si existen hallazgos bloqueantes para `--estricto`."""
    specs_sin_pruebas = any(not sp.archivos_prueba for sp in rep.specs.values())
    return bool(
        rep.rama_git == "main"
        or specs_sin_pruebas
        or rep.violaciones_nomenclatura
        or rep.violaciones_adr008
        or rep.antipatrones_tdd
        or rep.docs_sin_crlf
    )


def main() -> int:
    parser = argparse.ArgumentParser(description="Auditor estático de cierre de fase.")
    parser.add_argument("--raiz", type=Path, default=None, help="Ruta raíz del repositorio.")
    parser.add_argument(
        "--formato",
        choices=("markdown", "json"),
        default="markdown",
        help="Formato de salida.",
    )
    parser.add_argument(
        "--estricto",
        action="store_true",
        help="Devuelve código de salida 1 si hay hallazgos críticos.",
    )
    args = parser.parse_args()

    raiz = detectar_raiz(args.raiz)
    reporte = construir_reporte(raiz)

    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")

    if args.formato == "json":
        payload = asdict(reporte)
        print(json.dumps(payload, indent=2, ensure_ascii=False))
    else:
        print(renderizar_markdown(reporte), end="")

    if args.estricto and tiene_fallos_criticos(reporte):
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
