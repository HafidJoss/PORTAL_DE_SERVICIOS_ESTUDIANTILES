# Tasks

## 1. Reglas puras de catálogo escolar y matrículas (`institucion` + `matriculas`)

- [x] 1.1 [Rojo] Crear `backend/tests/institucion/test_unitario_reglas_catalogo.py` cubriendo creación de sección con letra libre `A–P`, rechazo `409` por letra duplicada, rechazo `422` por letra/grado fuera de rango y bloqueo `409` al eliminar una sección con estudiantes.
- [x] 1.2 [Verde] Ampliar `backend/app/modules/institucion/exceptions.py` y `backend/app/modules/institucion/reglas.py` haciendo pasar las pruebas unitarias de catálogo.
- [x] 1.3 [Rojo] Crear `backend/tests/matriculas/test_unitario_reglas_matriculas.py` cubriendo asignación desde pool por grado coincidente, rechazo `422` por grado/nivel incompatible y movimiento válido/inválido entre secciones.
- [x] 1.4 [Verde] Crear `backend/app/modules/matriculas/exceptions.py` y `backend/app/modules/matriculas/reglas.py` haciendo pasar las pruebas unitarias de matrículas.

## 2. Contratos API de `institucion` (catálogo) y `matriculas` + auditoría (`RF18`)

- [x] 2.1 [Rojo] Crear `backend/tests/institucion/test_integracion_catalogo_admin.py` probando CRUD de secciones (`GET/POST/PATCH/DELETE`), consulta de asignaturas y competencias CNEB (`Primaria`/`Secundaria`/`Transversales`), actualización de asignaciones titular/suplente, registro en auditoría (`RF18`) y rechazo `403` para roles no autorizados.
- [x] 2.2 [Rojo] Crear `backend/tests/matriculas/test_integracion_matriculas_admin.py` probando pool `sin-seccion`, listado de estudiantes con resumen, asignación desde pool, movimiento entre secciones y al pool, cambio de estado (`Activo`/`Retirado`/`Trasladado`), auditoría (`RF18`) y rechazo `403`.
- [x] 2.3 [Verde] Implementar `backend/app/modules/institucion/catalogo_stub.py`, ampliar `backend/app/modules/institucion/schemas.py` y `router.py`, implementar `backend/app/modules/matriculas/nomina_stub.py`, `schemas.py` y `router.py`, registrar `matriculas_router` en `backend/app/main.py` y actualizar el conteo OpenAPI en `backend/tests/core/test_integracion_salud_y_errores.py`; confirmar `pytest` completo en verde.

## 3. Contrato OpenAPI y regeneración del cliente Orval

- [x] 3.1 Exportar `backend/openapi.json` (`python backend/export_openapi.py`), regenerar los clientes tipados con Orval (`npm --prefix frontend run api:generate`) y verificar `tsc -b` sin errores.

## 4. Componentes y vista de Catálogo escolar y Nómina (`institucion` + `matriculas`)

- [x] 4.1 [Rojo] Crear `frontend/src/features/matriculas/pruebas/testIntegracionNominaSeccionAdmin.test.tsx` verificando panel `Sin sección` con asignación por grado, tabla de estudiantes de la sección, movimiento a otra sección o al pool, expansión de `Resumen` y cambio de estado escolar.
- [x] 4.2 [Verde] Implementar `frontend/src/features/matriculas/componentes/panelNominaSeccionAdmin.tsx` conectada a los hooks Orval de `matriculas` y pasar la prueba de integración.
- [x] 4.3 [Rojo] Crear `frontend/src/features/institucion/pruebas/testIntegracionCatalogoAdminVista.test.tsx` verificando las tres pestañas (`Secciones`, `Asignaturas y competencias`, `Asignaciones docentes`), creación de nueva sección (`A–P`), bloqueo/confirmación de eliminación de sección, acordeón CNEB y actualización de suplente eliminando alerta de licencia.
- [x] 4.4 [Verde] Implementar `pestanaSeccionesAdmin.tsx`, `pestanaAsignaturasAdmin.tsx`, `pestanaAsignacionesAdmin.tsx` y `catalogoAdminVista.tsx` en `frontend/src/features/institucion/` conectadas a Orval y pasar la prueba de integración.

## 5. Activación de `/catalogo` en el portal y verificación integral

- [x] 5.1 Reemplazar la vista puente `/catalogo` en `frontend/src/app/aplicacion.tsx` por `<CatalogoAdminVista />` y actualizar `frontend/src/app/pruebas/testE2eRecorridoAdminBase.test.tsx` para recorrer la vista real de Catálogo escolar.
- [x] 5.2 Ejecutar verificación completa: `pytest`, `vitest run`, `eslint .`, `tsc -b && vite build` y `openspec validate admin-catalogo-y-matriculas --strict`.
