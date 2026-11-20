# Design

## Context

Con los Bloques 1 y 2 de la Fase 4 ya implementados (`institucion` y `matriculas` activos, `53` rutas OpenAPI, `70` tests backend y `143` tests frontend en verde), este **Bloque 3 (`admin-cuentas-y-bitacora`)** activa los últimos dos módulos reservados de `ADR-008` (`personas` y `auditoria`) y retira las últimas vistas puente (`/cuentas` y `/bitacora`) del Portal de Administración.

## Goals / Non-Goals

**Goals:**
- Implementar reglas puras en `backend/app/modules/personas/reglas.py` (validación de nombres/DNI/rol, unicidad de DNI, protección de cuentas `Administrador` y generación de código de 6 caracteres).
- Exponer contratos REST de `personas` bajo `/api/v1/personas/` y de `auditoria` bajo `/api/v1/auditoria/`, ambos protegidos por guardia `Administrador` (`403 ProblemDetail`).
- Reutilizar `backend/app/modules/auditoria/registro_stub.py` para que toda mutación de Bloques 1, 2 y 3 aparezca inmediatamente en `BitacoraAdminVista` y en el CSV descargado.
- Entregar `CuentasAdminVista` y `BitacoraAdminVista` conectadas a Orval, retirar `VistaPuenteAdmin` de `aplicacion.tsx` y cerrar el recorrido E2E completo de las 6 pantallas del Administrador.

**Non-Goals:**
- Persistencia real en PostgreSQL/Alembic, hashing Argon2, envío de correo/SMS o logs estructurados en GCP Cloud Logging (`ADR-004`, `ADR-005`).
- Permisos diferenciados para `Secretaría Académica` o `Dirección` (quedan preparados los contratos para su fase correspondiente).

## Decisions

### 1. Módulo `personas` (`backend/app/modules/personas/`)
- `exceptions.py`: `CuentaDuplicadaError` (`409`), `DatosCuentaInvalidosError` (`422`), `OperacionCuentaProtegidaError` (`403`).
- `reglas.py` (funciones puras):
  - `validar_datos_cuenta(nombre, dni, rol, dnis_existentes, permitir_admin=False)` → verifica ≥ 2 palabras en nombre, `^\d{8}$` en DNI, DNI no duplicado (`409`) y rol válido sin crear nuevos `Administrador` (`422`).
  - `validar_cuenta_modificable(rol_objetivo)` → lanza `OperacionCuentaProtegidaError` (`403`) si `rol_objetivo == "Administrador"`.
  - `generar_codigo_activacion()` → código alfanumérico legible de 6 caracteres sin caracteres ambiguos (`0/O/1/I`).
- `schemas.py` y `router.py` (estado en memoria con `reiniciar_cuentas_personas()`):
  - `GET /api/v1/personas/cuentas?estado=todas&rol=Todos&q=` → `ListaCuentasOut` (conteos `total`, `activas`, `pendientes`, `bloqueadas` + lista `cuentas`).
  - `POST /api/v1/personas/cuentas` (`201`) → `CuentaOperacionOut` (incluye `cuenta` + `codigo_activacion`) + audita `Cuenta`.
  - `PATCH /api/v1/personas/cuentas/{cuenta_id}` → actualiza nombre/DNI/rol + audita cada campo modificado.
  - `POST /api/v1/personas/cuentas/{cuenta_id}/restablecer-codigo` → pasa a `pendiente`, genera código de 6 caracteres + audita `Cuenta`.
  - `PATCH /api/v1/personas/cuentas/{cuenta_id}/estado` → alterna `activa` / `bloqueada` + audita `Cuenta`.
- Dependencia de módulos: `personas -> auditoria` (respetando `ADR-008`, sin ciclos).

### 2. Módulo `auditoria` (`backend/app/modules/auditoria/`)
- `schemas.py`: `EventoAuditoriaOut`, `ListaEventosAuditoriaOut`.
- `router.py` (conectado a `registro_stub.py`, sin importaciones a otros módulos de negocio):
  - `GET /api/v1/auditoria/eventos?tipo=Todos` → `ListaEventosAuditoriaOut` (eventos en orden cronológico inverso + total).
  - `GET /api/v1/auditoria/eventos/exportar?tipo=Todos` → `Response` con `media_type="text/csv; charset=utf-8"`, cabecera `Content-Disposition: attachment; filename="Bitacora_2026.csv"`, BOM UTF-8 y delimitador `;`.
- `backend/app/main.py`: registrar `personas_router` y `auditoria_router`.

### 3. Frontend (`features/personas/`, `features/auditoria/` y `aplicacion.tsx`)
- `frontend/src/features/personas/vistas/cuentasAdminVista.tsx`:
  - Pestañas con contadores (`Todas`, `Activas`, `Pendientes`, `Bloqueadas`).
  - Chips por los 7 roles (`Todos`, `Administrador`, `Dirección`, `Secretaría Académica`, `Docente`, `Auxiliar`, `Estudiante`, `Apoderado`) + buscador por nombre o DNI.
  - Formulario inline `Nueva cuenta` / `Editar cuenta` con validación previa y visibilidad inmediata del código de activación generado en la fila.
  - Acciones por fila (ocultas para `Administrador`): editar, restablecer contraseña / regenerar código y bloquear/desbloquear.
- `frontend/src/features/auditoria/vistas/bitacoraAdminVista.tsx`:
  - Chips de filtro por tipo de evento + botón `Exportar CSV` (descarga `Bitacora_2026.csv`).
  - Tabla inalterable con columnas `Fecha y hora`, `Usuario`, `Evento`, `Entidad`, `Antes → Después` e `IP`, resaltando eventos recientes (`id` iniciado con `n`).
- `frontend/src/app/aplicacion.tsx`: eliminar `VistaPuenteAdmin` y enlazar `/cuentas` → `<CuentasAdminVista />` y `/bitacora` → `<BitacoraAdminVista />`.

### 4. Plan de pruebas por capa (TDD)
- **Backend — Unitarias (`backend/tests/personas/test_unitario_reglas_personas.py`):** validación de nombre/DNI/rol, rechazo DNI duplicado (`409`), protección de `Administrador` (`403`) y formato de código de 6 caracteres.
- **Backend — Integración (`test_integracion_personas_admin.py` + `test_integracion_auditoria_admin.py`):** CRUD/filtros/código/bloqueo de cuentas + auditoría, consulta filtrada y CSV de bitácora (incluyendo evento recién creado desde `personas`), rechazo `403` para roles no autorizados, y actualización del conteo de rutas OpenAPI (`60` rutas) en `test_integracion_salud_y_errores.py`.
- **Frontend — Integración y E2E:**
  - `frontend/src/features/personas/pruebas/testIntegracionCuentasAdminVista.test.tsx` (filtros, alta con código visible, edición, restablecimiento y bloqueo/desbloqueo).
  - `frontend/src/features/auditoria/pruebas/testIntegracionBitacoraAdminVista.test.tsx` (filtros por tipo, tabla `Antes → Después` y exportación CSV).
  - Ampliar `frontend/src/app/pruebas/testE2eRecorridoAdminBase.test.tsx` cubriendo las 6 vistas reales sin puentes.

## Risks / Trade-offs

- **Descarga CSV binaria/texto con Orval:** Mitigación: para `/api/v1/auditoria/eventos/exportar` se puede usar `getExportarEventosAuditoriaApiV1AuditoriaEventosExportarGetUrl` (o `fetch` autenticado a la URL generada por Orval) y crear el `Blob` en el navegador para disparar la descarga de `Bitacora_2026.csv` de forma testeable en `jsdom`.
