# Proposal

## Why

Tras completar el Portal Estudiante v2 (Fase 1), la siguiente prioridad del MVP definida por el proyecto es construir el **Portal Docente** a partir del prototipo [Portal Docente.dc.html](../../../prototipos/Portal%20Docente.dc.html) respetando los límites modulares (`ADR-008`). Esta primera parte de la Fase 2 habilita el ingreso y la configuración multi-rol del docente, la navegación adaptada en el shell institucional, el tablero de inicio docente (bandeja de entrada, clases de hoy, alertas y etapas del trimestre) y la grilla de secciones a cargo, dejando listo el terreno para los módulos de evaluación continua y exportación SIAGIE en los cambios siguientes.

## What Changes

- **Identidad multi-rol (`identidad`)**:
  - Ampliar `UsuarioSesionOut` con los campos opcionales de perfil docente (`docente_id`, `especialidad`, `nivel_educativo`, `secciones_a_cargo`) sin alterar los campos actuales del estudiante.
  - Permitir en el stub `POST /api/v1/identidad/login` autenticar el perfil docente de demostración (DNI `41257836`, `rol: "Docente"`) y adaptar `ConfiguracionVista` para mostrar datos de especialidad y secciones en solo lectura, manteniendo `AvatarIniciales` sin subida de fotografía (`RC08`).
- **Plataforma web multi-rol y contratos OpenAPI (`plataforma-web`)**:
  - Parametrizar `MarcoPortal` (`shared/componentes/marcoPortal.tsx`) para renderizar dinámicamente el menú lateral e inferior, el subtítulo institucional y los contadores de insignia según `usuario.rol` (`Estudiante` vs. `Docente`), conservando compatibilidad total con las props previas.
  - Despachar en `app/aplicacion.tsx` el enrutamiento autenticado según rol (`/inicio`, `/cursos`, `/configuracion` y las rutas de enlace para `/nota-del-dia`, `/mensajes` y `/siagie` con pantallas preparadas hasta completar los cambios siguientes de Fase 2).
  - Exponer en OpenAPI los endpoints contractuales stub del inicio, bandeja y secciones del docente bajo `/api/v1/seguimiento/docentes/{docente_id}/...`.
- **Seguimiento docente (`seguimiento`)**:
  - Implementar en `backend/app/modules/seguimiento/` los endpoints contractuales para consultar el tablero de inicio docente (`GET .../inicio`), marcar un mensaje de bandeja como leído (`POST .../bandeja/{mensaje_id}/leer`), marcar toda la bandeja como leída (`POST .../bandeja/leer-todo`), responder consultas de estudiantes en hilo (`POST .../bandeja/{mensaje_id}/responder`) y listar la grilla de secciones a cargo (`GET .../cursos`).
  - Implementar en `frontend/src/features/seguimiento/` la lógica pura de filtrado de bandeja (`filtrosBandejaDocente.ts`), los componentes de bandeja y tarjetas (`bandejaDocente.tsx`) y las vistas `InicioDocenteVista` y `CursosDocenteVista` con soporte escritorio y móvil (`AC07`), cubiertos bajo TDD estricto ([tdd.md](../../../docs/06-estandares/tdd.md)) y [nomenclatura.md](../../../docs/06-estandares/nomenclatura.md).
- **Fuera de alcance en este cambio (`docente-evaluacion-y-clases` / `docente-mensajes-y-siagie` / `RC08`)**:
  - Cuadrícula de criterios `K1..K4` (`Nota del día`), registro auxiliar, confirmación de niveles/conclusiones y alta de actividades/observaciones (corresponden a `docente-evaluacion-y-clases`).
  - Redactor masivo de mensajes docente y descarga de Excel SIAGIE / Actas preliminares (corresponden a `docente-mensajes-y-siagie`).
  - Subida de fotografías de perfil, subida de archivos en mensajes/actividades y chat en tiempo real (`RC08`), así como persistencia real en PostgreSQL (Fase 5).

## Capabilities

### New Capabilities

*(Ninguna: todas las capacidades de este cambio amplían módulos ya especificados en `openspec/specs/`.)*

### Modified Capabilities

- `identidad`: soporte de autenticación, sesión y configuración en solo lectura para el rol `Docente` (`RF14`, `RC07`, `RC08`, `AC04`).
- `plataforma-web`: shell responsivo `MarcoPortal` parametrizado por rol (`Estudiante` / `Docente`) y ampliación del contrato OpenAPI bajo `/api/v1` (`RC01`, `RC03`, `AC06`, `AC07`).
- `seguimiento`: tablero de inicio docente (bandeja con filtros y respuesta acotada a estudiantes, clases de hoy, notas pendientes, alertas y cronograma del trimestre) y listado resumen de secciones a cargo (`RF04`, `RF25`, `RF26`, `RF31`, `HU12`, `HU15`, `AC04`, `AC06`, `AC07`).

## Impact

- **IDs atendidos:** `RF04`, `RF14`, `RF25`, `RF26`, `RF29`, `RF31`, `HU08`, `HU12`, `HU15`, `HU17`, `AC04`, `AC06`, `AC07`, `RC01`, `RC03`, `RC07`, `RC08`, `ADR-006`, `ADR-008`.
- **Backend (`backend/`):** `app/modules/identidad/{schemas.py,router.py}`, `app/modules/seguimiento/{schemas.py,router.py}`, `openapi.json`, `tests/core/test_integracion_salud_y_errores.py`, `tests/identidad/test_integracion_contrato_identidad.py` y `tests/seguimiento/test_integracion_contrato_seguimiento.py`.
- **Frontend (`frontend/src/`):** regeneración Orval en `api/generated/`, `shared/utilidades/sesion.ts`, `shared/componentes/marcoPortal.tsx`, `app/aplicacion.tsx`, `features/identidad/`, `features/seguimiento/` y sus respectivas pruebas bajo `pruebas/`.
- **Estándares:** cumplimiento estricto de `camelCase` en `frontend/src/` (`vistas/`, `componentes/`, `utilidades/`, `pruebas/test<Tipo><Contexto>.test.ts(x)`), `snake_case` en `backend/` (`tests/<modulo>/test_<tipo>_<contexto>.py`) y cero cruces indebidos entre módulos (`ADR-008`).
