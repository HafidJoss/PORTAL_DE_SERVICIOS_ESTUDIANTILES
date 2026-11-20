# Fase 4 · Portal de Administración (Frontend + API Contractual Stub)

> **Estado:** Completada · **Rama de trabajo:** `dev` · **Fecha de cierre:** 2026-11-20

---

## 1. Resumen ejecutivo y alcance

En esta cuarta fase se implementó de extremo a extremo la experiencia web completa del rol **Administrador (`Portal de Administración`)** basada en [Portal Administrador.dc.html](../../prototipos/Portal%20Administrador.dc.html), activando los últimos cuatro módulos reservados del MVP (`institucion`, `matriculas`, `personas` y `auditoria`) y ampliando el contrato **OpenAPI 3.1** de FastAPI de `39` a `59` rutas sincronizadas automáticamente con Orval (`ADR-006`, `ADR-008`).

### En alcance
- **Bloque 1 (`admin-base-inicio-y-trimestres`):**
  - Perfil demo `Administrador` (`DNI 10456723`, Lic. Marco Ayala Sulca) en `identidad` con `institucion` y `alcance`, shell responsivo (`NAV_ADMIN_ESCRITORIO` / `NAV_ADMIN_MOVIL`, subtítulo `Portal de Administración`) y ficha de configuración en solo lectura sin subida de fotos (`RC07`, `RC08`).
  - Tablero operativo de inicio (`InicioAdminVista`, `/api/v1/institucion/tablero-admin` y `PATCH /solicitudes/{id}/atender`) con 3 KPIs, bandeja filtrable de solicitudes operativas, tarjeta del trimestre actual, avance de cierre por sección (`RF31`, `HU17`) y resumen de cuentas.
  - Gestión del ciclo de vida de trimestres (`TrimestresAdminVista`, `reglas.py` puro + `/api/v1/institucion/trimestres`, `/transicion`, `/publicar-libreta`) cubriendo `Aperturado → En Evaluación → Cierre Preliminar → Cerrado` (`RF05`, `HU09`), publicación oficial de libreta (`RF27`), reapertura excepcional con motivo obligatorio `>= 15` caracteres y autorización UGEL tras Acta SIAGIE (`RF30`) y trazabilidad en `auditoria/registro_stub.py` (`RF18`, `ADR-005`).
- **Bloque 2 (`admin-catalogo-y-matriculas`):**
  - Gestión de catálogo escolar (`CatalogoAdminVista` en 3 pestañas: `Secciones`, `Asignaturas y competencias` CNEB y `Asignaciones docentes`) con reglas puras (`A–P`, bloqueo `409` al eliminar secciones con estudiantes, `RF03`, `HU08`) bajo `/api/v1/institucion/{secciones,asignaturas,asignaciones}`.
  - Gestión de nómina escolar en `matriculas` (`PanelNominaSeccionAdmin`, `matriculas/reglas.py` + `/api/v1/matriculas/{sin-seccion,secciones/{id}/estudiantes,asignar,estudiantes/{id}/mover,estudiantes/{id}/estado}`) con pool `Sin sección` (`RF21`, `HU13`), validación de grado (`422`), movimiento interno/retiro al pool, cambio de estado (`Activo`/`Retirado`/`Trasladado`) y ficha de resumen del estudiante.
- **Bloque 3 (`admin-cuentas-y-bitacora`):**
  - Directorio de `Cuentas y roles` en `personas` (`CuentasAdminVista`, `personas/reglas.py` + `/api/v1/personas/cuentas`, `/restablecer-codigo`, `/estado`) con filtros por estado/rol/búsqueda, validación de DNI único (`409`), generación de códigos de activación de 6 caracteres (`RF04`, `RF14`), protección de cuentas `Administrador` (`403`) y auditoría (`RF18`).
  - `Bitácora de auditoría` en `auditoria` (`BitacoraAdminVista` + `/api/v1/auditoria/eventos` y `/eventos/exportar` CSV UTF-8 con BOM y delimitador `;`, `RF18`, `RF29`, `ADR-005`) reflejando en vivo las mutaciones de todos los módulos, retirando definitivamente las vistas puente de la Fase 4 y cubriendo el recorrido E2E de las 6 pantallas del Administrador.

### Fuera de alcance en esta fase
- Portales restantes del catálogo MVP: `Auxiliar` (`RF19`, `RF20`), `Secretaría Académica` (carga de nómina `.xlsx` `RF21`) y `Dirección` (`RF27`, `RF30`, `RF31`).
- Persistencia en PostgreSQL 16 + Alembic, autenticación Argon2 / cookie `__session` real (`ADR-004`), Cloud Tasks (`ADR-003`), plantilla binaria `.xlsx` del SIAGIE (`RC06`) y subida de fotografías (`RC08`).

