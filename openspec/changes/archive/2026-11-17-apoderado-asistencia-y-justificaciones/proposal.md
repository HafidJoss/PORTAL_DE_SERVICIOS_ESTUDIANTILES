# Proposal

## Why

Los Bloques 1 y 2 completaron el tablero inicial, el selector contextual multi-hijo y las seis vistas académicas de `Apoderado`, dejando únicamente `/asistencia` como vista puente temporal en `Portal de Familias`. Implementar la consulta mensual multi-hijo y el envío de justificaciones escritas al auxiliar de educación (`RF20`, `HU16`, `RC08`, `DA05`, `AC01`, `AC04`, `AC07`) cierra el alcance completo de la Fase 3 garantizando que solo los apoderados vinculados envíen justificaciones en texto plano sin adjuntos ni alteración del modo solo lectura del rol `Estudiante`.

## What Changes

- Extender `GET /api/v1/asistencia/estudiantes/{estudiante_id}` en `backend/app/modules/asistencia/` para aceptar el parámetro opcional `apoderado_id: str | None = None`, validar pertenencia `DA05` (`403 Problem Details`) mediante `app.core.pertenencia` y devolver registros mensuales diferenciados por estudiante (`est-demo-1` en `3.° B` y `est-demo-2` en `1.° A`) sin modificar los casos vigentes de Fase 1.
- Añadir los esquemas (`JustificacionCreateIn`, `JustificacionOut`) y el endpoint `POST /api/v1/asistencia/apoderados/{apoderado_id}/hijos/{estudiante_id}/justificaciones` en `asistencia`, exigiendo pertenencia `DA05` (`403`), incidencia existente (`404`) y justificable en texto plano (`>= 5` caracteres, `RC08`), devolviendo estado `"en_revision"` (`201`).
- Exportar `backend/openapi.json`, regenerar el cliente Orval en `frontend/src/api/generated/asistencia/` y actualizar la verificación de `39` rutas en `backend/tests/core/test_integracion_salud_y_errores.py`.
- Crear el módulo puro `frontend/src/features/asistencia/utilidades/justificacionesAsistencia.ts` (catálogo de motivos, elegibilidad `T`/`F` sin justificación previa y validación de longitud mínima sin dependencias de React ni DOM).
- Generalizar `frontend/src/features/asistencia/vistas/asistenciaVista.tsx` para aceptar `hijoActivoId?: string | null` mediante `resolverContextoEstudiante`: mantiene la vista estrictamente en solo lectura para `Estudiante` (sin botones ni formularios de justificación) y habilita para `Apoderado` el botón `Justificar`, formulario inline en texto plano (`RC08`, sin `<input type="file">`) y cambio en vivo al alternar de menor.
- Reemplazar en `frontend/src/app/aplicacion.tsx` el último puente de `/asistencia` por `<AsistenciaVista usuario={usuario} hijoActivoId={hijoActivo?.estudiante_id} />` y retirar `VistaPuenteApoderado`.

## Capabilities

### New Capabilities

<!-- Ninguna capacidad nueva: ambas capacidades ya existen en openspec/specs/. -->

### Modified Capabilities

- `asistencia`: Consulta multi-hijo de asistencia mensual e incidencias y envío escrito de justificaciones exclusivas del apoderado (`RF20`, `HU16`, `DA05`, `RC08`).
- `plataforma-web`: Activación definitiva de `/asistencia` para `Apoderado` (eliminación de vistas puente restantes), contrato OpenAPI extendido (`39` rutas) y sincronización Orval (`AC04`, `AC06`, `AC07`, `RC03`).

## Impact

- **Backend (`backend/`)**: `app/modules/asistencia/{schemas.py,router.py}`, `tests/asistencia/test_integracion_contrato_asistencia.py`, `tests/core/test_integracion_salud_y_errores.py` y `openapi.json`.
- **Frontend (`frontend/src/`)**: `api/generated/asistencia/` (Orval), `features/asistencia/utilidades/justificacionesAsistencia.ts`, `features/asistencia/vistas/asistenciaVista.tsx`, `features/asistencia/pruebas/`, `app/aplicacion.tsx` y `app/pruebas/`.
- **Fuera de alcance (`RC08`)**: Subida o adjunto de certificados médicos u otros archivos en línea (se entregan presencialmente al auxiliar), aprobación/rechazo de justificaciones por parte del auxiliar (Fase posterior del auxiliar) y registro diario masivo docente/auxiliar (`RF19`).
