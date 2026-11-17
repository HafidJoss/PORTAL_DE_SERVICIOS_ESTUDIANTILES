# Design

## Context

Este cambio completa las vistas finales del portal estudiante tras `bootstrap-frontend`, `identidad-estudiante-web` y `seguimiento-estudiante-web` (`proposal.md` detalla la motivación y trazabilidad: `HU06`, `HU10`, `HU15`, `RF08`, `RF15`, `RF22`, `RF24`, `RF25`, `RF27`, `RF28`, `RC05`, `RC08`, `ADR-002`, `ADR-006`, `ADR-008`).

Los contratos OpenAPI, esquemas Pydantic stub y hooks Orval para `/calificaciones`, `/mensajes` y `/libreta` ya están generados en `frontend/src/api/generated/evaluacion/evaluacion.ts` y `frontend/src/api/generated/reportes/reportes.ts`. Al tratarse exclusivamente de interfaz web, no se modifican `backend/`, modelos SQLAlchemy ni migraciones PostgreSQL (`ADR-007` no afectado).

## Goals / Non-Goals

**Goals:**
- Implementar `CalificacionesPage`, `MensajesPage` (en `frontend/src/features/evaluacion/`) y `LibretaPage` (en `frontend/src/features/reportes/`).
- Reemplazar las vistas placeholder de `/calificaciones`, `/mensajes` y `/libreta` en `frontend/src/app/App.tsx`.
- Mantener la independencia estricta entre módulos (`evaluacion` y `reportes` sin imports mutuos ni hacia `seguimiento`/`asistencia`/`identidad`, conforme a `ADR-008` y `arquitectura-inicial.md`).
- Asegurar TDD por capas (`Vitest + React Testing Library + MSW`) conforme a `docs/06-estandares/tdd.md`.

**Non-Goals:**
- Modificar `backend/`, generar archivos PDF reales en servidor ni alterar `openapi.json`.
- Agregar subida de archivos adjuntos o creación de conversaciones libres entre pares (`RC08`).
- Implementar publicación/reapertura de trimestres o actas SIAGIE (roles Dirección/Administrador/Secretaría).

## Decisions

### D1. Estructura modular y fronteras (`ADR-008`)

- **`frontend/src/features/evaluacion/`**:
  - `filtrosCalificaciones.ts`: funciones puras para definir la leyenda cualitativa (`AD`, `A`, `B`, `C`), seleccionar asignatura activa y derivar mini-niveles por curso.
  - `CalificacionesPage.tsx`: vista maestro-detalle responsiva (en escritorio lista lateral + detalle; en móvil alterna lista/detalle con botón de retorno) consumiendo `useObtenerCalificacionesEstudianteApiV1EvaluacionEstudiantesEstudianteIdCalificacionesGet`, tabla de competencias `I / II / III*` con `BadgeNivel` (marcando `III*` preliminar cuando `en_evaluacion_t3 === true`), conclusiones descriptivas y calificativos publicados (`trabajo` vs `sesion_clase`), sin promedios aritméticos ni vigesimales (`RVM 094-2020`), más navegación hacia `/libreta`.
  - `filtrosMensajes.ts`: funciones puras para filtrar mensajes por pestaña (`todos`, `tareas`, `recordatorios`, `observaciones`), mapear etiquetas/colores según `MensajeOutTipo` (`Tarea`, `Recordatorio`, `ObsPos`, `ObsMej`) y validar la longitud de respuesta en hilo (`1..2000` caracteres tras `trim()`).
  - `MensajesPage.tsx`: bandeja maestro-detalle con retorno móvil, contador `sin_leer`, botón explícito `Confirmar lectura`, hilo cronológico de respuestas y formulario acotado de respuesta sin carga de archivos (`RC08`), además de enlace hacia `/trabajos` cuando `actividad_id` exista.
- **`frontend/src/features/reportes/`**:
  - `resumenLibreta.ts`: funciones puras para calcular el resumen de publicación (`X de Y`), elegir por defecto el último trimestre publicado (o el primero disponible), interpretar códigos de situación final (`PRO`, `PER`, `RR`) y formatear la vigencia del enlace firmado en minutos.
  - `LibretaPage.tsx`: selector lateral/superior de trimestres, vista de trimestre no publicado con enlace hacia `/calificaciones`, documento institucional con áreas, competencias (distinguiendo `es_transversal`), niveles, conclusiones, bloque de situación final y descarga PDF por URL firmada temporal (`RC05`, `ADR-002`).

**Comprobación de fronteras (`arquitectura-inicial.md`):**
- `evaluacion` y `reportes` consumen únicamente `shared/components/`, `shared/utils/sesion.ts` y `api/generated/`. No existe ninguna dependencia directa ni transitiva entre `features/evaluacion` y `features/reportes`.

### D2. Hooks Orval, manejo de caché y descarga por URL firmada (`ADR-002`, `ADR-006`)

Se consumen directamente los artefactos generados por Orval:
- `useObtenerCalificacionesEstudianteApiV1EvaluacionEstudiantesEstudianteIdCalificacionesGet`
- `useListarMensajesEstudianteApiV1EvaluacionEstudiantesEstudianteIdMensajesGet`
- `useConfirmarLecturaMensajeApiV1EvaluacionMensajesMensajeIdLeerPost`
- `useResponderMensajeApiV1EvaluacionMensajesMensajeIdRespuestasPost`
- `useObtenerLibretasEstudianteApiV1ReportesEstudiantesEstudianteIdLibretasGet`
- `obtenerUrlDescargaLibretaApiV1ReportesEstudiantesEstudianteIdLibretasTrimestreIdDescargaGet`