---

## 2. Diagnóstico de estado TDD y cobertura de fase

| Categoría | Estado | Detalle observado |
|---|---|---|
| **Contemplado y verificado** | Verde | `67` requirements totales consolidados en `10/10` specs en `openspec/specs/` (`13` cambios archivados, `0` activos sin archivar), respaldados por `80` pruebas `pytest` (`59` rutas OpenAPI) y `145` pruebas `vitest` (`55` archivos). |
| **Puntos sueltos corregidos con TDD** | Resuelto | Se eliminaron 4 `.gitkeep` redundantes en `features/{auditoria,institucion,matriculas,personas}`, se eliminó el acoplamiento entre features `institucion → matriculas` inyectando `renderPanelNomina` desde la capa de composición (`aplicacion.tsx`, cumplimiento estricto `ADR-008`), se agregaron las 10 cabeceras `Spec:` faltantes en pruebas de Fase 4, se resolvió la compatibilidad de `jsdom` (`localStorage` + `AbortSignal`) con Node `v26.13.1`, y se archivaron en orden los 3 cambios OpenSpec de la Fase 4. |
| **Faltante / Diferido a siguiente fase** | Planificado | Configuración de `ruff` e `import-linter` en `backend/pyproject.toml`, persistencia PostgreSQL/Alembic, plantilla binaria `.xlsx` SIAGIE (`RC06`) y portales de `Auxiliar` / `Secretaría Académica` / `Dirección`. |

---

## 3. Arquitectura, módulos y contratos implementados

| Área / Módulo (`ADR-008`) | Archivos principales | Responsabilidad |
|---|---|---|
| `backend/app/modules/identidad/` | `schemas.py`, `router.py` | Perfil demo `Administrador` (`10456723`) con `institucion` y `alcance`. |
| `backend/app/modules/institucion/` | `exceptions.py`, `reglas.py`, `catalogo_stub.py`, `schemas.py`, `router.py` | Reglas puras de trimestres y secciones (`A–P`, eliminación segura), tablero admin, trimestres, secciones, asignaturas CNEB y asignaciones docentes con guardia `403`. |
| `backend/app/modules/matriculas/` | `exceptions.py`, `reglas.py`, `nomina_stub.py`, `schemas.py`, `router.py` | Reglas puras de grado y traslado, pool `Sin sección`, nómina por sección con resumen, asignación, movimiento y cambio de estado con guardia `403`. |
| `backend/app/modules/personas/` | `exceptions.py`, `reglas.py`, `schemas.py`, `router.py` | Reglas puras de DNI único y protección `Administrador`, directorio filtrable, alta/edición, códigos de activación de 6 caracteres y bloqueo/desbloqueo con guardia `403`. |
| `backend/app/modules/auditoria/` | `registro_stub.py`, `schemas.py`, `router.py` | Registro append-only inmutable en memoria alimentado por `institucion`, `matriculas` y `personas`, consulta filtrable y exportación `Bitacora_2026.csv`. |
| `frontend/src/app/` | `aplicacion.tsx`, `pruebas/testE2eRecorridoAdminBase.test.tsx` | Rama `Administrador` sin vistas puente, composición `CatalogoAdminVista` + `PanelNominaSeccionAdmin` (sin acoplar features) y recorrido E2E completo de 6 pantallas. |
| `frontend/src/features/institucion/` | `utilidades/reglasTrimestresAdmin.ts`, `vistas/{inicioAdminVista,trimestresAdminVista,catalogoAdminVista}.tsx`, `componentes/{pestanaSeccionesAdmin,pestanaAsignaturasAdmin,pestanaAsignacionesAdmin}.tsx`, `pruebas/` | Tablero operativo, ciclo de vida de trimestres y catálogo escolar en 3 pestañas. |
| `frontend/src/features/matriculas/` | `componentes/panelNominaSeccionAdmin.tsx`, `pruebas/testIntegracionNominaSeccionAdmin.test.tsx` | Panel `Sin sección`, tabla de estudiantes, resumen desplegable, movimiento y cambio de estado. |
| `frontend/src/features/personas/` | `vistas/cuentasAdminVista.tsx`, `pruebas/testIntegracionCuentasAdminVista.test.tsx` | Gestión de cuentas y roles con código de activación visible y acciones protegidas. |
| `frontend/src/features/auditoria/` | `vistas/bitacoraAdminVista.tsx`, `pruebas/testIntegracionBitacoraAdminVista.test.tsx` | Consulta filtrable `Antes → Después` + IP y descarga `Bitacora_2026.csv`. |

