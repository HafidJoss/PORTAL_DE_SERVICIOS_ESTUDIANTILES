# Tasks

## 1. Reglas puras de cuentas y roles (`personas`)

- [x] 1.1 [Rojo] Crear `backend/tests/personas/test_unitario_reglas_personas.py` cubriendo validación de nombres y apellidos (≥ 2 palabras), DNI de 8 dígitos, rechazo `409` por DNI duplicado, rechazo `422` por intentar crear otro `Administrador`, protección `403` sobre cuenta `Administrador` y formato del código de activación de 6 caracteres.
- [x] 1.2 [Verde] Implementar `backend/app/modules/personas/exceptions.py` y `backend/app/modules/personas/reglas.py` haciendo pasar las pruebas unitarias.

## 2. Contratos API de `personas` y `auditoria` (`RF04`, `RF14`, `RF18`, `RF29`)

- [x] 2.1 [Rojo] Crear `backend/tests/personas/test_integracion_personas_admin.py` probando `GET/POST/PATCH /api/v1/personas/cuentas`, `POST /restablecer-codigo`, `PATCH /estado`, conteos por estado, registro de auditoría (`RF18`) y rechazo `403` para roles no autorizados.
- [x] 2.2 [Rojo] Crear `backend/tests/auditoria/test_integracion_auditoria_admin.py` probando `GET /api/v1/auditoria/eventos` con filtros, visibilidad inmediata de eventos generados por `personas`, `GET /api/v1/auditoria/eventos/exportar` (CSV UTF-8 con BOM y delimitador `;`) y rechazo `403`.
- [x] 2.3 [Verde] Implementar `backend/app/modules/personas/schemas.py` y `router.py`, implementar `backend/app/modules/auditoria/schemas.py` y `router.py`, registrar ambos routers en `backend/app/main.py` y actualizar el conteo OpenAPI (`60` rutas) en `backend/tests/core/test_integracion_salud_y_errores.py`; verificar `pytest` completo en verde.

## 3. Contrato OpenAPI y regeneración del cliente Orval

- [x] 3.1 Exportar `backend/openapi.json` (`python backend/export_openapi.py`), regenerar los clientes tipados con Orval (`npm --prefix frontend run api:generate`) y verificar `tsc -b` sin errores.

## 4. Vistas de Cuentas y Bitácora (`personas` + `auditoria`)

- [x] 4.1 [Rojo] Crear `frontend/src/features/personas/pruebas/testIntegracionCuentasAdminVista.test.tsx` verificando pestañas por estado, chips por los 7 roles, buscador, alta con código de activación visible, edición, restablecimiento y bloqueo/desbloqueo sin acciones sobre `Administrador`.
- [x] 4.2 [Verde] Implementar `frontend/src/features/personas/vistas/cuentasAdminVista.tsx` conectada a los hooks Orval de `personas` y pasar la prueba de integración.
- [x] 4.3 [Rojo] Crear `frontend/src/features/auditoria/pruebas/testIntegracionBitacoraAdminVista.test.tsx` verificando chips de filtro por tipo, tabla cronológica `Antes → Después` + IP y descarga de `Bitacora_2026.csv`.
- [x] 4.4 [Verde] Implementar `frontend/src/features/auditoria/vistas/bitacoraAdminVista.tsx` conectada a los hooks Orval de `auditoria` y pasar la prueba de integración.

## 5. Cierre de vistas puente de Fase 4 y verificación integral

- [x] 5.1 Retirar `VistaPuenteAdmin` en `frontend/src/app/aplicacion.tsx` enlazando `/cuentas` a `<CuentasAdminVista />` y `/bitacora` a `<BitacoraAdminVista />`, y ampliar `frontend/src/app/pruebas/testE2eRecorridoAdminBase.test.tsx` para recorrer las 6 pantallas operativas del Portal de Administración.
- [x] 5.2 Ejecutar verificación completa: `pytest`, `vitest run`, `eslint .`, `tsc -b && vite build` y `openspec validate admin-cuentas-y-bitacora --strict`.
