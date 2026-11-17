# Fase 2 · Portal Docente (Frontend + API Contractual Stub)

> **Estado:** Completada · **Rama de trabajo:** `dev` · **Fecha de cierre:** 2026-11-17

---

## 1. Resumen ejecutivo y alcance

En esta segunda fase se construyó e integró de extremo a extremo la experiencia web completa del rol **Docente (`Portal Docente`)** basada en [Portal Docente.dc.html](../../prototipos/Portal%20Docente.dc.html), manteniendo la arquitectura limpia multi-rol de `MarcoPortal` y ampliando los contratos **OpenAPI 3.1** de FastAPI sincronizados con Orval (`ADR-006`).

### En alcance
- Soporte multi-rol en `identidad` y `app/aplicacion.tsx` para el perfil `Docente` (`especialidad`, `nivel_educativo`, `secciones_a_cargo`), reutilizando `MarcoPortal` con navegación específica en escritorio y móvil (`AC07`).
- Ampliación del backend contractual (`backend/app/modules/`) de `19` a `36` rutas bajo `/api/v1` (`OPENAPI_SYNC: True`) cubriendo tablero docente, bandeja con hilo acotado, sesiones `K1..K4`, actividades sin adjuntos, cierre trimestral (`RF22`), observaciones (`RF24`), anuncios unidireccionales (`RF25`), mensajería saliente y descargas SIAGIE/Actas (`RF16`, `RC05`).
- Implementación completa de las 7 rutas del rol `Docente`: `/inicio` (`InicioDocenteVista`), `/cursos` (`CursosDocenteVista`), `/cursos/:asignaturaId` (`CursoDocenteDetalleVista` con 6 pestañas), `/nota-del-dia` (`NotaDelDiaVista`), `/mensajes` (`MensajesDocenteVista`), `/siagie` (`ExportarSiagieVista`) y `/configuracion` (`ConfiguracionVista` sin carga de foto de perfil según `RC08`).
- Motor puro CNEB de cálculo cualitativo en `calculoMediana.ts` (`AD`, `A`, `B`, `C` por mediana sin promedios numéricos, regla `RF22` diferenciando `Primaria` `B/C` y `Secundaria` `C`) y exportador tabular CSV UTF-8 con BOM (`exportadorCsvAuxiliar.ts`).

### Fuera de alcance en esta fase
- Portales restantes del plan por prototipos: `Portal Auxiliar` (Fase 3), `Portal Apoderado`, `Dirección`, `Secretaría` y `Administrador`.
- Persistencia en PostgreSQL 16 + Alembic, hashing Argon2 / cookie `__session` real, bitácora `ADR-005` y mapeo binario sobre la plantilla oficial `.xlsx` del SIAGIE (`RC06`, declarado como bloqueo externo hasta la entrega institucional de la plantilla en Fase 5).
- Subida de archivos (trabajos, fotos, adjuntos en mensajes), chat en tiempo real y requisitos `Pospuesto` (`RC08`).

---

## 2. Diagnóstico de estado TDD y cobertura de fase

| Categoría | Estado | Detalle observado |
|---|---|---|
| **Contemplado y verificado** | Verde | `40` requerimientos totales consolidados en `openspec/specs/` (`evaluacion` 11, `seguimiento` 10, `plataforma-web` 8, `identidad` 6, `reportes` 3, `asistencia` 2) respaldados por `28` pruebas `pytest` y `112` pruebas `vitest`. |
| **Puntos sueltos corregidos con TDD** | Resuelto | Se detectaron y resolvieron: archivado/consolidación de los 3 cambios OpenSpec de Fase 2 en `openspec/specs/`, manejo explícito del detalle `ProblemDetailError` en `ExportarSiagieVista` con prueba de fallo `400`/`500` y reintento (`testIntegracionExportarSiagieVista.test.tsx`), y verificación HTTP en vivo sobre `uvicorn + vite`. |
| **Faltante / Diferido a siguiente fase** | Planificado | Configuración de `ruff`/`import-linter` en `backend/pyproject.toml`, persistencia real PostgreSQL/Alembic, plantilla binaria `.xlsx` SIAGIE (`RC06`) y portales de `Auxiliar`/`Apoderado`/gestión. |

