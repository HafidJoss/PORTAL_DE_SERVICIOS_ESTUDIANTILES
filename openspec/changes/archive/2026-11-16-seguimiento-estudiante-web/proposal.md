# Proposal

## Why

Tras completar el arranque del frontend (`bootstrap-frontend`) y el flujo de ingreso y preferencias (`identidad-estudiante-web`), las rutas principales del estudiante (`/inicio`, `/cursos`, `/trabajos` y `/asistencia`) continúan mostrando vistas placeholder sin datos reales del alumno. Este cambio implementa el tercer punto del plan frontend para entregar el seguimiento académico y de asistencia diario del estudiante conectado a los contratos OpenAPI ya generados, respetando el alcance `RC08` (solo consulta y marcado de novedades vistas, sin subida de archivos).

## What Changes

- **Inicio del estudiante (`/inicio`)**: Implementar el hero de bienvenida con conteo de novedades sin ver y botón `Marcar todo como visto` (`POST /api/v1/seguimiento/estudiantes/{estudiante_id}/novedades/visto`), junto con selector entre las **3 variantes de tablero** (`A · Feed de novedades`, `B · Resumen por módulos` y `C · Agenda semanal`), filtro de avisos según las preferencias locales configuradas en la cuenta y estado persistido de variante/visita.
- **Mis cursos (`/cursos` y detalle de curso)**: Implementar la grilla de asignaturas (`GET /api/v1/seguimiento/estudiantes/{estudiante_id}/cursos`) con accesos rápidos por curso, y la vista de detalle de curso (`GET /api/v1/seguimiento/estudiantes/{estudiante_id}/cursos/{asignatura_id}`) con sus **4 subpestañas** (`Novedades`, `Trabajos`, `Calificaciones` y `Personas`).
- **Trabajos y pendientes (`/trabajos`)**: Implementar el listado filtrable por pestañas (`Pendientes`, `Entregados`, `Todos`) consumiendo `GET /api/v1/evaluacion/estudiantes/{estudiante_id}/actividades`, con tarjetas expandibles que diferencian trabajos evaluados de sesiones de clase (`nota del día`) y aviso explícito de que las entregas se realizan en clase (`RC08`).
- **Asistencia (`/asistencia`)**: Implementar el selector mensual (septiembre, octubre, noviembre), los 5 KPIs del mes, el calendario semanal de lunes a viernes con códigos `P`, `T`, `F`, `FJ`, `TJ` y `FE`, la leyenda y la lista de incidencias mensuales consumiendo `GET /api/v1/asistencia/estudiantes/{estudiante_id}`.
- **Enrutamiento y frontera modular**: Reemplazar las vistas placeholder de `/inicio`, `/cursos`, `/trabajos` y `/asistencia` en `frontend/src/app/App.tsx` y ubicar en `shared/` la utilidad compartida de preferencias de avisos para evitar acoplamiento directo entre features (`ADR-008`).

## Capabilities

### New Capabilities
- `seguimiento`: Tablero de inicio del estudiante en tres variantes (`A`, `B`, `C`), marcado de novedades vistas, grilla de cursos y detalle de curso con sus cuatro subpestañas (`Novedades`, `Trabajos`, `Calificaciones`, `Personas`).
- `evaluacion`: Consulta de actividades académicas del estudiante en `/trabajos` (`Pendientes`, `Entregados`, `Todos`) diferenciando trabajos y sesiones de clase (`nota del día`), en modo solo consulta sin subida de archivos.
- `asistencia`: Consulta mensual de asistencia del estudiante en `/asistencia` con selector de mes, KPIs, calendario lunes-viernes por códigos (`P/T/F/FJ/TJ/FE`) e incidencias del mes.

### Modified Capabilities
<!-- Ninguna: aún no existen specs archivados en openspec/specs/. -->

## Impact

- **Trazabilidad**:
  - **Historias y requisitos**: `HU10`, `HU12`, `HU16`; `RF01`, `RF04`, `RF20`, `RF23`, `RF26`.
  - **Atributos de calidad y restricciones**: `AC01`, `AC04`, `AC06`, `AC07`; `RC01`, `RC08`.
  - **Decisiones de arquitectura**: `ADR-006` (SPA React + TypeScript + TanStack Query + clientes Orval), `ADR-008` (monolito modular por módulos propietarios: `seguimiento` en nivel compuesto sobre `evaluacion` y `asistencia`).
- **Módulos propietarios**: `seguimiento` (rutas `/inicio` y `/cursos`), `evaluacion` (ruta `/trabajos` y capacidades de actividades), `asistencia` (ruta `/asistencia`).
- **Código y APIs afectadas**:
  - Nuevas features en `frontend/src/features/seguimiento/`, `frontend/src/features/evaluacion/` y `frontend/src/features/asistencia/`, más integración de rutas en `frontend/src/app/App.tsx` y `frontend/src/shared/`.
  - Consumo mediante hooks Orval ya existentes de `GET/POST /api/v1/seguimiento/estudiantes/{estudiante_id}/*`, `GET /api/v1/evaluacion/estudiantes/{estudiante_id}/actividades` y `GET /api/v1/asistencia/estudiantes/{estudiante_id}`. No requiere cambios en `backend/` ni regeneración de OpenAPI.
- **Fuera de alcance (`RC08` y punto 4)**:
  - Subida o entrega de archivos en trabajos (`RC08`).
  - Solicitud o envío de justificaciones de asistencia (pertenece al rol `apoderado`, fuera del alcance de `Estudiante v2`).
  - Vista dedicada de calificaciones completas (`/calificaciones`), mensajes/comunicados del colegio (`/mensajes`) y descarga/vista de libreta oficial (se abordan en el punto 4 del plan).