**Decisión para confirmar lectura y responder hilos en `MensajesPage`:**
- Al confirmar lectura (`POST .../leer`), se actualiza la caché de la lista de mensajes marcando `lectura_confirmada: true`, `no_leido: false` y decrementando `sin_leer` (mínimo 0) si estaba sin leer, seguido de `invalidateQueries` sobre la bandeja.
- Al enviar una respuesta (`POST .../respuestas`), se valida el texto localmente (`1..2000` caracteres); si tiene éxito se añade `RespuestaHiloOut` al mensaje activo, se limpia el campo y se invalida la consulta; si falla, se conserva el borrador ingresado para evitar pérdida de texto.

**Decisión para la descarga PDF en `LibretaPage` (`RC05`):**
- En lugar de consultar `/descarga` automáticamente al cargar la vista (lo que consumiría enlaces firmados innecesarios y dispararía logs de exportación prematuros bajo `ADR-005`), se envuelve `obtenerUrlDescargaLibretaApiV1ReportesEstudiantesEstudianteIdLibretasTrimestreIdDescargaGet` en `useMutation` ejecutado solo al pulsar `Descargar PDF`. Al recibir `UrlDescargaOut`, se muestra el enlace temporal (`url_firmada` + `nombre_archivo` + vigencia calculada de `15 min` / `900 s`) listo para descargar en pestaña segura (`rel="noopener noreferrer"`).

**Alternativa descartada:** Usar `useObtenerUrlDescargaLibreta...` con `enabled: true` al abrir el trimestre. Se descartó porque generaría una URL firmada en cada cambio de pestaña incluso sin intención de descarga y contraviene la auditoría de exportaciones (`ADR-005`).

### D3. Restricción de perfil estudiante y enrutamiento

Las tres páginas resuelven `estudianteId` mediante `resolverEstudianteId(usuario)` en `frontend/src/shared/utils/sesion.ts`, deshabilitan las queries cuando está vacío y muestran `EstadoVacio` para roles sin perfil de estudiante asociado. En `frontend/src/app/App.tsx`, se reemplazan `/calificaciones`, `/mensajes` y `/libreta` preservando el wrapper `RequiereSesion` y `PortalLayout`.

### D4. Plan de pruebas por capa (TDD)

1. **Pruebas unitarias de lógica pura (`Vitest`, sin DOM ni red):**
   - `frontend/src/features/evaluacion/__tests__/filtrosCalificaciones.test.ts`: leyenda `AD/A/B/C`, derivación de mini-niveles y resolución de curso seleccionado.
   - `frontend/src/features/evaluacion/__tests__/filtrosMensajes.test.ts`: filtrado por pestaña (`todos`, `tareas`, `recordatorios`, `observaciones`), etiquetas de tipo y validación de longitud `1..2000`.
   - `frontend/src/features/reportes/__tests__/resumenLibreta.test.ts`: conteo de publicadas, selección por defecto del último trimestre publicado, formato de `SituacionFinalCodigo` (`PRO`/`PER`/`RR`) y minutos de expiración.
2. **Pruebas de componentes e integración HTTP simulada (`Vitest` + `React Testing Library` + `MSW`):**
   - `CalificacionesPage.test.tsx`: cambio de curso, niveles `I/II/III*`, conclusiones descriptivas, calificativos publicados, estado sin calificativos, error con reintento, enlace `/libreta`, ausencia de promedios vigesimales y bloqueo no estudiante.
   - `MensajesPage.test.tsx`: filtros por categoría, retorno móvil, `Confirmar lectura` (`POST .../leer`) reduciendo `sin_leer`, envío de respuesta en hilo (`POST .../respuestas`) sin `input[type="file"]` (`RC08`), validación local y error de envío conservando texto, y enlace `/trabajos`.
   - `LibretaPage.test.tsx`: cambio entre trimestre publicado y pendiente, áreas/transversales/situación final, botón `Descargar PDF` solicitando `GET .../descarga` solo bajo demanda, visualización del enlace firmado `TTL 15 min`, error al obtener URL firmada y restricción no estudiante.
3. **Pruebas de enrutamiento integral (`frontend/src/app/__tests__/App.test.tsx`):**
   - Navegación autenticada hacia `/calificaciones`, `/mensajes` y `/libreta` reemplazando definitivamente las vistas placeholder.

## Risks / Trade-offs

- **[Bloqueo de pop-ups al descargar PDF] -> Mitigation:** Renderizar un enlace explícito `<a>` con `download` y `target="_blank" rel="noopener noreferrer"` al obtener `url_firmada` evita depender únicamente de `window.open()` programático, que los navegadores suelen bloquear y es complejo de probar en jsdom.
- **[Diferencia entre el prototipo estático antiguo (sin respuestas) y el contrato OpenAPI (`RF25`)] -> Mitigation:** Se respeta la especificación vigente (`openspec/config.yaml` y `evaluacion/router.py`), habilitando respuestas acotadas en el hilo docente sin chat en tiempo real ni carga de archivos (`RC08`).
