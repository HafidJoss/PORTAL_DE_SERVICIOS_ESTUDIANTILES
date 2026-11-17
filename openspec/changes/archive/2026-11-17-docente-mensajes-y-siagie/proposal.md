# Proposal

## Why

Con el tablero inicial (`docente-base-y-seguimiento`) y la evaluación continua de clases y cierre (`docente-evaluacion-y-clases`) ya operativos para el rol `Docente`, quedan dos pantallas puente finales del [Portal Docente.dc.html](../../../prototipos/Portal%20Docente.dc.html): la mensajería saliente hacia secciones o familias (`Mensajes`) y la preparación de exportaciones oficiales (`Exportar al SIAGIE` y `Acta preliminar`). Esta tercera parte completa el 100 % de las vistas del Portal Docente cerrando la Fase 2 del proyecto sin depender aún de la plantilla binaria final de PostgreSQL ni de archivos adjuntos (`RC06`, `RC08`).

## What Changes

- **Envío de mensajes docentes y bandeja de enviados (`evaluacion`)**:
  - Exponer en `backend/app/modules/evaluacion/` los endpoints contractuales `GET /docentes/{docente_id}/mensajes` y `POST /docentes/{docente_id}/mensajes` para consultar el catálogo de destinatarios (sección completa o estudiante + apoderado) junto al historial cronológico de enviados, y registrar envíos de tipo `Tarea` o `Recordatorio` sin archivos adjuntos ni chat en tiempo real (`RF25`, `HU15`, `RC08`).
  - Implementar `MensajesDocenteVista` (`frontend/src/features/evaluacion/vistas/mensajesDocenteVista.tsx`) con selector de tipo, sección, destinatario opcional por estudiante, validaciones de asunto/texto y bandeja de mensajes enviados.
- **Exportación SIAGIE y Actas preliminares por trimestre (`reportes`)**:
  - Exponer en `backend/app/modules/reportes/` los endpoints contractuales `GET /docentes/{docente_id}/siagie` (estado de confirmación `competencias_confirmadas / 4` por trimestre y sección) y `POST /docentes/{docente_id}/siagie/{seccion_id}/descarga` (URL temporal firmada con TTL de 15 minutos según `RC05` para `excel_siagie` o `acta_preliminar`, bloqueando trimestres en evaluación con competencias sin confirmar -> `400 ErrorAplicacion`).
  - Implementar en `frontend/src/features/reportes/utilidades/estadoSiagie.ts` las reglas puras de disponibilidad y ordenamiento por trimestre/sección y `ExportarSiagieVista` (`frontend/src/features/reportes/vistas/exportarSiagieVista.tsx`) con selector `I Trim. / II Trim. / III Trim.`, descarga segura y redirección hacia `/cursos/:seccionId?tab=cierre` si faltan confirmaciones (`RF16`, `HU07`, `RC05`, `RC06`).
  - **Declaración explícita de bloqueo externo (`RC06`):** el mapeo exacto de celdas sobre la plantilla `.xlsx` oficial del SIAGIE no está definido en la documentación vigente porque depende del archivo que entregue el colegio en el despliegue; en este cambio de Fase 2 se entrega el contrato OpenAPI stub con URL firmada temporal (`UrlDescargaOut`) y validación previa de cierre, sin inventar el layout binario del MINEDU.
- **Enrutamiento final y OpenAPI (`plataforma-web`)**:
  - Reemplazar las vistas puente de `/mensajes` y `/siagie` por `MensajesDocenteVista` y `ExportarSiagieVista` para `Docente` en `frontend/src/app/aplicacion.tsx`, eliminando el componente temporal `VistaPuenteDocente`.
  - Registrar las 4 nuevas rutas en `backend/openapi.json` y sincronizar los clientes TypeScript con Orval.
- **Fuera de alcance (`RC08`, fases siguientes):**
  - Adjuntos en mensajes, chat en tiempo real e integración por API con SIAGIE (`RC06`, `RC08`).
  - Generación física de archivos `.xlsx` / `.pdf` desde PostgreSQL y Object Storage (Fase 5).

## Capabilities

### New Capabilities

*(Ninguna: amplía las capacidades vigentes `evaluacion`, `reportes` y `plataforma-web` en `openspec/specs/`.)*

### Modified Capabilities

- `evaluacion`: envío docente de tareas y recordatorios a sección o estudiante/apoderado e historial cronológico de enviados sin adjuntos ni chat libre (`RF25`, `HU15`, `RC08`, `AC04`).
- `reportes`: verificación trimestral de cierre por sección para exportación al SIAGIE y emisión de URL firmada temporal (15 min) para Excel SIAGIE y Acta preliminar (`RF16`, `HU07`, `RC05`, `RC06`, `ADR-002`).
- `plataforma-web`: activación de `/mensajes` y `/siagie` para `Docente`, retiro de `VistaPuenteDocente` y ampliación OpenAPI bajo `/api/v1` (`RC03`, `AC06`).

## Impact

- **IDs atendidos:** `RF16`, `RF25`, `HU07`, `HU15`, `AC01`, `AC04`, `AC06`, `RC03`, `RC05`, `RC06`, `RC08`, `ADR-002`, `ADR-008`.
- **Backend (`backend/`):** `app/modules/evaluacion/{schemas.py,router.py}`, `app/modules/reportes/{schemas.py,router.py}`, `openapi.json`, `tests/core/test_integracion_salud_y_errores.py`, `tests/evaluacion/test_integracion_contrato_evaluacion.py` y `tests/reportes/test_integracion_contrato_reportes.py`.
- **Frontend (`frontend/src/`):** regeneración Orval en `api/generated/`, nuevos archivos en `features/evaluacion/{utilidades,vistas,pruebas}/` y `features/reportes/{utilidades,vistas,pruebas}/`, y limpieza de rutas en `app/aplicacion.tsx` y `app/pruebas/testE2eRecorridoDocenteBase.test.tsx`.
- **Frontera `ADR-008`:** `evaluacion` y `reportes` no se importan entre sí ni en backend ni en frontend; `ExportarSiagieVista` navega por ruta (`/cursos/:id?tab=cierre`).
