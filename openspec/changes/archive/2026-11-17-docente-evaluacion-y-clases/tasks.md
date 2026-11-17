# Tasks

## 1. Contratos backend y sincronización OpenAPI (`evaluacion` y `seguimiento`)

- [x] 1.1 [TDD Rojo] Escribir pruebas de integración contractual en `backend/tests/evaluacion/test_integracion_contrato_evaluacion.py` para los 7 endpoints docentes bajo `/api/v1/evaluacion/docentes/{docente_id}/` (`GET /clases`, `POST /sesiones`, `PUT /sesiones/{sesion_id}/notas`, `POST /actividades`, `POST /actividades/{actividad_id}/publicar`, `POST /cierre/confirmar` validando `RF22` en Primaria/Secundaria, `POST /observaciones` validando mínimo de caracteres `RF24`), verificando 200/201/422 Problem Details y fallando inicialmente.
- [x] 1.2 [TDD Rojo] Escribir pruebas de integración contractual en `backend/tests/seguimiento/test_integracion_contrato_seguimiento.py` para `GET /api/v1/seguimiento/docentes/{docente_id}/secciones/{seccion_id}` y `POST /api/v1/seguimiento/docentes/{docente_id}/secciones/{seccion_id}/anuncios` (404/422 Problem Details ante sección inexistente o anuncio vacío), verificando fallo inicial.
- [x] 1.3 [TDD Verde] Definir esquemas Pydantic y stubs contractuales en `backend/app/modules/evaluacion/schemas.py` y `backend/app/modules/evaluacion/router.py`, y en `backend/app/modules/seguimiento/schemas.py` y `backend/app/modules/seguimiento/router.py`, actualizar la aserción de rutas OpenAPI (33 rutas) en `backend/tests/core/test_integracion_salud_y_errores.py` y ejecutar `pytest` hasta pasar sin fallos.
- [x] 1.4 Regenerar `backend/openapi.json` ejecutando `python backend/export_openapi.py` y sincronizar los clientes tipados de frontend ejecutando `npm run api:generate` desde `frontend/`.

## 2. Motor CNEB de cálculo y utilidades de evaluación (`frontend/src/features/evaluacion/utilidades/`)

- [x] 2.1 [TDD Rojo] Crear `frontend/src/features/evaluacion/pruebas/testUnitarioCalculoMediana.test.ts` probando `calcularMedianaCneb` (mediana con empate, casos impares, todos `C`, ausencia de notas), `requiereConclusionDescriptiva` (`B` o `C` en `Primaria` y solo `C` en `Secundaria`, `RF22`), `contarDistribucionNiveles` y `serializarRegistroAuxiliarCsv` (comillas RFC 4180 y BOM UTF-8), verificando fallo inicial.
- [x] 2.2 [TDD Verde + Refactor] Implementar las funciones puras en `frontend/src/features/evaluacion/utilidades/calculoMediana.ts` y `frontend/src/features/evaluacion/utilidades/exportadorCsvAuxiliar.ts` sin dependencias de React ni de DOM, y verificar verde en `vitest run`.

## 3. Componentes de evaluación continua y vista `Nota del día` (`frontend/src/features/evaluacion/`)

- [x] 3.1 [TDD Rojo] Crear `frontend/src/features/evaluacion/pruebas/testComponenteFichaClaseCuadricula.test.tsx` cubriendo carga de criterios K1..K4, llenado masivo con `AD`/`A`, edición individual por criterio/estudiante, actualización de pendientes y guardado con `Guardar notas`.
- [x] 3.2 [TDD Verde] Implementar `frontend/src/features/evaluacion/componentes/fichaClaseCuadricula.tsx` y `frontend/src/features/evaluacion/componentes/formularioNuevaClase.tsx` reutilizando tipos e iconos compartidos sin duplicar lógica entre sesiones y registro auxiliar.
- [x] 3.3 [TDD Rojo] Crear `frontend/src/features/evaluacion/pruebas/testComponentePanelCierreCompetencias.test.tsx` cubriendo visualización de mediana CNEB, sugerencia precalculada, bloqueo de `Confirmar` cuando `requiereConclusionDescriptiva` es verdadero y la conclusión tiene menos de 10 caracteres (`RF22`), validación de `Publicar observación` (`RF24`) y adopción de sugerencia con un clic.
- [x] 3.4 [TDD Verde + Refactor] Implementar `frontend/src/features/evaluacion/componentes/panelCierreCompetencias.tsx`, `frontend/src/features/evaluacion/componentes/registroAuxiliarTabla.tsx` (filtros por capacidad/estado y descarga CSV usando `exportadorCsvAuxiliar.ts`), `frontend/src/features/evaluacion/componentes/formularioActividadDocente.tsx` (sin adjuntos, `RF19`/`RC08`) y `frontend/src/features/evaluacion/componentes/listaEstudiantesSeccion.tsx`.
- [x] 3.5 [TDD Rojo -> Verde] Crear `frontend/src/features/evaluacion/pruebas/testIntegracionNotaDelDiaVista.test.tsx` cubriendo las acciones de `Nota del día` (selección entre 4 secciones, guardado de ficha de clase y creación rápida de clase con al menos un criterio) e implementar `frontend/src/features/evaluacion/vistas/notaDelDiaVista.tsx`.

## 4. Detalle de sección docente de seis pestañas (`frontend/src/features/seguimiento/`, ADR-008)

- [x] 4.1 [TDD Rojo] Crear `frontend/src/features/seguimiento/pruebas/testIntegracionCursoDocenteDetalleVista.test.tsx` probando navegación entre las 6 pestañas (`Novedades`, `Clases`, `Registro auxiliar`, `Actividades`, `Cierre`, `Estudiantes`), publicación de anuncio unidireccional (`RF25`, validación de texto vacío), creación/publicación de actividad sin adjuntos (`RF19`), apertura por `tab` inicial y retorno ante sección inexistente.
- [x] 4.2 [TDD Verde + Refactor] Implementar `frontend/src/features/seguimiento/vistas/cursoDocenteDetalleVista.tsx` componiendo los subcomponentes exportados desde `frontend/src/features/evaluacion/componentes/` (`ADR-008`: dependencia unidireccional `seguimiento -> evaluacion`) y conectar la navegación desde las tarjetas de `frontend/src/features/seguimiento/vistas/cursosDocenteVista.tsx`.

## 5. Enrutamiento activo, recorrido docente E2E y cierre de verificación

- [x] 5.1 [TDD Rojo -> Verde] Actualizar `frontend/src/app/pruebas/testE2eRecorridoDocenteBase.test.tsx` para verificar navegación real hacia `/nota-del-dia` y `/cursos/:asignaturaId` (sustituyendo los placeholders temporales) y activar ambas rutas para el rol `Docente` en `frontend/src/app/aplicacion.tsx`.
- [x] 5.2 Ejecutar verificación completa tras la última edición: `pytest` en `backend/`, `npm run lint`, `npm run build` y `npx vitest run` en `frontend/`, y `python .agents/skills/cierre-fase-tdd/scripts/auditar_estado_fase.py --estricto` desde la raíz confirmando cero errores y cero advertencias de frontera arquitectónica.
- [x] 5.3 Normalizar finales de línea CRLF en los artefactos editados y ejecutar `openspec validate "docente-evaluacion-y-clases" --strict` y `openspec status --change "docente-evaluacion-y-clases"` confirmando `4/4` artefactos válidos y listos para `/opsx:apply`.