---

## 3. Arquitectura, módulos y contratos implementados

| Área / Módulo (`ADR-008`) | Archivos principales | Responsabilidad |
|---|---|---|
| `backend/app/modules/` | `identidad/{schemas,router}.py`, `seguimiento/{schemas,router}.py`, `evaluacion/{schemas,router}.py`, `reportes/{schemas,router}.py` | Contratos OpenAPI docentes (`17` rutas nuevas, `36` totales en `backend/openapi.json`) con validación Pydantic y respuestas Problem Details (`RFC 9457`). |
| `frontend/src/app/` | `aplicacion.tsx`, `pruebas/testE2eRecorridoDocenteBase.test.tsx` | Enrutamiento multi-rol `Docente` sin vistas puente temporales y recorrido E2E autenticado completo. |
| `frontend/src/shared/` | `componentes/marcoPortal.tsx`, `utilidades/sesion.ts` | Propiedades opcionales `subtituloPortal` y `navMovilItems` y extractor `resolverDocenteId` (`docente_id`). |
| `frontend/src/features/seguimiento/` | `vistas/{inicioDocenteVista,cursosDocenteVista,cursoDocenteDetalleVista}.tsx`, `componentes/bandejaDocente.tsx`, `utilidades/filtrosBandejaDocente.ts`, `pruebas/` | Tablero inicial docente, grilla `Mis cursos` por secciones y detalle de 6 pestañas (`Novedades`, `Clases`, `Registro auxiliar`, `Actividades`, `Cierre`, `Estudiantes`) con anuncios unidireccionales. |
| `frontend/src/features/evaluacion/` | `utilidades/{calculoMediana,exportadorCsvAuxiliar,filtrosMensajesDocente}.ts`, `componentes/{fichaClaseCuadricula,formularioNuevaClase,registroAuxiliarTabla,formularioActividadDocente,panelCierreCompetencias,listaEstudiantesSeccion}.tsx`, `vistas/{notaDelDiaVista,mensajesDocenteVista}.tsx`, `pruebas/` | Motor puro CNEB (`mediana`/`ultimo`, `RF22`), cuadrícula móvil/escritorio `K1..K4`, cierre de competencias, observaciones `RF24` y mensajería saliente sin adjuntos. |
| `frontend/src/features/reportes/` | `utilidades/estadoSiagie.ts`, `vistas/exportarSiagieVista.tsx`, `pruebas/` | Estado trimestral `I/II/III` para `Excel SIAGIE` y `Acta preliminar` con enlace firmado TTL `15 min` (`RC05`). |

### Comprobación de fronteras (`ADR-008`) y estándares
- Dependencias entre módulos: únicamente `seguimiento` (`cursoDocenteDetalleVista.tsx`) compone componentes y utilidades puras de `evaluacion`; los módulos de nivel 0 (`identidad`, `evaluacion`, `asistencia`, `reportes`) permanecen aislados sin ciclos (`ExportarSiagieVista` navega a `/cursos/:id?tab=cierre` vía router).
- Cumplimiento de [nomenclatura.md](../06-estandares/nomenclatura.md) y [tdd.md](../06-estandares/tdd.md): **0** desviaciones reportadas por `auditar_estado_fase.py --estricto`.

---

## 4. Trazabilidad y especificaciones consolidadas (`OpenSpec`)

Los 3 cambios de la Fase 2 quedaron archivados en `openspec/changes/archive/2026-11-17-*` y consolidados en `openspec/specs/`:

