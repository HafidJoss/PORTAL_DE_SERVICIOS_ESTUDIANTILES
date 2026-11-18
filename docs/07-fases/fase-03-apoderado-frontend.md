# Fase 3 · Portal Apoderado / Portal de Familias (Frontend + API Contractual Stub)

> **Estado:** Completada · **Rama de trabajo:** `dev` · **Fecha de cierre:** 2026-11-17

---

## 1. Resumen ejecutivo y alcance

En esta tercera fase se implementó de extremo a extremo la experiencia web completa del rol **Apoderado (`Portal de Familias`)** basada en [Portal Apoderado.dc.html](../../prototipos/Portal%20Apoderado.dc.html), habilitando la operación multi-hijo contextual sobre `MarcoPortal` y ampliando los contratos **OpenAPI 3.1** de FastAPI sincronizados con Orval (`ADR-006`) y aislamiento modular (`ADR-008`).

### En alcance
- Soporte multi-rol y multi-hijo en `identidad` (`HijoVinculadoOut`, `apoderado_id`, `hijos_vinculados` para DNI `40871256`) y utilidades compartidas (`resolverApoderadoId`, `resolverHijoActivo`, `resolverContextoEstudiante`).
- Selector contextual `Cambiar de menor` (`SelectorContextoHijo`) integrado en `MarcoPortal` tanto en escritorio (`264px` lateral) como en vista móvil (`360px` superior compacta, `AC07`), además de perfil y lista de menores vinculados en solo lectura dentro de `ConfiguracionVista` sin subida de fotos (`RC08`).
- Tablero de inicio del apoderado (`InicioApoderadoVista`, `BandejaApoderado`, `filtrosBandejaApoderado.ts`) con filtros (`Todos`, `No leídos`, `Institución`, `Docentes`), confirmación de lectura dirigida a Dirección (`RF25`), próximas entregas y resumen de asistencia del menor seleccionado.
- Ampliación del backend contractual (`backend/app/core/pertenencia.py` + `seguimiento`, `evaluacion`, `reportes`, `asistencia`) de `36` a `39` rutas bajo `/api/v1`, diferenciando al segundo menor (`est-demo-2` en `1.° de Secundaria A`) frente a `est-demo-1` (`3.° de Secundaria B`) y aplicando control de pertenencia `DA05` (`403 Problem Details`) sin alterar los contratos de `Estudiante`.
- Generalización multi-hijo de las siete vistas finales en `Portal de Familias` (`/inicio`, `/cursos`, `/cursos/:asignaturaId`, `/calificaciones`, `/trabajos`, `/mensajes` en modo informativo sin respuesta abierta, `/libreta` con enlace firmado TTL `15 min` `RC05` y `/asistencia` con envío de justificaciones escritas en texto plano `>= 5` caracteres `RF20` sin subida de archivos `RC08`) y retiro completo de vistas puente temporales en `aplicacion.tsx`.

### Fuera de alcance en esta fase
- Portales restantes del catálogo MVP: `Portal Auxiliar` (registro diario `RF19` y aprobación/rechazo de justificaciones `RF20` planificados para Fase 4), `Dirección`, `Secretaría Académica` y `Administrador`.
- Persistencia en PostgreSQL 16 + Alembic, autenticación Argon2 / cookie `__session` real (`ADR-004`), bitácora inmutable `ADR-005` y plantilla binaria oficial `.xlsx` del SIAGIE (`RC06`).
- Subida de archivos (certificados médicos, tareas, fotos de perfil, adjuntos en mensajes), chat abierto en tiempo real y requisitos `Pospuesto` (`RC08`).

---

## 2. Diagnóstico de estado TDD y cobertura de fase

| Categoría | Estado | Detalle observado |
|---|---|---|
| **Contemplado y verificado** | Verde | `52` requirements totales consolidados en `openspec/specs/` (`seguimiento` 13, `evaluacion` 13, `plataforma-web` 11, `identidad` 8, `reportes` 4, `asistencia` 3), respaldados por `34` pruebas `pytest` (`39` rutas OpenAPI), `134` pruebas `vitest` (`46` archivos) y `11/11` peticiones HTTP en vivo. |
| **Puntos sueltos corregidos con TDD** | Resuelto | Se implementó la guardia transversal `DA05` en `backend/app/core/pertenencia.py` evitando duplicación entre módulos (`ADR-008`), se corrigió el aislamiento por estudiante en caché de descargas de `LibretaVista` (`${estudianteId}-${trimestreId}`), se restringió el indicador `"Justificación enviada · en revisión"` a incidencias `T`/`F` pendientes diferenciándolas de `FJ`/`TJ` aprobadas, y se archivaron los 3 bloques OpenSpec de Fase 3 en `openspec/specs/`. |
| **Faltante / Diferido a siguiente fase** | Planificado | Configuración de `ruff` e `import-linter` en `backend/pyproject.toml`, persistencia PostgreSQL/Alembic, plantilla binaria `.xlsx` SIAGIE (`RC06`) y portales de `Auxiliar` / `Dirección` / `Secretaría` / `Administrador`. |

