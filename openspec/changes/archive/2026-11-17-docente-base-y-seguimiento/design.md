# Design

## Context

Véase [proposal.md](proposal.md) para motivación y alcance. Actualmente:
- En backend (`backend/app/modules/`), `identidad` expone perfil único `Estudiante` en `GET /sesion` y `POST /login` (aunque `RolUsuario` ya incluye `"Docente"`), y `seguimiento` expone 4 endpoints exclusivamente bajo `/estudiantes/{estudiante_id}/...`.
- En frontend (`frontend/src/`), `aplicacion.tsx` enruta las 10 vistas de `Estudiante v2` dentro de `MarcoPortal`, el cual tiene fijas las constantes `DESKTOP_NAV` y `MOBILE_NAV`. Las pruebas actuales (`17` en backend y `79` en frontend) validan todo el flujo de estudiante.
- Se mantiene el enfoque de Fase 1: contratos OpenAPI tipados en stub FastAPI, generación automática de hooks en `frontend/src/api/generated/` mediante Orval (`ADR-006`) y separación modular estricta (`ADR-008`) en español y `camelCase`/`snake_case` ([nomenclatura.md](../../../docs/06-estandares/nomenclatura.md)).

## Goals / Non-Goals

**Goals:**
- Habilitar el flujo base del rol `Docente` sin alterar ninguna ruta ni prueba existente del rol `Estudiante`.
- Mantener la división modular por capacidad de negocio (`identidad`, `seguimiento`, `shared`, `app`) respetando `ADR-008`.
- Proveer reglas puras en frontend para filtrado/ordenamiento de bandeja de entrada docente y despachador por rol cubiertos por TDD (`tdd.md`).

**Non-Goals:**
- Persistencia en PostgreSQL, autenticación con cookies `__session` reales o migraciones Alembic (corresponden a Fase 5).
- Cuadrícula `Nota del día` editable, registro auxiliar, confirmación de niveles/conclusiones ni alta de actividades/observaciones (corresponden a `docente-evaluacion-y-clases`).
- Redactor completo de `Mensajes` docente ni pantalla `Exportar al SIAGIE` (corresponden a `docente-mensajes-y-siagie`); sus rutas mostrarán vistas preparadas en construcción enlazando de vuelta al tablero/secciones.
- Subida de foto de perfil en `Configuración` (`RC08`).

## Decisions

### 1. Autenticación stub multi-rol compatible hacia atrás (`identidad`)
- **Decisión:** Ampliar `UsuarioSesionOut` (`backend/app/modules/identidad/schemas.py`) con campos opcionales (`docente_id`, `especialidad`, `nivel_educativo`, `secciones_a_cargo`) manteniendo `None` por defecto para estudiantes. En `identidad/router.py`, `_usuario_demo(dni)` devolverá el perfil `Docente` (`doc-demo-1`, `Prof. Julio Gamboa Rojas`, Matemática · Secundaria) cuando `dni == "41257836"` y el perfil `Estudiante` (`est-demo-1`) para cualquier otro DNI válido; `GET /sesion` conserva el estudiante por defecto para no romper las pruebas de sesión ni el arranque sin login en pruebas E2E existentes.
- **Alternativa descartada:** Cambiar `GET /sesion` o exigir parámetro obligatorio en `LoginIn`, lo cual rompería contratos vigentes de Fase 1.
- **En frontend:** `FormularioIngreso` ya guarda la respuesta de `POST /login` en caché de TanStack Query (`queryClient.setQueryData`), por lo que iniciar sesión con `41257836` conmuta inmediatamente la sesión activa a `Docente`. En `shared/utilidades/sesion.ts` se añade `resolverDocenteId(usuario)` simétrico a `resolverEstudianteId(usuario)`.

### 2. Shell y enrutamiento por rol (`plataforma-web` · `MarcoPortal` + `aplicacion.tsx`)
- **Decisión:** Parametrizar `MarcoPortal` (`shared/componentes/marcoPortal.tsx`) mediante props opcionales (`navItems`, `navMovilItems`, `subtituloPortal`, manteniendo los valores de Estudiante como valor por defecto para conservar compatibilidad 100 % con `testComponenteMarcoPortal.test.tsx`). En `app/aplicacion.tsx`, `PortalAutenticado` elige el árbol de rutas según `usuario.rol === "Docente"`:
  - `/inicio` → `InicioDocenteVista`
  - `/cursos` → `CursosDocenteVista`
  - `/cursos/:asignaturaId`, `/nota-del-dia`, `/mensajes`, `/siagie` → vistas puente informativas dentro de `seguimiento`/`evaluacion`/`reportes` que se reemplazarán directamente en los cambios 2 y 3 de Fase 2.
  - `/configuracion` → `ConfiguracionVista` compartida (adaptando etiqueta de rol, datos de especialidad/secciones y descripciones de avisos cuando `usuario.rol === "Docente"`, sin subida de foto por `RC08`).
