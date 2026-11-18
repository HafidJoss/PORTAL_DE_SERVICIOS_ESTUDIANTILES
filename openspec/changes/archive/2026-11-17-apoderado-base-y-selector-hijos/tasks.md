# Tasks

## 1. Contratos backend multi-hijo (`identidad` y `seguimiento`) y OpenAPI

- [x] 1.1 [TDD Rojo] Ampliar `backend/tests/identidad/test_integracion_contrato_identidad.py` probando el ingreso con DNI de apoderado (`40871256`), `rol="Apoderado"`, `apoderado_id` y lista `hijos_vinculados` (2 menores) sin afectar los casos de estudiante y docente.
- [x] 1.2 [TDD Rojo] Ampliar `backend/tests/seguimiento/test_integracion_contrato_seguimiento.py` probando `GET /api/v1/seguimiento/apoderados/{apoderado_id}/hijos/{estudiante_id}/inicio` (`200` para hijos vinculados y `403` Problem Details ante menor ajeno `DA05`) y `POST /api/v1/seguimiento/apoderados/{apoderado_id}/comunicados/{comunicado_id}/confirmar-lectura` (`200` y `404`).
- [x] 1.3 [TDD Verde] Extender `backend/app/modules/identidad/{schemas.py,router.py}` (`HijoVinculadoOut` y perfil `Apoderado`) y `backend/app/modules/seguimiento/{schemas.py,router.py}` (`InicioApoderadoOut`, bandeja familiar y control `DA05`), actualizar el conteo en `backend/tests/core/test_integracion_salud_y_errores.py` (`38` rutas) y ejecutar `pytest` en verde.
- [x] 1.4 Ejecutar `python backend/export_openapi.py` para regenerar `backend/openapi.json` y `npm run api:generate` desde `frontend/` para sincronizar Orval.

## 2. Selector contextual en `MarcoPortal`, sesión familiar y `ConfiguracionVista`

- [x] 2.1 [TDD Rojo -> Verde] Ampliar `frontend/src/shared/pruebas/testUnitarioSesion.test.ts` y `frontend/src/shared/pruebas/testComponenteMarcoPortal.test.tsx` cubriendo `resolverApoderadoId`, `resolverHijoActivo` y el selector `Cambiar de menor` en escritorio y móvil (`AC07`), e implementar las extensiones en `frontend/src/shared/utilidades/sesion.ts` y `frontend/src/shared/componentes/marcoPortal.tsx`.
- [x] 2.2 [TDD Rojo -> Verde] Ampliar `frontend/src/features/identidad/pruebas/testIntegracionConfiguracionVista.test.tsx` cubriendo la vista del apoderado con su lista de menores vinculados en solo lectura y sin `<input type="file">` (`RC08`), y actualizar `frontend/src/features/identidad/vistas/configuracionVista.tsx`.

## 3. Tablero inicial y bandeja del apoderado (`frontend/src/features/seguimiento/`)

- [x] 3.1 [TDD Rojo] Crear `frontend/src/features/seguimiento/pruebas/testUnitarioFiltrosBandejaApoderado.test.ts` probando `filtrarBandejaApoderado` (`todos`, `no_leidos`, `institucion`, `docentes`) y `contarNoLeidosApoderado`, verificando fallo inicial.
- [x] 3.2 [TDD Verde] Implementar `frontend/src/features/seguimiento/utilidades/filtrosBandejaApoderado.ts` sin dependencias de React ni de DOM y verificar verde en `vitest run`.
- [x] 3.3 [TDD Rojo -> Verde] Crear `frontend/src/features/seguimiento/pruebas/testIntegracionInicioApoderadoVista.test.tsx` (bandeja familiar filtrable, `Confirmar lectura`, `Marcar todo como leído`, actualización al cambiar `hijoActivoId`, estado vacío y reintento ante error) e implementar `frontend/src/features/seguimiento/componentes/bandejaApoderado.tsx` y `frontend/src/features/seguimiento/vistas/inicioApoderadoVista.tsx`.

## 4. Enrutamiento inicial de `Apoderado` y verificación global

- [x] 4.1 [TDD Rojo -> Verde] Crear `frontend/src/app/pruebas/testE2eRecorridoApoderadoBase.test.tsx` probando autenticación como `Apoderado`, cambio de menor en `MarcoPortal`, navegación a `/inicio` y `/configuracion`, protección frente a otros roles y cierre de sesión, y configurar la rama `usuario.rol === "Apoderado"` en `frontend/src/app/aplicacion.tsx` con vistas puente temporales para los bloques 2 y 3.
- [x] 4.2 Ejecutar verificación completa: `python .agents/skills/cierre-fase-tdd/scripts/auditar_estado_fase.py --estricto`, `pytest` en `backend/`, y `npm run lint`, `npm run build` y `npx vitest run` en `frontend/`.
- [x] 4.3 Normalizar finales de línea CRLF en los artefactos editados y validar `openspec validate "apoderado-base-y-selector-hijos" --strict` y `openspec status --change "apoderado-base-y-selector-hijos"`.