---

## 3. Arquitectura, módulos y contratos implementados

| Área / Módulo (`ADR-008`) | Archivos principales | Responsabilidad |
|---|---|---|
| `backend/app/core/` | `pertenencia.py` | Guardia transversal `validar_pertenencia_apoderado` (`DA05`, respuesta `403 Problem Details`) compartida sin acoplar módulos de negocio entre sí. |
| `backend/app/modules/` | `identidad/{schemas,router}.py`, `seguimiento/{schemas,router}.py`, `evaluacion/router.py`, `reportes/router.py`, `asistencia/{schemas,router}.py` | Contratos multi-hijo (`39` rutas totales en `backend/openapi.json`), bandeja familiar, confirmación de lectura, consultas diferenciadas por menor con `apoderado_id` opcional y envío escrito de justificaciones `RF20`. |
| `frontend/src/app/` | `aplicacion.tsx`, `pruebas/{testE2eRecorridoApoderadoBase,testE2eRecorridoApoderadoAcademico,testE2eRecorridoApoderadoAsistencia}.test.tsx` | Enrutamiento multi-rol completo para `Apoderado` conectado a `hijoSeleccionadoId` (sin vistas puente temporales) y tres recorridos E2E autenticados. |
| `frontend/src/shared/` | `componentes/{marcoPortal,selectorContextoHijo}.tsx`, `utilidades/sesion.ts`, `pruebas/` | Selector contextual `Cambiar de menor` escritorio/móvil y resolvedores `resolverApoderadoId`, `resolverHijoActivo` y `resolverContextoEstudiante`. |
| `frontend/src/features/identidad/` | `vistas/configuracionVista.tsx`, `pruebas/testIntegracionConfiguracionVista.test.tsx` | Perfil familiar y tarjeta `Menores vinculados` en solo lectura sin `<input type="file">` (`RC08`). |
| `frontend/src/features/seguimiento/` | `vistas/{inicioApoderadoVista,cursosVista,cursoDetalleVista}.tsx`, `componentes/bandejaApoderado.tsx`, `utilidades/filtrosBandejaApoderado.ts`, `pruebas/` | Tablero de inicio del apoderado, bandeja filtrable y consulta de cursos/detalle contextualizados al menor activo. |
| `frontend/src/features/evaluacion/` | `vistas/{calificacionesVista,trabajosVista,mensajesVista}.tsx`, `pruebas/` | Calificaciones cualitativas (`AD/A/B/C`), trabajos/sesiones y mensajes informativos con confirmación de lectura y sin respuesta abierta ni adjuntos (`RC08`). |
| `frontend/src/features/reportes/` | `vistas/libretaVista.tsx`, `pruebas/testIntegracionLibretaVista.test.tsx` | Consulta trimestral multi-hijo y emisión bajo demanda de enlace temporal firmado TTL `15 min` (`RC05`, `ADR-002`). |
| `frontend/src/features/asistencia/` | `utilidades/justificacionesAsistencia.ts`, `vistas/asistenciaVista.tsx`, `pruebas/` | Consulta mensual multi-hijo y formulario escrito de justificación al auxiliar exclusivo de `Apoderado` (`RF20`, `RC08`). |

### Comprobación de fronteras (`ADR-008`) y estándares
- Dependencias entre módulos: únicamente `seguimiento` importa componentes/utilidades de `evaluacion`; la validación `DA05` en backend reside en infraestructura transversal (`app/core/pertenencia.py`), manteniendo cero ciclos y aislamiento estricto de los módulos de nivel 0 (`identidad`, `evaluacion`, `asistencia`, `reportes`).
- Cumplimiento de [nomenclatura.md](../06-estandares/nomenclatura.md) y [tdd.md](../06-estandares/tdd.md): **0** hallazgos reportados por `auditar_estado_fase.py --estricto`.

---

## 4. Trazabilidad y especificaciones consolidadas (`OpenSpec`)

Los 3 cambios de la Fase 3 quedaron archivados en `openspec/changes/archive/2026-11-17-*` y consolidados en `openspec/specs/`:

