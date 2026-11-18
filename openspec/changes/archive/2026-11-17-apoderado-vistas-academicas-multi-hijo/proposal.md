# Proposal

## Why

El Bloque 1 (`apoderado-base-y-selector-hijos`) dejó operativos el selector contextual `Cambiar de menor` y el tablero de inicio familiar en `Portal de Familias`, pero las vistas académicas (`/cursos`, `/cursos/:asignaturaId`, `/calificaciones`, `/trabajos`, `/mensajes`, `/libreta`) siguen mostrando pantallas puente temporales para el rol `Apoderado` y los endpoints estudiantiles del backend aún no diferencian al segundo menor vinculado ni verifican la pertenencia `DA05` cuando consulta un apoderado. Completar este bloque habilita el seguimiento académico integral multi-hijo (`RF04`, `RF08`, `RF15`, `RF22`, `RF23`, `RF24`, `RF25`, `RF27`, `RF28`, `HU06`, `HU10`, `HU12`, `HU15`) respetando `RC08` y `ADR-008`.

## What Changes

- Contextualizar los endpoints estudiantiles existentes en `seguimiento`, `evaluacion` y `reportes` para responder datos diferenciados por `estudiante_id` (`est-demo-1` y `est-demo-2`, incluyendo asignaturas propias por grado y nivel) y validar la pertenencia `DA05` (`403 Problem Details`) mediante el parámetro de consulta opcional `apoderado_id`, sin alterar los contratos ni las pruebas vigentes del rol `Estudiante`.
- Extender `shared/utilidades/sesion.ts` con un resolvedor unificado (`resolverContextoEstudiante`) para obtener `{ estudianteId, apoderadoId }` en `Estudiante` y `Apoderado` (según `hijoActivoId`).
- Generalizar las vistas académicas reales (`CursosVista`, `CursoDetalleVista`, `CalificacionesVista`, `TrabajosVista`, `MensajesVista` y `LibretaVista`) para aceptar `hijoActivoId`, pasar `apoderado_id` en sesión de `Apoderado`, mostrar la referencia al menor seleccionado y mantener `RC08` (sin subida de archivos ni respuesta abierta en `MensajesVista` cuando el mensaje es informativo para familias).
- Reemplazar en `frontend/src/app/aplicacion.tsx` las vistas puente de `/cursos`, `/cursos/:asignaturaId`, `/calificaciones`, `/trabajos`, `/mensajes` y `/libreta` por las vistas reales enlazadas al estado `hijoSeleccionadoId`, manteniendo únicamente el puente de `/asistencia` para el Bloque 3.

## Capabilities

### New Capabilities

<!-- Ninguna capacidad nueva: las cuatro capacidades ya existen en openspec/specs/. -->

### Modified Capabilities

- `seguimiento`: Consulta multi-hijo de cursos y detalle de curso para `Apoderado` con datos diferenciados por menor y validación de pertenencia `DA05`.
- `evaluacion`: Consulta multi-hijo de calificaciones cualitativas, trabajos/sesiones de clase y bandeja de mensajes informativos con confirmación de lectura para `Apoderado` (`RF08`, `RF23`, `RF24`, `RF25`, `RC08`, `DA05`).
- `reportes`: Consulta de libretas trimestrales y generación de URL temporal firmada (`TTL 15 min`, `RC05`) multi-hijo para `Apoderado` (`RF15`, `RF27`, `RF28`, `DA05`).
- `plataforma-web`: Reemplazo de rutas puente académicas de `Apoderado` en el enrutador principal y sincronización de contratos OpenAPI/Orval (`AC04`, `AC06`, `RC03`).

## Impact

- **Backend (`backend/`)**: `app/core/pertenencia.py` (guardia transversal `DA05`), `app/modules/seguimiento/router.py`, `app/modules/evaluacion/router.py`, `app/modules/reportes/router.py`, `backend/openapi.json` y pruebas de contrato por módulo.
- **Frontend (`frontend/src/`)**: `api/generated/` (Orval), `shared/utilidades/sesion.ts`, vistas académicas en `features/seguimiento/`, `features/evaluacion/`, `features/reportes/`, enrutamiento en `app/aplicacion.tsx` y sus pruebas unitarias, de integración y E2E.
- **Fuera de alcance (`RC08`)**: Asistencia detallada y envío de justificaciones escritas del apoderado (reservados para el Bloque 3 `apoderado-asistencia-y-justificaciones`), subida de archivos, chat en tiempo real y pagos.
