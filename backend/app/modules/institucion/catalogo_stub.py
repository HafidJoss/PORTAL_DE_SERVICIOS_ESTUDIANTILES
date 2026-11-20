"""Estado contractual (stub) del catálogo escolar: secciones, asignaturas CNEB y asignaciones docentes."""

from copy import deepcopy
from typing import Any

DOCENTES_DISPONIBLES: list[str] = [
    "Prof. Julio Gamboa Rojas",
    "Prof. Rosa Cárdenas Palomino",
    "Prof. Edwin Pariona Quispe",
    "Prof. Karen Lozano Bendezú",
    "Prof. Miriam Huamaní Torres",
    "Prof. Raúl Ccahuana Vílchez",
    "Prof. Lucía Tineo Prado",
    "Prof. Óscar Bendezú Lapa",
    "Prof. Gladys Alarcón Medina",
    "Prof. Wilber Torres Chávez",
    "Prof. Nelly Quispe Ramos",
    "Prof. Félix Gutiérrez Ore",
]

AUXILIARES_DISPONIBLES: list[str] = [
    "Sr. Héctor Palomino Ayala",
    "Sra. Elena Rojas Najarro",
    "Sr. Teodoro Soto Llactahuamán",
]

ASIGNATURAS_CNEB: dict[str, list[tuple[str, list[str]]]] = {
    "Secundaria": [
        (
            "Matemática",
            [
                "Resuelve problemas de cantidad",
                "Resuelve problemas de regularidad, equivalencia y cambio",
                "Resuelve problemas de forma, movimiento y localización",
                "Resuelve problemas de gestión de datos e incertidumbre",
            ],
        ),
        (
            "Comunicación",
            [
                "Se comunica oralmente en su lengua materna",
                "Lee diversos tipos de textos escritos en su lengua materna",
                "Escribe diversos tipos de textos en su lengua materna",
            ],
        ),
        (
            "Inglés",
            [
                "Se comunica oralmente en inglés",
                "Lee diversos tipos de textos escritos en inglés",
                "Escribe diversos tipos de textos en inglés",
            ],
        ),
        (
            "Ciencia y Tecnología",
            [
                "Indaga mediante métodos científicos",
                "Explica el mundo físico basándose en conocimientos científicos",
                "Diseña y construye soluciones tecnológicas",
            ],
        ),
        (
            "Ciencias Sociales",
            [
                "Construye interpretaciones históricas",
                "Gestiona responsablemente el espacio y el ambiente",
                "Gestiona responsablemente los recursos económicos",
            ],
        ),
        (
            "Desarrollo Personal, Ciudadanía y Cívica",
            [
                "Construye su identidad",
                "Convive y participa democráticamente",
            ],
        ),
        (
            "Educación Física",
            [
                "Se desenvuelve de manera autónoma a través de su motricidad",
                "Asume una vida saludable",
                "Interactúa a través de sus habilidades sociomotrices",
            ],
        ),
        (
            "Arte y Cultura",
            [
                "Aprecia de manera crítica manifestaciones artístico-culturales",
                "Crea proyectos desde los lenguajes artísticos",
            ],
        ),
        (
            "Educación para el Trabajo",
            ["Gestiona proyectos de emprendimiento económico o social"],
        ),
        (
            "Educación Religiosa",
            [
                "Construye su identidad como persona humana",
                "Asume la experiencia del encuentro personal con Dios",
            ],
        ),
    ],
    "Primaria": [
        (
            "Matemática",
            [
                "Resuelve problemas de cantidad",
                "Resuelve problemas de regularidad, equivalencia y cambio",
                "Resuelve problemas de forma, movimiento y localización",
                "Resuelve problemas de gestión de datos e incertidumbre",
            ],
        ),
        (
            "Comunicación",
            [
                "Se comunica oralmente en su lengua materna",
                "Lee diversos tipos de textos escritos",
                "Escribe diversos tipos de textos",
            ],
        ),
        (
            "Personal Social",
            [
                "Construye su identidad",
                "Convive y participa democráticamente",
                "Construye interpretaciones históricas",
            ],
        ),
        (
            "Ciencia y Tecnología",
            [
                "Indaga mediante métodos científicos",
                "Explica el mundo físico",
                "Diseña y construye soluciones tecnológicas",
            ],
        ),
        (
            "Arte y Cultura",
            [
                "Aprecia de manera crítica manifestaciones artístico-culturales",
                "Crea proyectos desde los lenguajes artísticos",
            ],
        ),
        (
            "Educación Física",
            [
                "Se desenvuelve de manera autónoma a través de su motricidad",
                "Asume una vida saludable",
            ],
        ),
    ],
    "Transversales": [
        (
            "Competencias transversales",
            [
                "Se desenvuelve en entornos virtuales generados por las TIC",
                "Gestiona su aprendizaje de manera autónoma",
            ],
        )
    ],
}


