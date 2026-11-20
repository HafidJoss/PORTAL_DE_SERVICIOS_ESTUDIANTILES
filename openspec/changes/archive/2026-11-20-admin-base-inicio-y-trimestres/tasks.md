# Tasks

## 1. Reglas puras del ciclo de vida de trimestres (`institucion`)

- [x] 1.1 [Rojo] Crear `backend/tests/institucion/test_unitario_reglas_trimestre.py` cubriendo transiciones válidas (`Aperturado -> En Evaluación -> Cierre Preliminar -> Cerrado`), saltos inválidos (`409`), publicación de libreta permitida y bloqueada (`409`), reapertura válida y rechazos por motivo < 15 caracteres o documento UGEL faltante tras Acta Oficial (`422`).
- [x] 1.2 [Verde] Implementar `backend/app/modules/institucion/reglas.py` (y excepciones de dominio) haciendo pasar las pruebas unitarias sin dependencias de FastAPI ni base de datos, y ejecutar `pytest backend/tests/institucion/test_unitario_reglas_trimestre.py`.

## 2. Identidad de Administrador y contratos API de `institucion` + `auditoria`

- [x] 2.1 [Rojo] Ampliar `backend/tests/identidad/test_integracion_identidad_api.py` para verificar login de `Administrador` (`DNI 10456723`) con `institucion` y `alcance` en `UsuarioSesionOut` sin romper `Estudiante`, `Docente` ni `Apoderado`.
- [x] 2.2 [Verde] Actualizar `backend/app/modules/identidad/schemas.py` y `backend/app/modules/identidad/router.py` con el perfil demo de `Administrador` y confirmar `pytest` en verde.
- [x] 2.3 [Rojo] Crear `backend/tests/institucion/test_integracion_institucion_admin.py` probando `GET /api/v1/institucion/tablero-admin`, `PATCH /api/v1/institucion/solicitudes/{id}/atender`, `GET /api/v1/institucion/trimestres`, `POST /api/v1/institucion/trimestres/{id}/transicion`, `POST /api/v1/institucion/trimestres/{id}/publicar-libreta`, el registro en auditoría (`RF18`) para cada mutación y el rechazo `403 ProblemDetail` ante roles no autorizados.
- [x] 2.4 [Verde] Implementar `backend/app/modules/auditoria/registro_stub.py`, `backend/app/modules/institucion/schemas.py`, `backend/app/modules/institucion/router.py` y registrar `institucion_router` en `backend/app/main.py`; verificar `pytest` completo en verde.

## 3. Contrato OpenAPI y regeneración del cliente Orval

- [x] 3.1 Exportar `backend/openapi.json` (`python backend/export_openapi.py`), regenerar los clientes tipados de Orval (`npm --prefix frontend run api:generar`) y verificar `tsc -b` sin errores de tipos.

## 4. Shell del Administrador y Configuración personal en solo lectura (`identidad` + `plataforma-web`)

- [x] 4.1 [Rojo] Crear `frontend/src/features/identidad/pruebas/testIntegracionConfiguracionAdmin.test.tsx` verificando el perfil de `Administrador` en solo lectura (`AvatarIniciales`, sin `<input type="file">`, datos institucionales y los 4 interruptores de avisos administrativos).
- [x] 4.2 [Verde] Adaptar `frontend/src/features/identidad/vistas/configuracionVista.tsx` para el rol `Administrador` y confirmar la prueba en verde.
- [x] 4.3 Configurar la rama `Administrador` en `frontend/src/app/aplicacion.tsx` (`NAV_ADMIN_ESCRITORIO`, `NAV_ADMIN_MOVIL`, subtítulo `"Portal de Administración"`, rutas `/inicio`, `/trimestres`, `/configuracion` y vistas puente temporales para `/catalogo`, `/cuentas` y `/bitacora`).

## 5. Vistas operativas del Administrador (`institucion`)

- [x] 5.1 [Rojo] Crear `frontend/src/features/institucion/pruebas/testUnitarioReglasTrimestresAdmin.test.ts` probando validaciones locales del panel de reapertura (`motivo >= 15`, `documento UGEL >= 5` si Acta emitida) y mapeo de acciones/etapas por estado.
- [x] 5.2 [Verde] Implementar `frontend/src/features/institucion/utilidades/reglasTrimestresAdmin.ts` y pasar la prueba unitaria.
- [x] 5.3 [Rojo] Crear `frontend/src/features/institucion/pruebas/testIntegracionInicioAdminVista.test.tsx` verificando portada con 3 KPIs, bandeja de solicitudes (filtros, acordeón, `Marcar como atendida` y navegación contextual) y columna lateral (trimestre actual, avance por sección y resumen de cuentas).
- [x] 5.4 [Verde] Implementar `frontend/src/features/institucion/vistas/inicioAdminVista.tsx` conectada a los hooks de Orval y pasar la prueba de integración.
- [x] 5.5 [Rojo] Crear `frontend/src/features/institucion/pruebas/testIntegracionTrimestresAdminVista.test.tsx` verificando tarjetas de trimestres, stepper de 4 etapas, confirmación de transición, publicación de libreta y reapertura con validación de motivo y UGEL.
- [x] 5.6 [Verde] Implementar `frontend/src/features/institucion/vistas/trimestresAdminVista.tsx` conectada a los hooks de Orval y pasar la prueba de integración.

## 6. Recorrido E2E y verificación integral del Bloque 1

- [x] 6.1 [Rojo/Verde] Crear `frontend/src/app/pruebas/testE2eRecorridoAdminBase.test.tsx` cubriendo `Login Admin → Inicio → Trimestres → Configuración → Logout`, vistas puente y aislamiento de rutas respecto de otros roles.
- [x] 6.2 Ejecutar verificación completa: `pytest`, `vitest run`, `eslint .`, `tsc -b && vite build` y `openspec validate admin-base-inicio-y-trimestres --strict`.