- **Alternativa descartada:** Duplicar un prefijo `/docente/...` separado o crear `PortalDocenteLayout.tsx`, lo que duplicaría lógica de barra lateral, tema y cierre de sesión.

### 3. Endpoints contractuales y estado stub en `seguimiento` docente
- **Decisión:** Agregar en `backend/app/modules/seguimiento/`:
  - `GET /api/v1/seguimiento/docentes/{docente_id}/inicio` → `InicioDocenteOut` (trimestre actual, conteo sin leer y por calificar, `mensajes_bandeja`, `clases_hoy`, `notas_pendientes`, `alertas`, `etapas_trimestre`).
  - `POST /api/v1/seguimiento/docentes/{docente_id}/bandeja/{mensaje_id}/leer` → `OperacionBandejaOut` (marca mensaje leído; `404` RFC 9457 si `mensaje_id` no existe).
  - `POST /api/v1/seguimiento/docentes/{docente_id}/bandeja/leer-todo` → `OperacionBandejaOut`.
  - `POST /api/v1/seguimiento/docentes/{docente_id}/bandeja/{mensaje_id}/responder` con `RespuestaBandejaIn(texto)` (`min_length=2`) → `RespuestaBandejaOut` (`404` si no existe, `422` si texto corto, `400`/`403` RFC 9457 si se intenta responder a un mensaje institucional `kind != "stu"`).
  - `GET /api/v1/seguimiento/docentes/{docente_id}/cursos` → `ListaSeccionesDocenteOut` (resumen de secciones asignadas `3.° A`, `3.° B`, `4.° A`, `4.° C` con horario, aula, tutor, cantidad de estudiantes, pendientes y `competencias_confirmadas`).
- **Reglas de frontera (`ADR-008`):** `backend/app/modules/seguimiento` no importa de otros módulos de negocio (solo `ErrorAplicacion` de `app/core/errores.py`). En frontend, `features/seguimiento` consume únicamente `api/generated/`, `shared/` y sus propios submódulos (`utilidades/`, `componentes/`, `vistas/`).

### 4. Plan de pruebas por capa (`tdd.md`)
- **Backend (`backend/tests/`):**
  - `test_integracion_salud_y_errores.py`: actualizar conteo OpenAPI con las nuevas rutas docentes.
  - `test_integracion_contrato_identidad.py`: verificar que `POST /login` con DNI `41257836` devuelve `rol: "Docente"` y `docente_id`, preservando el caso Estudiante.
  - `test_integracion_contrato_seguimiento.py`: cubrir `GET inicio`, `POST leer`, `POST leer-todo`, `POST responder` (éxito en estudiante, rechazo en comunicado institucional `400` y texto inválido `422`) y `GET cursos` para docente.
- **Frontend (`frontend/src/**/pruebas/`):**
  - `shared/pruebas/testComponenteMarcoPortal.test.tsx`: añadir escenario de navegación docente con insignias en escritorio y móvil (`360 px`).
  - `features/identidad/pruebas/testIntegracionConfiguracionVista.test.tsx`: añadir escenario con perfil `Docente` en solo lectura y sin upload de foto (`RC08`).
  - `features/seguimiento/pruebas/testUnitarioFiltrosBandejaDocente.test.ts` (TDD primero): pruebas puras para filtros `todos`, `no_leidos`, `institucion`, `estudiantes`, cálculo de conteo sin leer y validación de respuesta acotada.
  - `features/seguimiento/pruebas/testIntegracionInicioDocenteVista.test.tsx`: renderizado de tablero, filtros, marcar leído/todo leído, respuesta en hilo a estudiante y estado de error con reintento.
  - `features/seguimiento/pruebas/testIntegracionCursosDocenteVista.test.tsx`: grilla de secciones, estado vacío y reintento ante error.
  - `app/pruebas/testE2eRecorridoDocenteBase.test.tsx`: flujo completo login docente (`41257836`) → inicio docente → mis cursos → configuración → cierre de sesión.

## Risks / Trade-offs

- **[Stub sin persistencia entre recargas en bandeja docente]** → Los cambios optimistas en bandeja (marcar leído/responder) se reflejan en caché local de React Query tras la respuesta `200` del endpoint contractual para ofrecer feedback inmediato hasta que Fase 5 conecte PostgreSQL.
- **[Pantallas puente en `/nota-del-dia`, `/mensajes` y `/siagie` durante cambio 1]** → Se documentan explícitamente como enlaces preparatorios hacia los cambios 2 y 3 de Fase 2 (`docente-evaluacion-y-clases` y `docente-mensajes-y-siagie`), evitando enlaces muertos (`404`).
- **[Actualización del test global de conteo de rutas OpenAPI]** → Se actualiza la aserción exacta en `test_integracion_salud_y_errores.py` en la misma tarea que añade los endpoints para mantener trazabilidad estricta del contrato.