| Spec consolidada | Cambio(s) archivado(s) en Fase 3 | Requirements totales | IDs trazados (`RF`, `HU`, `AC`, `RC`, `DA`, `ADR`) |
|---|---|---|---|
| `openspec/specs/identidad/spec.md` | `2026-11-17-apoderado-base-y-selector-hijos` | 8 | `RF01`, `RF14`, `RC03`, `RC07`, `RC08`, `AC04` |
| `openspec/specs/seguimiento/spec.md` | `2026-11-17-apoderado-base-y-selector-hijos` + `2026-11-17-apoderado-vistas-academicas-multi-hijo` | 13 | `RF01`, `RF04`, `RF25`, `HU12`, `DA05`, `RC08`, `AC01` |
| `openspec/specs/evaluacion/spec.md` | `2026-11-17-apoderado-vistas-academicas-multi-hijo` | 13 | `RF08`, `RF22`, `RF23`, `RF24`, `RF25`, `HU06`, `HU10`, `HU15`, `DA05`, `RC08` |
| `openspec/specs/reportes/spec.md` | `2026-11-17-apoderado-vistas-academicas-multi-hijo` | 4 | `RF15`, `RF27`, `RF28`, `RC05`, `DA05`, `ADR-002` |
| `openspec/specs/asistencia/spec.md` | `2026-11-17-apoderado-asistencia-y-justificaciones` | 3 | `RF20`, `HU16`, `DA05`, `RC08`, `AC01`, `AC04` |
| `openspec/specs/plataforma-web/spec.md` | `2026-11-17-apoderado-base-y-selector-hijos` + `2026-11-17-apoderado-vistas-academicas-multi-hijo` + `2026-11-17-apoderado-asistencia-y-justificaciones` | 11 | `RC01`, `RC03`, `AC04`, `AC06`, `AC07`, `DA05`, `ADR-006`, `ADR-008` |

---

## 5. Evidencia de verificación al cierre

| Verificación | Comando | Resultado observado |
|---|---|---|
| Auditoría automática | `python .agents/skills/cierre-fase-tdd/scripts/auditar_estado_fase.py --estricto` | Código de salida `0` · **0 hallazgos** de nomenclatura, `ADR-008`, TDD, trazabilidad o CRLF |
| Backend contractual (`pytest`) | `cd backend && python -m pytest -q` | **34 passed** · `OPENAPI_SYNC: True` (`39` rutas) |
| Lint frontend | `cd frontend && npm run lint` | `eslint .` sin errores ni advertencias |
| Compilación frontend | `cd frontend && npm run build` | `tsc -b && vite build` exitoso (`456.01 kB`, gzip `117.39 kB`) |
| Pruebas frontend | `cd frontend && npx vitest run` | **46 archivos de prueba, 134 pruebas aprobadas** |
| Validación OpenSpec | `openspec validate --specs --strict` | **6/6** specs válidos (`52` requirements consolidados, `0` cambios sin archivar) |
| Verificación en vivo (HTTP proxy) | `uvicorn` `:8000` + `vite` `:5173` vía `urllib` | **11/11** peticiones `GET`/`POST` en vivo (`200`/`201`/`403`) sobre login familiar, inicio multi-hijo, confirmación de lectura, vistas académicas, asistencia, justificación escrita y proxy `/asistencia` |

---

## 6. Limitaciones conocidas y entrada a la siguiente fase

1. **Bloqueo externo SIAGIE (`RC06`) y datos stub**: el backend continúa respondiendo datos contractuales stub en memoria/catálogo demo sin PostgreSQL ni plantilla oficial `.xlsx` del MINEDU; `ruff` e `import-linter` permanecen pendientes de configurar en `backend/pyproject.toml`.
2. **Inspección visual interactiva en navegador**: se validaron los servidores reales en vivo vía proxy HTTP (`11/11` rutas) y el comportamiento responsivo por pruebas de integración en Vitest/Testing Library (`1280px` y `360px`); en el entorno local no se ejecutó sesión manual interactiva de Chrome DevTools.
3. **Siguiente fase recomendada (Fase 4 · Portal Auxiliar / Portales de Gestión Frontend + API Contractual Stub)**: implementar la vista operativa del `Auxiliar` (registro diario rápido `RF19`, bandeja de aprobación/rechazo de justificaciones recibidas desde `Apoderado` `RF20`) y/o los módulos de gestión institucional (`Secretaría`, `Dirección`, `Administrador`) preservando `ADR-008`.
