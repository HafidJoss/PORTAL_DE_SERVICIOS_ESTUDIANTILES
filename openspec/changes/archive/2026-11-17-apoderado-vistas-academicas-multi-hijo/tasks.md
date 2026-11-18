# Tasks

## 1. Contratos backend multi-hijo (`seguimiento`, `evaluacion`, `reportes`), guardia `DA05` y OpenAPI/Orval

- [x] 1.1 [TDD Rojo] Ampliar `backend/tests/seguimiento/test_integracion_contrato_seguimiento.py`, `backend/tests/evaluacion/test_integracion_contrato_evaluacion.py` y `backend/tests/reportes/test_integracion_contrato_reportes.py` probando consultas diferenciadas para `est-demo-1` y `est-demo-2` con `apoderado_id=apo-demo-1` y rechazo `403 Problem Details` (`DA05`) para `est-ajeno` en `/cursos`, `/cursos/{asignatura_id}`, `/calificaciones`, `/actividades`, `/mensajes`, `/libretas` y `/libretas/{trimestre_id}/descarga`, verificando fallo inicial.
- [x] 1.2 [TDD Verde] Crear `backend/app/core/pertenencia.py` (`validar_pertenencia_apoderado`) y actualizar `backend/app/modules/seguimiento/router.py`, `backend/app/modules/evaluacion/router.py` y `backend/app/modules/reportes/router.py` para aceptar `apoderado_id: str | None = None`, validar `DA05` y devolver datos académicos diferenciados para `est-demo-2` (`1.° de Secundaria A`) sin alterar `est-demo-1`, ejecutando `pytest` en verde.
- [x] 1.3 Ejecutar `python backend/export_openapi.py` para actualizar `backend/openapi.json` y `npm run api:generate` desde `frontend/` para regenerar hooks y parámetros Orval.

## 2. Contexto multi-hijo en `sesion.ts` y vistas de `seguimiento`

- [x] 2.1 [TDD Rojo -> Verde] Ampliar `frontend/src/shared/pruebas/testUnitarioSesion.test.ts` cubriendo `resolverContextoEstudiante` para `Estudiante`, `Apoderado` (con `hijoActivoId`) y `Docente`, e implementarlo en `frontend/src/shared/utilidades/sesion.ts`.
- [x] 2.2 [TDD Rojo -> Verde] Ampliar `frontend/src/features/seguimiento/pruebas/testIntegracionCursosVista.test.tsx` y `frontend/src/features/seguimiento/pruebas/testIntegracionCursoDetalleVista.test.tsx` cubriendo consultas de `Apoderado`, recarga al cambiar `hijoActivoId`, error `DA05` y `RC08`, y actualizar `frontend/src/features/seguimiento/vistas/cursosVista.tsx` y `frontend/src/features/seguimiento/vistas/cursoDetalleVista.tsx`.

## 3. Vistas académicas multi-hijo de `evaluacion` y `reportes`

- [x] 3.1 [TDD Rojo -> Verde] Ampliar `frontend/src/features/evaluacion/pruebas/testIntegracionCalificacionesVista.test.tsx` cubriendo renderizado multi-hijo y cambio de `hijoActivoId` sin promedios numéricos (`RF08`, `DA05`), y actualizar `frontend/src/features/evaluacion/vistas/calificacionesVista.tsx`.
- [x] 3.2 [TDD Rojo -> Verde] Ampliar `frontend/src/features/evaluacion/pruebas/testIntegracionTrabajosVista.test.tsx` y `frontend/src/features/evaluacion/pruebas/testIntegracionMensajesVista.test.tsx` cubriendo `TrabajosVista` multi-hijo (`RC08`) y `MensajesVista` de apoderado (confirmación de lectura y aviso informativo sin formulario de respuesta abierta), y actualizar `frontend/src/features/evaluacion/vistas/trabajosVista.tsx` y `frontend/src/features/evaluacion/vistas/mensajesVista.tsx`.
- [x] 3.3 [TDD Rojo -> Verde] Ampliar `frontend/src/features/reportes/pruebas/testIntegracionLibretaVista.test.tsx` cubriendo consulta multi-hijo, cambio de menor y descarga PDF temporal firmada (`TTL 15 min`, `RC05`, `DA05`), y actualizar `frontend/src/features/reportes/vistas/libretaVista.tsx`.

## 4. Enrutamiento académico de `Apoderado`, recorrido E2E y verificación global

- [x] 4.1 [TDD Rojo -> Verde] Crear `frontend/src/app/pruebas/testE2eRecorridoApoderadoAcademico.test.tsx` probando autenticación de `Apoderado`, navegación real por `/cursos`, `/cursos/cta`, `/calificaciones`, `/trabajos`, `/mensajes` y `/libreta`, cambio de menor en vivo desde `MarcoPortal`, puente temporal vigente en `/asistencia` y aislamiento frente a `Estudiante`, y reemplazar las rutas puente académicas en `frontend/src/app/aplicacion.tsx`.
- [x] 4.2 Ejecutar verificación completa: `python .agents/skills/cierre-fase-tdd/scripts/auditar_estado_fase.py --estricto`, `pytest` en `backend/`, y `npm run lint`, `npm run build` y `npx vitest run` en `frontend/`.
- [x] 4.3 Normalizar finales de línea CRLF en los artefactos Markdown y validar `openspec validate "apoderado-vistas-academicas-multi-hijo" --strict` y `openspec status --change "apoderado-vistas-academicas-multi-hijo"`.