### Comprobación de fronteras (`ADR-008`) y estándares
- Dependencias en frontend: **cero** importaciones cruzadas no autorizadas entre features (`institucion` recibe el panel de `matriculas` vía `renderPanelNomina` inyectado desde `aplicacion.tsx`).
- Cumplimiento de [nomenclatura.md](../06-estandares/nomenclatura.md) y [tdd.md](../06-estandares/tdd.md): **0** hallazgos reportados por `auditar_estado_fase.py --estricto`.

---

## 4. Trazabilidad y especificaciones consolidadas (`OpenSpec`)

Los 3 cambios de la Fase 4 quedaron archivados en `openspec/changes/archive/2026-11-20-*` y consolidados en `openspec/specs/`:

| Spec consolidada | Cambio(s) archivado(s) en Fase 4 | Requirements totales | IDs trazados (`RF`, `HU`, `AC`, `RC`, `ADR`) |
|---|---|---|---|
| `openspec/specs/identidad/spec.md` | `2026-11-20-admin-base-inicio-y-trimestres` | 10 | `RF14`, `AC04`, `RC07`, `RC08` |
| `openspec/specs/institucion/spec.md` | `2026-11-20-admin-base-inicio-y-trimestres` + `2026-11-20-admin-catalogo-y-matriculas` | 5 | `RF03`, `RF05`, `RF18`, `RF27`, `RF30`, `RF31`, `HU08`, `HU09`, `HU17`, `AC04`, `ADR-005`, `ADR-008`, `ADR-009` |
| `openspec/specs/matriculas/spec.md` | `2026-11-20-admin-catalogo-y-matriculas` | 2 | `RF18`, `RF21`, `HU13`, `AC04`, `ADR-008` |
| `openspec/specs/personas/spec.md` | `2026-11-20-admin-cuentas-y-bitacora` | 2 | `RF04`, `RF14`, `RF18`, `AC04`, `ADR-004`, `ADR-005` |
| `openspec/specs/auditoria/spec.md` | `2026-11-20-admin-cuentas-y-bitacora` | 1 | `RF18`, `RF29`, `AC04`, `ADR-005` |
| `openspec/specs/plataforma-web/spec.md` | Los 3 bloques de Fase 4 | 14 | `RC01`, `RC03`, `AC06`, `AC07`, `ADR-006`, `ADR-008` |

---

## 5. Evidencia de verificación al cierre

| Verificación | Comando | Resultado observado |
|---|---|---|
| Auditoría automática | `python .agents/skills/cierre-fase-tdd/scripts/auditar_estado_fase.py --estricto` | Código de salida `0` · **0 hallazgos** de nomenclatura, `ADR-008`, TDD, trazabilidad o CRLF |
| Backend contractual (`pytest`) | `pytest backend/tests` | **80 passed** · `backend/openapi.json` sincronizado (`59` rutas) |
| Lint frontend | `npm --prefix frontend run lint` | `eslint .` sin errores ni advertencias |
| Compilación frontend | `npm --prefix frontend run build` | `tsc -b && vite build` exitoso (`538.20 kB`, gzip `132.77 kB`) |
| Pruebas frontend | `npm --prefix frontend run test` | **55 archivos de prueba, 145 pruebas aprobadas** |
| Validación OpenSpec | `openspec validate --specs --strict` | **10/10** specs válidos (`67` requirements consolidados, `13` cambios archivados, `0` activos) |
| Verificación en vivo (sandbox) | Intento `uvicorn :8000` en sandbox Windows | Bloqueado por restricción de enlace de sockets locales del sandbox; todas las rutas HTTP/ASGI fueron verificadas con `TestClient` real en `pytest` (`80/80`) y recorridos MSW/E2E en `vitest` (`145/145`). |

---

## 6. Limitaciones conocidas y entrada a la siguiente fase

1. **Bloqueo externo SIAGIE (`RC06`) y datos stub**: los 9 módulos MVP del backend operan sobre contratos stub en memoria; `ruff` e `import-linter` permanecen pendientes de configurar en `backend/pyproject.toml`.
2. **Tamaño de bundle Vite**: el bundle principal superó ligeramente `500 kB` (`538.20 kB`, gzip `132.77 kB`); conviene aplicar `React.lazy` por rol/ruta al incorporar los siguientes portales o la fase de optimización.
3. **Siguiente fase recomendada (Fase 5)**: elegir entre **A)** implementar la persistencia real en **PostgreSQL 16 + Alembic + Auth Argon2/JWT (`ADR-004`, `ADR-005`)** ahora que los 9 módulos y los 4 portales con prototipo ya tienen contrato OpenAPI estable, o **B)** completar los 3 roles operativos restantes en frontend (`Auxiliar`, `Secretaría Académica`, `Dirección`) reutilizando los contratos de `institucion`, `matriculas`, `personas` y `auditoria`.