| Spec consolidada | Cambio(s) archivado(s) en Fase 2 | Requirements totales | IDs trazados (`RF`, `HU`, `AC`, `RC`, `ADR`) |
|---|---|---|---|
| `openspec/specs/identidad/spec.md` | `2026-11-17-docente-base-y-seguimiento` | 6 | `RF14`, `HU14`, `RC03`, `RC08`, `AC04` |
| `openspec/specs/seguimiento/spec.md` | `2026-11-17-docente-base-y-seguimiento` + `2026-11-17-docente-evaluacion-y-clases` | 10 | `RF04`, `RF06`, `RF23`, `RF24`, `RF25`, `RF26`, `HU12`, `HU14`, `AC07`, `RC08`, `ADR-008` |
| `openspec/specs/evaluacion/spec.md` | `2026-11-17-docente-evaluacion-y-clases` + `2026-11-17-docente-mensajes-y-siagie` | 11 | `RF06`, `RF07`, `RF08`, `RF22`, `RF23`, `RF24`, `RF25`, `HU02`, `HU14`, `HU15`, `AC04`, `AC07`, `RC08` |
| `openspec/specs/reportes/spec.md` | `2026-11-17-docente-mensajes-y-siagie` | 3 | `RF16`, `HU07`, `RC05`, `RC06`, `ADR-002` |
| `openspec/specs/plataforma-web/spec.md` | `2026-11-17-docente-base-y-seguimiento` + `2026-11-17-docente-evaluacion-y-clases` + `2026-11-17-docente-mensajes-y-siagie` | 8 | `RC03`, `RC08`, `AC06`, `AC07`, `ADR-006`, `ADR-008` |
| `openspec/specs/asistencia/spec.md` | *(Sin cambios nuevos en Fase 2)* | 2 | `RF20`, `HU16`, `RC08`, `AC01`, `AC04` |

---

## 5. Evidencia de verificación al cierre

| Verificación | Comando | Resultado observado |
|---|---|---|
| Auditoría automática | `python .agents/skills/cierre-fase-tdd/scripts/auditar_estado_fase.py --estricto` | Código de salida `0` · **0 hallazgos** de nomenclatura, `ADR-008`, TDD, trazabilidad o CRLF |
| Backend contractual (`pytest`) | `cd backend && python -m pytest -q` | **28 passed** (`2.38s`) · `OPENAPI_SYNC: True` (`36` rutas) |
| Lint frontend | `cd frontend && npm run lint` | `eslint .` sin errores ni advertencias |
| Compilación frontend | `cd frontend && npm run build` | `tsc -b && vite build` exitoso (`429.31 kB`, gzip `112.66 kB`, `3.95s`) |
| Pruebas frontend | `cd frontend && npx vitest run` | **40 archivos de prueba, 112 pruebas aprobadas** (`25.27s`) |
| Validación OpenSpec | `openspec validate --specs --strict` | **6/6** specs válidos (`40` requirements consolidados, `0` cambios sin archivar) |
| Verificación en vivo (HTTP proxy) | `uvicorn` `:8000` + `vite` `:5173` vía `urllib` | **13/13** peticiones `GET`/`POST` en vivo (`200`/`201`) sobre `/nota-del-dia`, `/siagie` y `/api/v1/*` docentes |

---

## 6. Limitaciones conocidas y entrada a la siguiente fase

1. **Bloqueo externo SIAGIE (`RC06`) y datos stub**: el backend continúa devolviendo respuestas contractuales stub en memoria/catálogo demo sin PostgreSQL ni plantilla oficial `.xlsx` del MINEDU; las herramientas `ruff` e `import-linter` permanecen pendientes de configurar en `backend/pyproject.toml`.
2. **Inspección visual interactiva en navegador**: se validó el servidor en vivo vía proxy HTTP (`13/13` rutas `200`/`201`) y el comportamiento responsivo por pruebas de integración en Vitest/Testing Library; en la máquina local no se abrió sesión manual de Chrome DevTools.
3. **Siguiente fase recomendada (Fase 3 · Portal Auxiliar Frontend + API Contractual Stub)**: implementar las vistas de `Auxiliar` (`asistencia` diaria en un clic `RF19`, aprobación/rechazo de justificaciones en texto `RF20` y alertas por sección) manteniendo intacta la separación modular `ADR-008`.
