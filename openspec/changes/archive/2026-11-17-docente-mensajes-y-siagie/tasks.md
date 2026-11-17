# Tasks

## 1. Contratos backend y sincronización OpenAPI (`evaluacion` y `reportes`)

- [x] 1.1 [TDD Rojo] Ampliar `backend/tests/evaluacion/test_integracion_contrato_evaluacion.py` probando `GET /api/v1/evaluacion/docentes/{docente_id}/mensajes` (`200`), `POST /api/v1/evaluacion/docentes/{docente_id}/mensajes` (`201`, `422` Problem Details por asunto/texto insuficiente y `404` ante sección inexistente), verificando fallo inicial.
- [x] 1.2 [TDD Rojo] Ampliar `backend/tests/reportes/test_integracion_contrato_reportes.py` probando `GET /api/v1/reportes/docentes/{docente_id}/siagie` (`200`) y `POST /api/v1/reportes/docentes/{docente_id}/siagie/{seccion_id}/descarga` (`200` `UrlDescargaOut` con TTL 900s cuando `4/4` confirmadas, `400` Problem Details cuando faltan competencias y `404` ante sección inexistente), verificando fallo inicial.
- [x] 1.3 [TDD Verde] Definir esquemas Pydantic y stubs contractuales en `backend/app/modules/evaluacion/{schemas.py,router.py}` y `backend/app/modules/reportes/{schemas.py,router.py}`, actualizar la aserción de rutas OpenAPI (36 rutas / 4 operaciones nuevas) en `backend/tests/core/test_integracion_salud_y_errores.py` y ejecutar `pytest` hasta pasar sin fallos.
- [x] 1.4 Regenerar `backend/openapi.json` con `python backend/export_openapi.py` y sincronizar los clientes tipados ejecutando `npm run api:generate` desde `frontend/`.

## 2. Mensajería saliente docente (`frontend/src/features/evaluacion/`)

- [x] 2.1 [TDD Rojo] Crear `frontend/src/features/evaluacion/pruebas/testUnitarioMensajesDocente.test.ts` probando `validarFormularioMensajeDocente` y `describirAlcanceDestinatario` (alcance por sección completa vs estudiante y apoderado), verificando fallo inicial.
- [x] 2.2 [TDD Verde] Implementar `frontend/src/features/evaluacion/utilidades/filtrosMensajesDocente.ts` sin dependencias de React ni de DOM y verificar verde en `vitest run`.
- [x] 2.3 [TDD Rojo -> Verde] Crear `frontend/src/features/evaluacion/pruebas/testIntegracionMensajesDocenteVista.test.tsx` (envío de `Tarea`/`Recordatorio` a sección o estudiante, validación de campos, incorporación al historial `Enviados` y verificación de ausencia de `<input type="file">` según `RC08`) e implementar `frontend/src/features/evaluacion/vistas/mensajesDocenteVista.tsx`.

## 3. Exportación SIAGIE y Actas preliminares (`frontend/src/features/reportes/`)

- [x] 3.1 [TDD Rojo] Crear `frontend/src/features/reportes/pruebas/testUnitarioEstadoSiagie.test.ts` probando `esSeccionListaSiagie`, `obtenerEtiquetaEstadoSiagie` y `obtenerNotaTrimestreSiagie` (`Listo para exportar` vs `Faltan N competencias`), verificando fallo inicial.
- [x] 3.2 [TDD Verde] Implementar `frontend/src/features/reportes/utilidades/estadoSiagie.ts` sin dependencias de React ni de DOM y verificar verde en `vitest run`.
- [x] 3.3 [TDD Rojo -> Verde] Crear `frontend/src/features/reportes/pruebas/testIntegracionExportarSiagieVista.test.tsx` (cambio entre `I Trim.`, `II Trim.`, `III Trim.`, solicitud de URL firmada para `Excel SIAGIE` y `Acta preliminar`, y redirección hacia `/cursos/:seccionId?tab=cierre` si faltan competencias) e implementar `frontend/src/features/reportes/vistas/exportarSiagieVista.tsx`.

## 4. Enrutamiento final docente, retiro de vistas puente y verificación global

- [x] 4.1 [TDD Rojo -> Verde] Ampliar `frontend/src/app/pruebas/testE2eRecorridoDocenteBase.test.tsx` cubriendo navegación hacia `/mensajes` y `/siagie` reales y reemplazar las vistas puente en `frontend/src/app/aplicacion.tsx` eliminando `VistaPuenteDocente`.
- [x] 4.2 Ejecutar `python .agents/skills/cierre-fase-tdd/scripts/auditar_estado_fase.py --estricto`, `pytest` en `backend/`, y `npm run lint`, `npm run build` y `npx vitest run` en `frontend/`, verificando cero errores y cero violaciones `ADR-008`.
- [x] 4.3 Normalizar CRLF en los documentos editados y verificar `openspec validate "docente-mensajes-y-siagie" --strict` y `openspec status --change "docente-mensajes-y-siagie"`.
