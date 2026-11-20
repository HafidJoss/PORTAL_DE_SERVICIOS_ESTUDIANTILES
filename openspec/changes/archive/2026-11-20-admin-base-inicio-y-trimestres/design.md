# Design

## Context

Este cambio inaugura la **Fase 4 (Portal de Administración)** con el Bloque 1 (`admin-base-inicio-y-trimestres`). Hasta ahora el repositorio tiene implementados los portales de `Estudiante` (Fase 1), `Docente` (Fase 2) y `Apoderado` (Fase 3) sobre `identidad`, `seguimiento`, `evaluacion`, `asistencia` y `reportes`. El módulo `institucion` (y `auditoria`) existen solo como carpetas reservadas (`__init__.py`) en `backend/app/modules/`.

Al igual que en las Fases 1 a 3, este bloque construye un corte vertical completo (reglas puras + contratos FastAPI stub en memoria + exportación OpenAPI + regeneración de cliente Orval + vistas React + pruebas TDD unitarias, de integración y E2E), diseñado de modo que al incorporar PostgreSQL/Alembic en la fase de persistencia real solo se reemplace el almacenamiento interno por `service.py` y `repository.py` sin cambiar el contrato REST ni el frontend.

## Goals / Non-Goals

**Goals:**
- Activar el módulo espejo `institucion` en backend (`backend/app/modules/institucion/`) y frontend (`frontend/src/features/institucion/`).
- Aislar la máquina de estados y validaciones de trimestres (`RF05`, `RF27`, `RF30`) como funciones puras en `backend/app/modules/institucion/reglas.py`.
- Exponer contratos OpenAPI estrictos bajo `/api/v1/institucion/` protegidos por guardia de rol `Administrador` (`403 ProblemDetail`) y trazados en la bitácora base de `backend/app/modules/auditoria/`.
- Incorporar el perfil demo `Administrador` (`10456723`) en `identidad`, la rama de rutas y navegación en `aplicacion.tsx` y las vistas `InicioAdminVista`, `TrimestresAdminVista` y `ConfiguracionVista` (modo Admin sin subida de foto, `RC08`).

**Non-Goals:**
- Implementación de `Catálogo escolar` (`Secciones`, `Asignaturas`, `Asignaciones`) ni `matriculas` (Bloque 2).
- Implementación de `Cuentas y roles` (`personas`) ni vista/exportación CSV de `Bitácora` (Bloque 3).
- Persistencia en PostgreSQL, migraciones Alembic, hashing Argon2, JWT real o encolado Cloud Tasks (`ADR-003`, `ADR-004`, `ADR-007`).

## Decisions

### 1. Arquitectura modular y fronteras (`ADR-008`, `ADR-005`, `ADR-009`)
- **`backend/app/modules/institucion/`**:
  - `reglas.py` (capa de negocio pura, sin FastAPI ni BD):
    - `TRANSICIONES_VALIDAS`: `Aperturado -> En Evaluación`, `En Evaluación -> Cierre Preliminar`, `Cierre Preliminar -> Cerrado`.
    - `validar_transicion_trimestre(estado_actual, accion, motivo, acta_emitida_siagie, documento_ugel) -> (nuevo_estado, es_reapertura)` con excepciones de dominio diferenciando `409 Conflict` (transición no permitida / libreta sobre trimestre no cerrado) y `422 Unprocessable Entity` (motivo < 15 chars o falta de documento UGEL >= 5 chars cuando `acta_emitida_siagie=True`).
    - `validar_publicacion_libreta(estado_actual, libreta_publicada) -> None` (`409` si no está `Cerrado` o ya está publicada).
  - `schemas.py` (presentación): `TableroAdminOut`, `SolicitudAdminOut`, `AvanceSeccionOut`, `ResumenCuentasAdminOut`, `TrimestreAdminOut`, `TransicionTrimestreIn`, `EstadoTrimestre`, `AccionTrimestre`.
  - `router.py` (presentación + estado contractual en memoria con `reiniciar_estado_institucion()` para pruebas):
    - `GET /api/v1/institucion/tablero-admin`
    - `PATCH /api/v1/institucion/solicitudes/{solicitud_id}/atender`
    - `GET /api/v1/institucion/trimestres`
    - `POST /api/v1/institucion/trimestres/{trimestre_id}/transicion`
    - `POST /api/v1/institucion/trimestres/{trimestre_id}/publicar-libreta`
  - **Guardia de rol (`AC04`):** parámetro/cabecera contractual `X-Rol-Usuario` (o consulta opcional `rol_actor` en stub si aplica; se elige cabecera HTTP `X-Rol-Usuario` con valor por defecto `"Administrador"` para mantener compatibilidad con el navegador local sin auth real, y devolver `403 ProblemDetail` cuando llegue cualquier rol distinto a `"Administrador"` — esto es limpio, no contamina la URL y es fácil de reemplazar luego por la dependencia `usuario_actual` de JWT).
- **`backend/app/modules/auditoria/`**:
  - Se crea `registro_stub.py` (base interna de auditoría append-only en memoria con `registrar_evento(...)`, `listar_eventos(...)` y `reiniciar_eventos_auditoria()`), invocado desde `institucion` al cambiar estado, publicar libreta o reabrir trimestre (`RF18`, `ADR-005`). En el Bloque 3, `auditoria/router.py` expondrá directamente este mismo registro y su exportación CSV.
  - Dependencia de módulos: `institucion -> auditoria` (respetando `arquitectura-inicial.md`, sin ciclos).
