# Tasks

## 1. Utilidades puras de evaluación y reportes (TDD)

- [x] 1.1 **Rojo — Lógica pura de calificaciones (`filtrosCalificaciones`)**: Escribir pruebas unitarias en `frontend/src/features/evaluacion/__tests__/filtrosCalificaciones.test.ts` cubriendo leyenda `AD/A/B/C`, derivación de mini-niveles por asignatura y selección segura de curso activo; confirmar fallo inicial (`npx vitest run src/features/evaluacion`).
- [x] 1.2 **Verde y Refactor — Utilidades de calificaciones**: Implementar `frontend/src/features/evaluacion/filtrosCalificaciones.ts` y verificar el paso de `filtrosCalificaciones.test.ts` (`npx vitest run src/features/evaluacion`).
- [x] 1.3 **Rojo — Lógica pura de mensajes (`filtrosMensajes`)**: Escribir pruebas unitarias en `frontend/src/features/evaluacion/__tests__/filtrosMensajes.test.ts` cubriendo filtrado por pestaña (`todos`, `tareas`, `recordatorios`, `observaciones`), metadatos visuales por `MensajeOutTipo` y validación de longitud `1..2000` para respuestas; confirmar fallo inicial (`npx vitest run src/features/evaluacion`).
- [x] 1.4 **Verde y Refactor — Utilidades de mensajes**: Implementar `frontend/src/features/evaluacion/filtrosMensajes.ts` y verificar el paso de `filtrosMensajes.test.ts` (`npx vitest run src/features/evaluacion`).
- [x] 1.5 **Rojo — Lógica pura de libreta (`resumenLibreta`)**: Escribir pruebas unitarias en `frontend/src/features/reportes/__tests__/resumenLibreta.test.ts` cubriendo conteo de trimestres publicados, selección por defecto del último trimestre publicado, formato de situación final (`PRO`/`PER`/`RR`) y cálculo de minutos desde `expira_en_segundos`; confirmar fallo inicial (`npx vitest run src/features/reportes`).
- [x] 1.6 **Verde y Refactor — Utilidades de libreta**: Implementar `frontend/src/features/reportes/resumenLibreta.ts` y verificar el paso de `resumenLibreta.test.ts` (`npx vitest run src/features/reportes`).

## 2. Evaluación web: Calificaciones (`/calificaciones`)

- [x] 2.1 **Rojo — Escenarios de calificaciones (`evaluacion/spec.md`)**: Escribir pruebas con RTL y MSW en `frontend/src/features/evaluacion/__tests__/CalificacionesPage.test.tsx` cubriendo cambio entre asignaturas, niveles `I`/`II`/`III*` con leyenda `AD/A/B/C` (sin notas vigesimales ni promedios aritméticos), conclusiones descriptivas, calificativos publicados (`trabajo` y `sesion_clase`), enlace hacia `/libreta`, estado sin calificativos publicados, error con reintento y restricción sin perfil de estudiante; confirmar fallo inicial (`npx vitest run src/features/evaluacion`).
- [x] 2.2 **Verde — `CalificacionesPage`**: Implementar `frontend/src/features/evaluacion/CalificacionesPage.tsx` consumiendo `useObtenerCalificacionesEstudianteApiV1EvaluacionEstudiantesEstudianteIdCalificacionesGet` y verificar todas las pruebas de `src/features/evaluacion` (`npx vitest run src/features/evaluacion`).
- [x] 2.3 **Refactor — Disposición maestro-detalle y accesibilidad en calificaciones**: Ajustar semántica de tabla/selector de cursos y retorno móvil en `CalificacionesPage.tsx` (`AC04`, `AC06`); re-ejecutar `npx vitest run src/features/evaluacion`.

## 3. Evaluación web: Mensajes por hilos (`/mensajes`)

