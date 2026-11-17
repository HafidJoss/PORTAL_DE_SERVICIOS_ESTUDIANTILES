# Tasks

## 1. Contratos OpenAPI y backend stub (`identidad` y `seguimiento` docente)

- [x] 1.1 (TDD · Rojo) Agregar pruebas contractuales en `backend/tests/identidad/test_integracion_contrato_identidad.py` para `POST /api/v1/identidad/login` con DNI docente (`41257836`) verificando `rol == "Docente"`, `docente_id`, `especialidad`, `nivel_educativo` y `secciones_a_cargo`, manteniendo intacto el flujo de estudiante.
- [x] 1.2 (TDD · Verde) Ampliar `UsuarioSesionOut` en `backend/app/modules/identidad/schemas.py` y `_usuario_demo` en `backend/app/modules/identidad/router.py` para emitir perfil `Docente` cuando `dni == "41257836"`.
- [x] 1.3 (TDD · Rojo) Agregar pruebas contractuales en `backend/tests/seguimiento/test_integracion_contrato_seguimiento.py` y actualizar `backend/tests/core/test_integracion_salud_y_errores.py` para los 5 endpoints docentes (`/api/v1/seguimiento/docentes/{docente_id}/inicio`, `bandeja/{mensaje_id}/leer`, `bandeja/leer-todo`, `bandeja/{mensaje_id}/responder` con validación 422/400/404 y `cursos`).
- [x] 1.4 (TDD · Verde) Definir los esquemas Pydantic docentes (`InicioDocenteOut`, `MensajeBandejaDocenteOut`, `OperacionBandejaOut`, `RespuestaBandejaIn`, `RespuestaBandejaOut`, `ListaSeccionesDocenteOut`) en `backend/app/modules/seguimiento/schemas.py` e implementar sus rutas en `backend/app/modules/seguimiento/router.py`, verificando `pytest -q` en verde.
- [x] 1.5 Exportar `backend/openapi.json` (`python export_openapi.py`) y regenerar el cliente TypeScript en `frontend/src/api/generated/` (`npm run api:generate`).

## 2. Plataforma multi-rol y configuración compartida (`shared/`, `identidad`, `app/`)

- [x] 2.1 (TDD · Rojo → Verde) Agregar `resolverDocenteId` en `frontend/src/shared/utilidades/sesion.ts` con prueba unitaria en `frontend/src/shared/pruebas/` verificando resolución para rol `Docente` y vacío para otros roles.
- [x] 2.2 (TDD · Rojo) Ampliar `frontend/src/shared/pruebas/testComponenteMarcoPortal.test.tsx` con escenarios para menú docente (`Inicio`, `Mis cursos`, `Nota del día`, `Mensajes`, `Exportar SIAGIE`), insignias numéricas y disposición móvil `360x640`.
- [x] 2.3 (TDD · Verde) Parametrizar `MarcoPortal` en `frontend/src/shared/componentes/marcoPortal.tsx` (`navItems`, `navMovilItems`, `subtituloPortal`, soporte opcional de badge) manteniendo la compatibilidad por defecto con Estudiante.
- [x] 2.4 (TDD · Rojo → Verde) Agregar escenario docente en `frontend/src/features/identidad/pruebas/testIntegracionConfiguracionVista.test.tsx` y adaptar `frontend/src/features/identidad/vistas/configuracionVista.tsx` para mostrar especialidad, nivel educativo y secciones asignadas en solo lectura sin subida de imagen (`RC08`).

## 3. Lógica pura, componentes y vistas de seguimiento docente (`features/seguimiento/`)

- [x] 3.1 (TDD · Rojo) Escribir `frontend/src/features/seguimiento/pruebas/testUnitarioFiltrosBandejaDocente.test.ts` cubriendo filtrado (`todos`, `no_leidos`, `institucion`, `estudiantes`), conteo de mensajes sin leer y validación de texto de respuesta (`>= 2` caracteres).
- [x] 3.2 (TDD · Verde + Refactor) Implementar `frontend/src/features/seguimiento/utilidades/filtrosBandejaDocente.ts` respetando `camelCase` estricto y cero dependencias de DOM.
- [x] 3.3 (TDD · Rojo) Escribir `frontend/src/features/seguimiento/pruebas/testIntegracionInicioDocenteVista.test.tsx` cubriendo tablero de inicio docente, filtros de bandeja, `Marcar todo como leído`, apertura de mensaje, respuesta en hilo solo en consultas de estudiantes (`RC08`), manejo de estado vacío y reintento ante error.
- [x] 3.4 (TDD · Verde + Refactor) Implementar `frontend/src/features/seguimiento/componentes/bandejaDocente.tsx` y `frontend/src/features/seguimiento/vistas/inicioDocenteVista.tsx` integrados con los hooks Orval y tokens semánticos claro/oscuro (`tokens.css`).
- [x] 3.5 (TDD · Rojo) Escribir `frontend/src/features/seguimiento/pruebas/testIntegracionCursosDocenteVista.test.tsx` cubriendo grilla de secciones, barras de progreso de notas pendientes, avance de cierre (`X/4`), estado vacío y recuperación ante error.
- [x] 3.6 (TDD · Verde + Refactor) Implementar `frontend/src/features/seguimiento/vistas/cursosDocenteVista.tsx` con diseño responsivo en escritorio y móvil (`AC07`).

## 4. Enrutamiento autenticado por rol, prueba E2E y validación final

- [x] 4.1 (TDD · Rojo) Escribir `frontend/src/app/pruebas/testE2eRecorridoDocenteBase.test.tsx` validando login docente (`41257836`), navegación por `Inicio`, `Mis cursos` y `Configuración`, verificación de protección frente a rutas no autorizadas y cierre de sesión.
- [x] 4.2 (TDD · Verde) Actualizar `frontend/src/app/aplicacion.tsx` para despachar vistas y menú `Docente` vs `Estudiante` según `usuario.rol`, incluyendo vistas puente preparatorias para `/cursos/:asignaturaId`, `/nota-del-dia`, `/mensajes` y `/siagie`.
- [x] 4.3 Ejecutar todas las puertas de verificación sin errores ni omisiones: `cd backend && python -m pytest -q`, `cd frontend && npm run lint && npm run build && npm test -- --run`, `python .agents/skills/cierre-fase-tdd/scripts/auditar_estado_fase.py --formato markdown` y `openspec validate "docente-base-y-seguimiento" --strict`.
