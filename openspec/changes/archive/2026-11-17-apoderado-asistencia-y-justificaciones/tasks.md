# Tasks

## 1. Contratos backend de `asistencia` multi-hijo, justificaciones y OpenAPI/Orval

- [x] 1.1 [TDD Rojo] Ampliar `backend/tests/asistencia/test_integracion_contrato_asistencia.py` probando consulta mensual diferenciada para `est-demo-1` y `est-demo-2` con `apoderado_id=apo-demo-1`, envío de justificación escrita válida (`201`, `RF20`, `RC08`), validación de texto menor a 5 caracteres (`422`), rechazo ante incidencia inexistente (`404`) o ya justificada (`400`) y bloqueo `403 Problem Details` (`DA05`) ante `est-ajeno` en `GET` y `POST`, verificando fallo inicial.
- [x] 1.2 [TDD Verde] Extender `backend/app/modules/asistencia/schemas.py` (`IncidenciaAsistenciaOut`, `JustificacionCreateIn`, `JustificacionOut`) y `backend/app/modules/asistencia/router.py` (`apoderado_id: str | None = None`, `validar_pertenencia_apoderado` y `POST /apoderados/{apoderado_id}/hijos/{estudiante_id}/justificaciones`), actualizar `backend/tests/core/test_integracion_salud_y_errores.py` (`39` rutas) y ejecutar `pytest` en verde.
- [x] 1.3 Ejecutar `python backend/export_openapi.py` para regenerar `backend/openapi.json` y `npm run api:generate` desde `frontend/` para sincronizar el cliente Orval.

## 2. Lógica pura de justificaciones y vista `AsistenciaVista` multi-hijo

- [x] 2.1 [TDD Rojo] Crear `frontend/src/features/asistencia/pruebas/testUnitarioJustificacionesAsistencia.test.ts` probando `MOTIVOS_JUSTIFICACION`, `puedeJustificarIncidencia` (solo `Apoderado` y códigos `T`/`F` pendientes) y `validarJustificacionTexto` (`>= 5` caracteres, máximo `500`), verificando fallo inicial.
- [x] 2.2 [TDD Verde] Implementar `frontend/src/features/asistencia/utilidades/justificacionesAsistencia.ts` sin dependencias de React ni de DOM y verificar `vitest run` en verde.
- [x] 2.3 [TDD Rojo -> Verde] Ampliar `frontend/src/features/asistencia/pruebas/testIntegracionAsistenciaVista.test.tsx` cubriendo consulta multi-hijo de `Apoderado`, recarga al cambiar `hijoActivoId`, validación `< 5` caracteres, envío `201` con transición a `"Justificación enviada · en revisión"`, reintento ante error y ausencia de `<input type="file">` (`RC08`), preservando el modo solo lectura del rol `Estudiante`, y actualizar `frontend/src/features/asistencia/vistas/asistenciaVista.tsx`.

## 3. Enrutamiento definitivo de `Apoderado`, E2E y verificación global

- [x] 3.1 [TDD Rojo -> Verde] Crear `frontend/src/app/pruebas/testE2eRecorridoApoderadoAsistencia.test.tsx` (consulta multi-hijo y envío de justificación escrita desde `/asistencia`), actualizar `testE2eRecorridoApoderadoBase.test.tsx` y `testE2eRecorridoApoderadoAcademico.test.tsx` para reflejar `/asistencia` real sin pantallas puente, y retirar `VistaPuenteApoderado` en `frontend/src/app/aplicacion.tsx` conectando `<AsistenciaVista usuario={usuario} hijoActivoId={hijoActivo?.estudiante_id} />`.
- [x] 3.2 Ejecutar verificación completa: `python .agents/skills/cierre-fase-tdd/scripts/auditar_estado_fase.py --estricto`, `pytest` en `backend/`, y `npm run lint`, `npm run build` y `npx vitest run` en `frontend/`.
- [x] 3.3 Normalizar finales de línea CRLF en los artefactos Markdown y validar `openspec validate "apoderado-asistencia-y-justificaciones" --strict` y `openspec status --change "apoderado-asistencia-y-justificaciones"`.

## Workflow follow-up

- Tras implementar y aprobar el cambio, archivar los cambios de Fase 3 (`apoderado-base-y-selector-hijos`, `apoderado-vistas-academicas-multi-hijo` y `apoderado-asistencia-y-justificaciones`) y ejecutar `/cierre-fase-tdd` para documentar `docs/07-fases/fase-03-apoderado-frontend.md` y actualizar `docs/07-fases/README.md`.
