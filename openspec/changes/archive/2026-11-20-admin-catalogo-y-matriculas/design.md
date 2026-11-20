# Design

## Context

El Bloque 1 (`admin-base-inicio-y-trimestres`) activó el módulo `institucion` (tablero de inicio y ciclo de vida de trimestres), el helper de auditoría `auditoria/registro_stub.py` y el shell del `Administrador` con `/catalogo` en vista puente. Este **Bloque 2 (`admin-catalogo-y-matriculas`)** reemplaza ese puente por la vista completa de **Catálogo escolar** (3 pestañas) y activa el módulo espejo `matriculas` en backend y frontend.

## Goals / Non-Goals

**Goals:**
- Mantener la separación limpia de `ADR-008`: `institucion` posee secciones, asignaturas/competencias y asignaciones docentes; `matriculas` posee el pool `Sin sección` y la nómina/estado de estudiantes por sección.
- Aislar validaciones críticas como funciones puras en `institucion/reglas.py` y `matriculas/reglas.py`.
- Exponer contratos OpenAPI estrictos bajo `/api/v1/institucion/` y `/api/v1/matriculas/`, protegidos por guardia `Administrador` (`403 ProblemDetail`) y trazados en `auditoria/registro_stub.py` (`RF18`).
- Entregar `CatalogoAdminVista` conectada 100 % a los hooks generados por Orval, manteniendo pruebas TDD en backend y frontend.

**Non-Goals:**
- Carga real de archivos `.xlsx` del SIAGIE (`RC06`, queda para Secretaría Académica y backend real).
- Cuentas y roles (`personas`) y vista/exportación CSV de Bitácora (`auditoria`) → Bloque 3.
- Persistencia en PostgreSQL/Alembic (se usa estado contractual en memoria con funciones `reiniciar_*` para pruebas).

## Decisions

### 1. Arquitectura backend y fronteras entre módulos (`ADR-008`, `ADR-005`)
- **`backend/app/modules/institucion/` (ampliación):**
  - `reglas.py` + `exceptions.py`:
    - `validar_nueva_seccion(nivel, grado, letra, letras_existentes)` (`422` si letra fuera de `A–P` o grado fuera de rango `1–6` Primaria / `1–5` Secundaria; `409` si la letra ya existe).
    - `validar_eliminacion_seccion(cantidad_estudiantes)` (`409` si `cantidad_estudiantes > 0`).
  - `schemas.py` + `router.py` (nuevos endpoints):
    - `GET /api/v1/institucion/secciones?nivel=&grado=` → lista secciones del catálogo, conteo de estudiantes (consultado de `matriculas` vía interfaz interna de stub), opciones de docentes/auxiliares y letras libres `A–P`.
    - `POST /api/v1/institucion/secciones` → crea sección (`SeccionCreateIn` → `SeccionAdminOut`) + audita `Asignación`.
    - `PATCH /api/v1/institucion/secciones/{seccion_id}` → actualiza `tutor` y/o `auxiliar` + audita `Asignación`.
    - `DELETE /api/v1/institucion/secciones/{seccion_id}` → valida vacía (`409` si tiene estudiantes), elimina + audita `Asignación`.
    - `GET /api/v1/institucion/asignaturas?nivel=` → catálogo oficial CNEB (`Primaria`, `Secundaria`, `Transversales`).
    - `GET /api/v1/institucion/asignaciones?seccion_id=` → filas `Asignatura | Docente titular | Suplente | Alerta` + `docentes_disponibles`.
    - `PATCH /api/v1/institucion/asignaciones` → actualiza `titular` o `suplente` de `(seccion_id, asignatura)` + audita `Asignación`.
- **`backend/app/modules/matriculas/` (nuevo módulo activo):**
  - `exceptions.py` + `reglas.py` (puras):
    - `validar_asignacion_desde_pool(grado_estudiante, nivel_estudiante, grado_seccion, nivel_seccion)` (`422` si no coinciden).
    - `validar_movimiento_seccion(seccion_origen_id, seccion_destino_id, grado_origen, grado_destino)` (`422` si destino es el mismo origen o distinto grado).
  - `schemas.py` + `router.py` (registrado en `backend/app/main.py`):
    - `GET /api/v1/matriculas/sin-seccion` → lista de estudiantes del pool SIAGIE (`PoolSinSeccionOut`).
    - `GET /api/v1/matriculas/secciones/{seccion_id}/estudiantes` → lista ordenada de estudiantes de la sección con su resumen (`codigo`, `dni`, `apoderado`, `tutor`, KPIs del trimestre y últimos niveles por área) y secciones destino del mismo grado.
    - `POST /api/v1/matriculas/asignar` → asigna estudiante del pool a una sección + audita `Asignación`.
    - `PATCH /api/v1/matriculas/estudiantes/{estudiante_id}/mover` → mueve a otra sección del mismo grado o retira al pool (`destino_seccion_id = "__pool"`) + audita `Asignación`.
    - `PATCH /api/v1/matriculas/estudiantes/{estudiante_id}/estado` → cambia estado (`Activo`, `Retirado`, `Trasladado`) + audita `Asignación`.