def _generar_secciones_base() -> list[dict[str, Any]]:
    secciones: list[dict[str, Any]] = [
        {"id": "P1A", "nivel": "Primaria", "grado": 1, "letra": "A", "tutor": "Prof. Gladys Alarcón Medina", "auxiliar": "Tutor(a) de la sección"},
        {"id": "P1B", "nivel": "Primaria", "grado": 1, "letra": "B", "tutor": "Prof. Nelly Quispe Ramos", "auxiliar": "Tutor(a) de la sección"},
        {"id": "P2A", "nivel": "Primaria", "grado": 2, "letra": "A", "tutor": "Prof. Wilber Torres Chávez", "auxiliar": "Tutor(a) de la sección"},
        {"id": "S1A", "nivel": "Secundaria", "grado": 1, "letra": "A", "tutor": "Prof. Karen Lozano Bendezú", "auxiliar": "Sr. Héctor Palomino Ayala"},
        {"id": "S1B", "nivel": "Secundaria", "grado": 1, "letra": "B", "tutor": "Prof. Óscar Bendezú Lapa", "auxiliar": "Sra. Elena Rojas Najarro"},
        {"id": "S1P", "nivel": "Secundaria", "grado": 1, "letra": "P", "tutor": "Sin asignar", "auxiliar": "Sin asignar"},
        {"id": "S2A", "nivel": "Secundaria", "grado": 2, "letra": "A", "tutor": "Prof. Miriam Huamaní Torres", "auxiliar": "Sr. Héctor Palomino Ayala"},
        {"id": "S2B", "nivel": "Secundaria", "grado": 2, "letra": "B", "tutor": "Prof. Lucía Tineo Prado", "auxiliar": "Sra. Elena Rojas Najarro"},
        {"id": "S3A", "nivel": "Secundaria", "grado": 3, "letra": "A", "tutor": "Prof. Edwin Pariona Quispe", "auxiliar": "Sr. Héctor Palomino Ayala"},
        {"id": "S3B", "nivel": "Secundaria", "grado": 3, "letra": "B", "tutor": "Prof. Rosa Cárdenas Palomino", "auxiliar": "Sr. Héctor Palomino Ayala"},
        {"id": "S4A", "nivel": "Secundaria", "grado": 4, "letra": "A", "tutor": "Prof. Karen Lozano Bendezú", "auxiliar": "Sr. Teodoro Soto Llactahuamán"},
        {"id": "S4C", "nivel": "Secundaria", "grado": 4, "letra": "C", "tutor": "Prof. Raúl Ccahuana Vílchez", "auxiliar": "Sr. Teodoro Soto Llactahuamán"},
        {"id": "S5A", "nivel": "Secundaria", "grado": 5, "letra": "A", "tutor": "Prof. Félix Gutiérrez Ore", "auxiliar": "Sra. Elena Rojas Najarro"},
    ]
    return secciones


_SECCIONES_BASE = _generar_secciones_base()
_secciones_memoria: list[dict[str, Any]] = deepcopy(_SECCIONES_BASE)
_asignaciones_memoria: dict[tuple[str, str], dict[str, str]] = {}


def reiniciar_catalogo_institucion() -> None:
    """Restaura secciones y asignaciones docentes en memoria."""
    global _secciones_memoria, _asignaciones_memoria
    _secciones_memoria = deepcopy(_SECCIONES_BASE)
    _asignaciones_memoria = {}


def obtener_secciones_memoria() -> list[dict[str, Any]]:
    """Devuelve la referencia interna de secciones del catálogo stub."""
    return _secciones_memoria


def obtener_seccion_por_id(seccion_id: str) -> dict[str, Any] | None:
    """Busca una sección por identificador."""
    return next((s for s in _secciones_memoria if s["id"] == seccion_id), None)


def listar_secciones_mismo_grado(nivel: str, grado: int, excluir_id: str | None = None) -> list[dict[str, Any]]:
    """Lista las secciones de un mismo nivel y grado ordenadas por letra."""
    filtradas = [
        s
        for s in _secciones_memoria
        if s["nivel"] == nivel and s["grado"] == grado and s["id"] != excluir_id
    ]
    return sorted(filtradas, key=lambda x: x["letra"])


def obtener_asignacion_docente(seccion: dict[str, Any], asignatura: str, indice: int) -> dict[str, str]:
    """Devuelve (titular, suplente) vigente para (seccion, asignatura)."""
    clave = (seccion["id"], asignatura)
    if clave in _asignaciones_memoria:
        return dict(_asignaciones_memoria[clave])

    if seccion["tutor"] == "Sin asignar":
        titular = ""
    elif asignatura == "Matemática" and seccion["id"] in {"S3A", "S3B", "S4A", "S4C"}:
        titular = "Prof. Julio Gamboa Rojas"
    elif asignatura == "Ciencias Sociales" and seccion["id"] in {"S2A", "S2B"}:
        titular = "Prof. Miriam Huamaní Torres"
    else:
        idx = (indice * 3 + seccion["grado"] + ord(seccion["letra"])) % len(DOCENTES_DISPONIBLES)
        titular = DOCENTES_DISPONIBLES[idx]
    return {"titular": titular, "suplente": ""}


def guardar_asignacion_docente(seccion_id: str, asignatura: str, titular: str, suplente: str) -> dict[str, str]:
    """Persiste en memoria la asignación docente para (seccion_id, asignatura)."""
    registro = {"titular": titular, "suplente": suplente}
    _asignaciones_memoria[(seccion_id, asignatura)] = registro
    return dict(registro)


def alerta_asignacion(titular: str, suplente: str) -> str | None:
    """Calcula la alerta operativa de una asignación docente."""
    if not titular:
        return "Sin docente titular"
    if titular == "Prof. Miriam Huamaní Torres" and not suplente:
        return "Titular con licencia del 16 al 27 nov: asigna suplente"
    return None
