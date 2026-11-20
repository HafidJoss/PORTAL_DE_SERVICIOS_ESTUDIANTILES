# Proposal

## Why

Los Bloques 1 y 2 de la Fase 4 dejaron operativas las vistas de `Inicio`, `Año y trimestres`, `Catálogo escolar` y `Configuración` del Administrador, quedando solo las rutas puente `/cuentas` y `/bitacora` y los dos últimos módulos reservados (`personas` y `auditoria`). Este **Bloque 3 (`admin-cuentas-y-bitacora`)** completa al 100 % el Portal de Administración entregando la gestión de **Cuentas y roles** (`RF04`, `RF14`) y la **Bitácora de auditoría** con exportación CSV (`RF18`, `RF29`, `ADR-005`), conectada en vivo a todos los eventos generados desde `institucion`, `matriculas` y `personas`.

## What Changes

- **Gestión de Cuentas y roles en `personas` (nuevo módulo activo):**
  - Reglas puras en `backend/app/modules/personas/reglas.py` para validación de alta/edición de cuentas (nombres y apellidos ≥ 2 palabras, DNI de 8 dígitos único, prohibición de escalar o crear rol `Administrador` desde el alta estándar y protección contra edición/bloqueo/restablecimiento de la cuenta `Administrador`).
  - Contratos REST bajo `/api/v1/personas/` con guardia `Administrador` (`403`) y auditoría (`RF18`):
    - `GET /api/v1/personas/cuentas` (filtros por estado `todas`/`activa`/`pendiente`/`bloqueada`, rol y búsqueda `q` por nombre o DNI, más conteos por estado).
    - `POST /api/v1/personas/cuentas` (alta en estado `pendiente` con generación de código de activación de 6 caracteres de un solo uso).
    - `PATCH /api/v1/personas/cuentas/{cuenta_id}` (edición de nombre, DNI y rol auditando cada campo modificado).
    - `POST /api/v1/personas/cuentas/{cuenta_id}/restablecer-codigo` (solo Administrador: regenera código de 6 caracteres / restablece contraseña y pasa la cuenta a `pendiente`).
    - `PATCH /api/v1/personas/cuentas/{cuenta_id}/estado` (bloquear o desbloquear cuenta con protección sobre `Administrador`).
- **Bitácora inalterable de auditoría en `auditoria` (activación de router + feature):**
  - Exponer `GET /api/v1/auditoria/eventos` (filtro por tipo `Todos`, `Calificativo`, `Nivel`, `Estado`, `Libreta`, `Reapertura`, `Cuenta`, `Asignación`, `Seguridad`, `Sesión`) y `GET /api/v1/auditoria/eventos/exportar` (`Bitacora_2026.csv` en UTF-8 con BOM), leyendo directamente el registro append-only `registro_stub.py` ya alimentado por los Bloques 1, 2 y 3 (`RF18`, `RF29`, `ADR-005`).
- **Frontend (`personas`, `auditoria`, `plataforma-web`):**
  - Regenerar el cliente tipado con Orval para `personas` y `auditoria`.
  - Implementar `CuentasAdminVista` (pestañas por estado con conteos, chips de los 7 roles, buscador por nombre/DNI, formulario inline crear/editar cuenta, tabla con código de activación visible y acciones por fila).
  - Implementar `BitacoraAdminVista` (chips por tipo de evento, tabla cronológica `Antes → Después` con IP y botón `Exportar CSV`).
  - Retirar `VistaPuenteAdmin` de `aplicacion.tsx` activando `/cuentas` y `/bitacora` reales y ampliar la prueba E2E para recorrer las 6 pantallas completas del Portal de Administración.

## Capabilities

### New Capabilities
- `personas`: Gestión administrativa de cuentas y roles por DNI, generación de códigos de activación de un solo uso, edición, restablecimiento de contraseña y bloqueo/desbloqueo con auditoría (`RF04`, `RF14`, `RF18`, `AC04`).
- `auditoria`: Consulta filtrable de la bitácora inalterable de eventos críticos y exportación CSV conforme a trazabilidad institucional (`RF18`, `RF29`, `AC04`, `ADR-005`).

### Modified Capabilities
- `plataforma-web`: Activación definitiva de `/cuentas` y `/bitacora` para `Administrador` retirando todas las vistas puente temporales de la Fase 4 y exposición en OpenAPI/Orval de los contratos de `personas` y `auditoria` (`RC03`, `AC06`, `AC07`).

## Impact

- **Trazabilidad:** Atiende `RF04`, `RF14`, `RF18`, `RF29`, `AC04`, `AC06`, `AC07`, `RC01`, `RC03`, `RC08`, `ADR-004`, `ADR-005`, `ADR-008`.
- **Módulos propietarios:** `personas` (cuentas y roles) y `auditoria` (bitácora y exportación CSV).
- **Fuera de alcance (`RC08` y fase de persistencia real):**
  - Persistencia en PostgreSQL/Alembic, hashing Argon2 real, envío de correos/SMS y retención de logs estructurados en Cloud Logging (`ADR-004`, `ADR-005` — quedan listos a nivel de contrato para la fase de backend real).
  - Portales de otros roles (`Auxiliar`, `Secretaría Académica`, `Dirección`), que reutilizarán estos contratos en la siguiente fase.
- **Código afectado:** `backend/app/main.py`, `backend/app/modules/personas/`, `backend/app/modules/auditoria/`, `backend/openapi.json`, `frontend/src/api/generated/`, `frontend/src/app/aplicacion.tsx`, `frontend/src/features/personas/`, `frontend/src/features/auditoria/`.