- **Evitar ciclos entre `institucion` y `matriculas` (`ADR-008`):**
  - `matriculas` depende de `institucion` para validar metadatos de la sección (nivel/grado/nombre/tutor) mediante un helper de lectura (`obtener_metadatos_seccion`), mientras que `institucion` solo recibe el conteo de estudiantes por sección desde una función de consulta simple o mantiene desacoplada la eliminación consultando el conteo a través de una función inyectable/registro compartido sin importación circular. Específicamente: `matriculas` importa `obtener_seccion_por_id` y `listar_secciones_grado` de `institucion/catalogo_stub.py`, e `institucion/router.py` consulta `contar_estudiantes_en_seccion` de `matriculas/nomina_stub.py` únicamente en capa de presentación (o mantenemos el diccionario de nómina en `matriculas/nomina_stub.py` que NO importa `institucion`, dejando el grafo estrictamente acíclico: `institucion/router -> matriculas/nomina_stub` y `matriculas/router -> institucion/catalogo_stub`, cero ciclos entre archivos).

### 2. Estructura frontend (`features/institucion/` y `features/matriculas/`)
- `frontend/src/features/institucion/componentes/pestanaSeccionesAdmin.tsx`: filtros nivel/grado, botones `Sin sección (N)` y `Nueva sección`, tarjetas de secciones, formulario crear sección (`A–P`), panel detalle de sección (personal a cargo, docentes por asignatura, eliminación segura) embebiendo el panel de estudiantes de `matriculas`.
- `frontend/src/features/matriculas/componentes/panelNominaSeccionAdmin.tsx`: tabla de estudiantes de la sección, selector `Mover a...` / `Quitar de la sección`, acordeón `Resumen` (datos SIAGIE, estado editable, KPIs y niveles por área) y panel desplegable `Estudiantes sin sección` con botón `Asignar a ...`.
- `frontend/src/features/institucion/componentes/pestanaAsignaturasAdmin.tsx`: chips `Primaria`/`Secundaria`/`Transversales` + acordeón de competencias CNEB.
- `frontend/src/features/institucion/componentes/pestanaAsignacionesAdmin.tsx`: chips de grado y sección + tabla editable titular/suplente con alertas inline.
- `frontend/src/features/institucion/vistas/catalogoAdminVista.tsx`: contenedor de las 3 pestañas + portada con KPIs dinámicos según pestaña activa.
- `frontend/src/app/aplicacion.tsx`: `/catalogo` renderiza `<CatalogoAdminVista />`.

### 3. Plan de pruebas por capa (TDD)
- **Backend — Unitarias puras:**
  - `backend/tests/institucion/test_unitario_reglas_catalogo.py` (letras `A–P`, duplicado `409`, grado fuera de rango `422`, eliminación con estudiantes `409`).
  - `backend/tests/matriculas/test_unitario_reglas_matriculas.py` (asignación por grado coincidente/inconsistente `422`, movimiento mismo grado vs distinto grado `422`).
- **Backend — Integración API y auditoría:**
  - `backend/tests/institucion/test_integracion_catalogo_admin.py` (CRUD secciones, asignaturas CNEB, asignaciones docentes, auditoría `RF18`, `403` para rol no Admin).
  - `backend/tests/matriculas/test_integracion_matriculas_admin.py` (pool `sin-seccion`, listar estudiantes + resumen, asignar desde pool, mover entre secciones y al pool, cambiar estado, auditoría `RF18`, `403` para rol no Admin).
  - Actualizar conteo de rutas OpenAPI en `backend/tests/core/test_integracion_salud_y_errores.py`.
- **Frontend — Integración y E2E:**
  - `frontend/src/features/institucion/pruebas/testIntegracionCatalogoAdminVista.test.tsx` (3 pestañas: crear sección, bloquear/permitir eliminación, consultar competencias CNEB, cambiar suplente eliminando alerta).
  - `frontend/src/features/matriculas/pruebas/testIntegracionNominaSeccionAdmin.test.tsx` (asignar desde pool, mover estudiante, expandir resumen y cambiar estado).
  - Actualizar `frontend/src/app/pruebas/testE2eRecorridoAdminBase.test.tsx` para verificar que `/catalogo` ya renderiza la vista real (sin texto de módulo en preparación).

## Risks / Trade-offs

- **Consistencia entre pestaña `Secciones` (`institucion`) y nómina (`matriculas`):** Mitigación: al mutar en `matriculas` (asignar, mover, quitar al pool) se invalidan ambas query keys de React Query (`secciones` + `sin-seccion` + `estudiantes` de la sección) para mantener los contadores sincronizados al instante.
