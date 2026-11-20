# Proposal

## Why

El portal ya cuenta con las experiencias completas de `Estudiante`, `Docente` y `Apoderado` (Fases 1 a 3), pero carece aún del **Portal de Administración** necesario para gobernar el año escolar, controlar el ciclo de vida de los trimestres (`RF05`, `HU09`), publicar libretas (`RF27`), ejecutar reaperturas excepcionales (`RF30`) y monitorear el avance de cierre por sección (`RF31`, `HU17`). Este primer bloque de la Fase 4 establece el marco base del rol `Administrador`, activa el módulo espejo `institucion` (backend + OpenAPI/Orval + frontend) y entrega operativas las vistas de **Inicio** y **Año y trimestres**.

## What Changes

- **Identidad y shell del Administrador (`identidad`, `plataforma-web`):**
  - Exponer perfil demo de `Administrador` (`DNI 10456723`, Lic. Marco Ayala Sulca) con campos opcionales de alcance institucional (`institucion`, `alcance`) en `UsuarioSesionOut`.
  - Parametrizar `MarcoPortal` y el enrutador principal para el rol `Administrador` (escritorio y móvil sin desbordamiento en `360x640 px`) con accesos a `Inicio`, `Año y trimestres`, `Catálogo escolar` (puente Bloque 2), `Cuentas y roles` (puente Bloque 3), `Bitácora` (puente Bloque 3) y `Configuración`.
  - Adaptar `ConfiguracionVista` para mostrar los datos personales del Administrador en solo lectura con `AvatarIniciales` (sin subida de fotografías, `RC07`, `RC08`) y sus preferencias de avisos de administración.
- **Tablero operativo de Inicio (`institucion`):**
  - Exponer contratos OpenAPI bajo `/api/v1/institucion/tablero-admin` y `PATCH /api/v1/institucion/solicitudes/{solicitud_id}/atender` con guardia de rol `Administrador` (`403 Forbidden`).
  - Implementar `InicioAdminVista` con portada y 3 KPIs (`Por atender`, `Cuentas sin activar`, `Secciones con cierre`), bandeja de solicitudes operativas (filtros `Por atender` / `Atendidas` / `Todas`, acordeón expandible, acción `Marcar como atendida` y enlaces contextuales) y barra lateral (trimestre actual con stepper de 4 etapas, avance de cierre por sección y resumen de cuentas).
- **Gestión de Año escolar y trimestres (`institucion` + registro base de `auditoria`):**
  - Implementar reglas puras de transición de estados en `backend/app/modules/institucion/reglas.py` (`Aperturado → En Evaluación → Cierre Preliminar → Cerrado`, publicación de libreta y reapertura excepcional con motivo obligatorio mínimo 15 caracteres y N.° de documento UGEL si el Acta Oficial ya fue emitida en SIAGIE).
  - Exponer `GET /api/v1/institucion/trimestres`, `POST /api/v1/institucion/trimestres/{trimestre_id}/transicion` y `POST /api/v1/institucion/trimestres/{trimestre_id}/publicar-libreta`, registrando cada mutación en la bitácora base de `auditoria` (`RF18`, `ADR-005`).
  - Regenerar el cliente TypeScript con Orval e implementar `TrimestresAdminVista` con tarjetas por trimestre, barra de progreso de 4 etapas, paneles inline de confirmación y validaciones `RF30`.

## Capabilities

### New Capabilities
- `institucion`: Tablero operativo del Administrador (bandeja de solicitudes y avance de cierre por sección) y gestión del ciclo de vida de los trimestres (`RF05`, `RF18`, `RF27`, `RF30`, `RF31`, `HU09`, `HU17`).

### Modified Capabilities
- `identidad`: Autenticación y perfil de sesión para el rol `Administrador`, protección de rutas administrativas y vista de configuración en solo lectura sin subida de fotos (`RF14`, `AC04`, `RC07`, `RC08`).
- `plataforma-web`: Navegación institucional responsiva para `Administrador` con rutas puente temporales hacia los Bloques 2 y 3, y contratos OpenAPI/Orval bajo `/api/v1/institucion/` (`RC01`, `RC03`, `AC06`, `AC07`).

## Impact

- **Trazabilidad:** Atiende `HU09`, `HU17`, `RF05`, `RF14`, `RF18`, `RF27`, `RF30`, `RF31`, `AC04`, `AC06`, `AC07`, `RC01`, `RC03`, `RC07`, `RC08`, `ADR-005`, `ADR-008`, `ADR-009`.
- **Módulo propietario:** `institucion` (con extensiones en `identidad`, `plataforma-web` y helper de registro en `auditoria`).
- **Fuera de alcance (`RC08` y bloques posteriores):**
  - Catálogo escolar (`Secciones`, `Asignaturas y competencias`, `Asignaciones docentes`) y `matriculas` → Bloque 2 (`admin-catalogo-y-matriculas`).
  - Gestión de `Cuentas y roles` (`personas`) y vista/exportación CSV de `Bitácora` (`auditoria`) → Bloque 3 (`admin-cuentas-y-bitacora`).
  - Subida de fotografías de perfil, persistencia real en PostgreSQL/Alembic y encolado real en Cloud Tasks (se mantiene contrato stub en memoria listo para reemplazar el cuerpo por `service.py → repository.py` sin romper el frontend).
- **Código afectado:** `backend/app/main.py`, `backend/app/modules/identidad/`, `backend/app/modules/institucion/`, `backend/app/modules/auditoria/`, `backend/openapi.json`, `frontend/src/api/generated/`, `frontend/src/app/aplicacion.tsx`, `frontend/src/features/identidad/`, `frontend/src/features/institucion/`.