- [x] 3.1 **Rojo — Escenarios de mensajes (`evaluacion/spec.md`)**: Escribir pruebas con RTL y MSW en `frontend/src/features/evaluacion/__tests__/MensajesPage.test.tsx` cubriendo filtros `Todos`/`Tareas`/`Recordatorios`/`Observaciones`, apertura de detalle y retorno móvil, enlace `/trabajos` cuando exista `actividad_id`, `Confirmar lectura` (`POST .../leer`) reduciendo `sin_leer`, envío de respuesta en hilo (`POST .../respuestas`) sin `input[type="file"]` (`RC08`), validación local `1..2000` caracteres, error al responder conservando el texto y estados vacío/error/no estudiante; confirmar fallo inicial (`npx vitest run src/features/evaluacion`).
- [x] 3.2 **Verde — `MensajesPage`**: Implementar `frontend/src/features/evaluacion/MensajesPage.tsx` con los hooks Orval de bandeja, confirmación de lectura y respuesta en hilo, actualizando la caché al confirmar lectura o responder; verificar paso de `MensajesPage.test.tsx`.
- [x] 3.3 **Refactor — Accesibilidad en bandeja maestro-detalle e hilo**: Revisar `role="tablist"`, `aria-live` o alertas accesibles en validación/envío y limpieza del formulario tras éxito (`AC04`, `AC06`); re-ejecutar `npx vitest run src/features/evaluacion`.

## 4. Reportes web: Libreta de notas y descarga PDF (`/libreta`)

- [x] 4.1 **Rojo — Escenarios de `reportes/spec.md`**: Escribir pruebas con RTL y MSW en `frontend/src/features/reportes/__tests__/LibretaPage.test.tsx` cubriendo resumen de trimestres publicados, visualización de áreas/competencias/transversales/conclusiones/aclaración SIAGIE en trimestre publicado, estado pendiente para trimestre no publicado con enlace hacia `/calificaciones`, visualización de situación final (`PRO`/`PER`/`RR`), solicitud bajo demanda de URL firmada al pulsar `Descargar PDF` (`GET .../descarga`, vigencia `15 minutos`), error al obtener URL firmada y bloqueo sin perfil de estudiante; confirmar fallo inicial (`npx vitest run src/features/reportes`).
- [x] 4.2 **Verde — `LibretaPage`**: Implementar `frontend/src/features/reportes/LibretaPage.tsx` consumiendo `useObtenerLibretasEstudianteApiV1ReportesEstudiantesEstudianteIdLibretasGet` y ejecutando `obtenerUrlDescargaLibretaApiV1ReportesEstudiantesEstudianteIdLibretasTrimestreIdDescargaGet` bajo demanda con `useMutation`; verificar paso de `npx vitest run src/features/reportes`.
- [x] 4.3 **Refactor — Presentación institucional y enlace seguro de descarga**: Verificar contraste, `rel="noopener noreferrer"` en el enlace firmado de descarga y vista responsive de trimestres; re-ejecutar `npx vitest run src/features/reportes`.

## 5. Integración final en `App.tsx` y verificación integral

- [x] 5.1 **Rojo — Pruebas de enrutamiento para `/calificaciones`, `/mensajes` y `/libreta`**: Ampliar `frontend/src/app/__tests__/App.test.tsx` con pruebas de navegación autenticada hacia `/calificaciones`, `/mensajes` y `/libreta`, y confirmar que fallan mientras sigan conectados los placeholders (`npx vitest run src/app`).
- [x] 5.2 **Verde — Reemplazo de placeholders finales en `App.tsx`**: Conectar `CalificacionesPage`, `MensajesPage` y `LibretaPage` en `frontend/src/app/App.tsx` dentro de `RequiereSesion` y limpiar `VistaSaludBase` si ya no quedan rutas placeholder; verificar `npx vitest run src/app`.
- [x] 5.3 **Verificación completa del cambio**: Ejecutar `npm test` y `npm run build` en `frontend/`, confirmar cero dependencias cruzadas entre `features/evaluacion` y `features/reportes` (`ADR-008`), y validar con `openspec validate "evaluacion-y-reportes-estudiante-web" --strict`.