- **Nota sobre `ADR-009`:** En producción, el cierre definitivo del trimestre será orquestado por `evaluacion` (validando niveles, pidiendo el cambio a `institucion` y encolando libretas por `core` para `reportes`). En esta fase contractual de frontend, `institucion` expone el endpoint de transición y devuelve advertencias de secciones pendientes basadas en el avance stub, manteniendo la misma firma HTTP para la futura integración.

### 2. Identidad y enrutamiento frontend (`identidad`, `plataforma-web`)
- **`backend/app/modules/identidad/`**:
  - `UsuarioSesionOut` suma `institucion: str | None = None` y `alcance: str | None = None`.
  - `_usuario_demo("10456723")` retorna `Administrador` (`Lic. Marco Ayala Sulca`, `G.U.E. Mariscal Cáceres`, `Primaria y Secundaria`).
- **`frontend/src/app/aplicacion.tsx`**:
  - Nuevo bloque `if (usuario.rol === "Administrador")` con `NAV_ADMIN_ESCRITORIO` (`Inicio`, `Año y trimestres`, `Catálogo escolar`, `Cuentas y roles`, `Bitácora`) y `NAV_ADMIN_MOVIL` (`Inicio`, `Trimestres`, `Catálogo`, `Cuentas`, `Bitácora`), subtítulo `"Portal de Administración"`.
  - Rutas activas: `/inicio` (`InicioAdminVista`), `/trimestres` (`TrimestresAdminVista`), `/configuracion` (`ConfiguracionVista`).
  - Rutas puente temporales (claras y limpias hasta Bloques 2 y 3): `/catalogo`, `/cuentas`, `/bitacora`.
- **`frontend/src/features/institucion/`** (espejo estricto `camelCase`):
  - `utilidades/reglasTrimestresAdmin.ts` (validación local del panel de reapertura y etiquetas de etapas/acciones).
  - `vistas/inicioAdminVista.tsx` (portada + KPIs, bandeja con filtros/acordeón/resolver/navegación contextual, columna lateral).
  - `vistas/trimestresAdminVista.tsx` (3 tarjetas, stepper 4 pasos, paneles inline de confirmación y validaciones `RF30`).
  - `pruebas/` con pruebas unitarias e integración siguiendo `docs/06-estandares/nomenclatura.md`.

### 3. Cumplimiento de `RC07` y `RC08` en Configuración
- Aunque el prototipo HTML incluye un bloque de foto de perfil con `<input type="file">`, mantenemos la misma decisión consistente con Fases 1, 2 y 3: **no se implementa subida de fotografías** (`RC08`) y se utiliza `AvatarIniciales` (`RC07`).

### 4. Plan de pruebas por capa (TDD)
- **Backend — Unitarias puras (`tests/institucion/test_unitario_reglas_trimestre.py`):** transiciones válidas, saltos inválidos (`409`), publicación de libreta permitida/bloqueada (`409`), reapertura con motivo < 15 chars (`422`), reapertura con Acta emitida sin oficio UGEL (`422`) y reapertura válida.
- **Backend — Integración API y auditoría (`tests/institucion/test_integracion_institucion_admin.py` + `tests/identidad/test_integracion_identidad_api.py`):** login Admin (`10456723`), consulta de tablero, atención de solicitud, consulta y transiciones de trimestres, verificación de registro en `auditoria` (`RF18`) y rechazo `403` para roles no autorizados. *(Nota: pruebas con `testcontainers` y `repository` se incorporarán al activar PostgreSQL en la fase de persistencia real).*
- **Frontend — Unitarias (`features/institucion/pruebas/testUnitarioReglasTrimestresAdmin.test.ts`):** validación de formulario de reapertura y mapeo de acciones disponibles por estado.
- **Frontend — Integración (`testIntegracionInicioAdminVista.test.tsx`, `testIntegracionTrimestresAdminVista.test.tsx`, `testIntegracionConfiguracionAdmin.test.tsx`):** renderizado de KPIs, filtros y atención de solicitudes, flujo completo de transición/publicación/reapertura con validación de errores, y ficha Admin en `ConfiguracionVista` sin subida de fotos.
- **Frontend — E2E (`app/pruebas/testE2eRecorridoAdminBase.test.tsx`):** recorrido `Login Admin → Inicio → Trimestres → Configuración → Logout` y aislamiento frente a roles no administrativos.

## Risks / Trade-offs

- **Riesgo de desfase entre contrato stub y futura orquestación `ADR-009`:** Mitigación: mantener los endpoints de transición de `institucion` con esquemas `TransicionTrimestreIn` / `TrimestreAdminOut` autocontenidos y desacoplados del almacenamiento.
- **Navegación contextual desde solicitudes hacia vistas puente (`/catalogo`, `/cuentas`):** Mitigación: las solicitudes cuyos botones apuntan a `/catalogo` o `/cuentas` navegarán sin error hacia las vistas puente temporales del Bloque 1 y quedarán conectadas a las vistas reales en Bloques 2 y 3.
