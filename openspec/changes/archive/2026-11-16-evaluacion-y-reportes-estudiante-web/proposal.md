# Proposal

## Why

Con las vistas de inicio, cursos, trabajos y asistencia ya cubiertas hasta el punto 3 (`seguimiento-estudiante-web`), las rutas finales del portal estudiantil (`/calificaciones`, `/mensajes` y `/libreta`) aún permanecen como vistas placeholder en `App.tsx`. Este cambio completa el **punto 4** del frontend `Estudiante v2`, conectando calificaciones por competencias (`RVM 094-2020`), bandeja de mensajes con confirmación de lectura y respuestas acotadas en hilo (`RF25`), y consulta/descarga segura de libretas trimestrales (`RC05`) sobre los contratos OpenAPI ya generados.

## What Changes

- **Calificaciones (`/calificaciones`)**: Implementar vista maestro-detalle de calificaciones por asignatura (`GET /api/v1/evaluacion/estudiantes/{estudiante_id}/calificaciones`), mostrando la leyenda `AD/A/B/C`, niveles por competencia en trimestres `I`, `II` y `III*` (indicador preliminar en evaluación según mediana de capacidades, sin promedios vigesimales ni aritméticos), conclusiones descriptivas de trimestres cerrados, listado de calificativos publicados (`trabajo` y `sesion_clase`) y acceso directo hacia `/libreta`.
- **Mensajes (`/mensajes`)**: Implementar bandeja con contador de no leídos, filtros por tipo (`Todos`, `Tareas`, `Recordatorios`, `Observaciones`), vista maestro-detalle responsiva con retorno móvil (`GET /api/v1/evaluacion/estudiantes/{estudiante_id}/mensajes`), confirmación de lectura (`POST /api/v1/evaluacion/mensajes/{mensaje_id}/leer`), visualización del hilo de respuestas, formulario acotado de respuesta dentro del hilo (`POST /api/v1/evaluacion/mensajes/{mensaje_id}/respuestas` conforme a `RF25` y `RC08`, sin archivos adjuntos ni chat en tiempo real) y enlace a `/trabajos` cuando exista `actividad_id`.
- **Libreta de notas (`/libreta`)**: Implementar selector por trimestre (`GET /api/v1/reportes/estudiantes/{estudiante_id}/libretas`), estado informativo cuando el trimestre aún no ha sido publicado por Dirección, vista previa institucional del informe de progreso por áreas y competencias (con marca de competencias transversales y bloque de situación final `PRO`/`PER`/`RR` cuando corresponda), y solicitud de enlace temporal firmado (`TTL 15 min`, `RC05`/`ADR-002`) para descargar el PDF (`GET /api/v1/reportes/estudiantes/{estudiante_id}/libretas/{trimestre_id}/descarga`).
- **Enrutamiento en `App.tsx`**: Reemplazar las vistas placeholder restantes (`/calificaciones`, `/mensajes` y `/libreta`) por sus páginas definitivas dentro de `RequiereSesion` y `PortalLayout`.

## Capabilities

### New Capabilities
- `evaluacion`: Consulta de calificaciones por competencia (`AD/A/B/C`), conclusiones descriptivas, calificativos publicados y mensajería por hilos con confirmación de lectura y respuestas acotadas en `/calificaciones` y `/mensajes`.
- `reportes`: Consulta de libretas trimestrales publicadas, estado de publicación, situación final (`PRO`/`PER`/`RR`) y obtención de URL firmada temporal (`RC05`) para descarga del PDF en `/libreta`.

### Modified Capabilities
<!-- Ninguna: aún no existen specs archivados en openspec/specs/; el detalle de /trabajos vive en el cambio previo seguimiento-estudiante-web. -->

## Impact

- **Trazabilidad**:
  - **Historias y requisitos**: `HU06`, `HU10`, `HU15`; `RF08`, `RF15`, `RF22`, `RF24`, `RF25`, `RF27`, `RF28`.
  - **Atributos de calidad y restricciones**: `AC01`, `AC04`, `AC06`, `AC07`; `RC05` (URLs firmadas de 15 min), `RC08` (sin subida de archivos ni chat en tiempo real).
  - **Decisiones de arquitectura**: `ADR-002` (custodia privada con URLs firmadas), `ADR-006` (SPA React + TypeScript + TanStack Query + clientes Orval), `ADR-008` (features independientes por módulo propietario).
- **Módulos propietarios**: `evaluacion` (`/calificaciones` y `/mensajes`) y `reportes` (`/libreta`).
- **Código y APIs afectadas**:
  - Nuevas vistas y utilidades en `frontend/src/features/evaluacion/` y `frontend/src/features/reportes/`, además del cableado de rutas en `frontend/src/app/App.tsx`.
  - Consumo mediante hooks Orval ya existentes sobre `/api/v1/evaluacion/estudiantes/{estudiante_id}/calificaciones`, `/api/v1/evaluacion/estudiantes/{estudiante_id}/mensajes`, `/api/v1/evaluacion/mensajes/{mensaje_id}/leer`, `/api/v1/evaluacion/mensajes/{mensaje_id}/respuestas`, `/api/v1/reportes/estudiantes/{estudiante_id}/libretas` y `/api/v1/reportes/estudiantes/{estudiante_id}/libretas/{trimestre_id}/descarga`. No requiere cambios en `backend/`.
- **Fuera de alcance (`RC08` y otros roles)**:
  - Subida de archivos o adjuntos en mensajes (`RC08`).
  - Creación de mensajes libres entre estudiantes o chat en tiempo real (`RF25`, `RC08`).
  - Publicación o reapertura de trimestres/libretas (acciones exclusivas de Administrador y Dirección, `RF27`, `RF30`).
  - Generación del Excel o actas para SIAGIE (`RC06`).
