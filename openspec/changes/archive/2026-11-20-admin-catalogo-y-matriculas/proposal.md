# Proposal

## Why

El Bloque 1 de la Fase 4 dejó operativo el shell del Administrador junto con `Inicio` y `Año y trimestres`, pero la ruta `/catalogo` sigue en vista puente y el módulo `matriculas` aún no tiene contratos activos. Este **Bloque 2 (`admin-catalogo-y-matriculas`)** entrega la gestión completa del **Catálogo escolar** (`Secciones`, `Asignaturas y competencias` y `Asignaciones docentes`, `RF03`, `HU08`) y la administración de **estudiantes por sección / nómina sin sección** (`RF21`, `HU13`), dejando listos los contratos OpenAPI/Orval para el consumo real del backend y su futura reutilización por Secretaría Académica.

## What Changes

- **Catálogo escolar en `institucion` (backend + OpenAPI/Orval + frontend):**
  - Reglas puras en `backend/app/modules/institucion/reglas.py` para creación de secciones (letra libre `A–P` por nivel y grado) y eliminación segura (bloquear si la sección todavía tiene estudiantes asignados).
  - Endpoints bajo `/api/v1/institucion/` con guardia de rol `Administrador` (`403`) y auditoría (`RF18`):
    - `GET /api/v1/institucion/secciones`, `POST /api/v1/institucion/secciones`, `PATCH /api/v1/institucion/secciones/{seccion_id}` (tutor/auxiliar) y `DELETE /api/v1/institucion/secciones/{seccion_id}`.
    - `GET /api/v1/institucion/asignaturas` (catálogo oficial CNEB de `Primaria`, `Secundaria` y `Transversales`).
    - `GET /api/v1/institucion/asignaciones` y `PATCH /api/v1/institucion/asignaciones` (docente titular y suplente por sección/asignatura con alertas de vacante o licencia).
- **Gestión de nómina y ubicación por sección en `matriculas` (nuevo módulo activo):**
  - Reglas puras en `backend/app/modules/matriculas/reglas.py` para asignación desde el pool `Sin sección` (validando coincidencia de grado), movimiento entre secciones del mismo grado o retiro al pool, y cambio de estado (`Activo`, `Retirado`, `Trasladado`).
  - Endpoints bajo `/api/v1/matriculas/` con guardia de rol `Administrador` (`403`) y auditoría (`RF18`):
    - `GET /api/v1/matriculas/sin-seccion`
    - `GET /api/v1/matriculas/secciones/{seccion_id}/estudiantes` (incluye resumen SIAGIE/académico del estudiante)
    - `POST /api/v1/matriculas/asignar`
    - `PATCH /api/v1/matriculas/estudiantes/{estudiante_id}/mover`
    - `PATCH /api/v1/matriculas/estudiantes/{estudiante_id}/estado`
- **Frontend (`institucion`, `matriculas`, `plataforma-web`):**
  - Regenerar el cliente TypeScript con Orval para los nuevos contratos de `institucion` y `matriculas`.
  - Implementar `CatalogoAdminVista` con sus tres pestañas (`Secciones`, `Asignaturas y competencias`, `Asignaciones docentes`), panel `Sin sección`, formulario `Nueva sección (A–P)`, detalle de sección con personal a cargo, docentes por asignatura, tabla de estudiantes con resumen expandible y acciones de movimiento/estado/eliminación segura.
  - Reemplazar la vista puente `/catalogo` en `aplicacion.tsx` por `CatalogoAdminVista`, manteniendo solo `/cuentas` y `/bitacora` como puentes hacia el Bloque 3.

## Capabilities

### New Capabilities
- `matriculas`: Consulta del pool `Sin sección` (nómina SIAGIE), listado y resumen de estudiantes por sección, asignación por grado, movimiento entre secciones y cambio de estado (`RF18`, `RF21`, `HU13`, `AC04`).

### Modified Capabilities
- `institucion`: Gestión de secciones (`A–P`, tutor/auxiliar, eliminación segura), consulta del catálogo de asignaturas y competencias CNEB y asignación de docentes titulares y suplentes (`RF03`, `RF18`, `HU08`, `AC04`).
- `plataforma-web`: Activación definitiva de `/catalogo` para `Administrador` reemplazando su vista puente temporal y exposición en OpenAPI/Orval de los contratos de `institucion` y `matriculas` (`RC03`, `AC06`, `AC07`).

## Impact

- **Trazabilidad:** Atiende `HU08`, `HU13`, `RF03`, `RF18`, `RF21`, `AC04`, `AC06`, `AC07`, `RC01`, `RC03`, `RC08`, `ADR-005`, `ADR-008`.
- **Módulos propietarios:** `institucion` (secciones, asignaturas, asignaciones) y `matriculas` (pool `Sin sección` y estudiantes por sección), ambos auditados vía `auditoria`.
- **Fuera de alcance (`RC08` y Bloque 3):**
  - Proceso de admisión/matrícula formal o carga de archivo `.xlsx` de nómina SIAGIE (queda para Secretaría Académica y `RC06`).
  - Gestión de `Cuentas y roles` (`personas`) y vista/exportación CSV de `Bitácora` (`auditoria`) → Bloque 3 (`admin-cuentas-y-bitacora`).
  - Persistencia real en PostgreSQL/Alembic (se mantienen contratos stub en memoria listos para reemplazar el cuerpo interno por `service.py → repository.py`).
- **Código afectado:** `backend/app/main.py`, `backend/app/modules/institucion/`, `backend/app/modules/matriculas/`, `backend/openapi.json`, `frontend/src/api/generated/`, `frontend/src/app/aplicacion.tsx`, `frontend/src/features/institucion/`, `frontend/src/features/matriculas/`.
