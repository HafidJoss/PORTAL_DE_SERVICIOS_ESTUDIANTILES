# Design

## Context

`frontend/` solo contiene carpetas `.gitkeep` (`src/api/generated/` y `src/features/`) y `backend/` aún no tiene `main.py` ni contratos OpenAPI definidos. Al revisar el alcance inicial de `bootstrap-frontend`, se acordó dejar listos en FastAPI todos los **endpoints contractuales (routers + esquemas Pydantic stub)** requeridos por `Estudiante v2`, de modo que Orval genere de una vez los tipos y hooks de todo el flujo del estudiante y la lógica de negocio real (`service.py`, `reglas.py`, `repository.py`, PostgreSQL) se conecte después sin alterar las firmas HTTP.

## Goals / Non-Goals

**Goals:**
- Inicializar la SPA en `frontend/` con Vite, React, TypeScript, React Router y TanStack Query (`ADR-001`, `ADR-006`).
- Exponer en FastAPI (`backend/app/`) el endpoint `GET /api/v1/health`, el manejador global RFC 9457 (`core/errors.py`) y los `router.py` + `schemas.py` stub de los 5 módulos consumidos por `Estudiante v2` (`identidad`, `seguimiento`, `evaluacion`, `asistencia`, `reportes`) respetando `enfoque-arquitectonico.md` (`ADR-008`).
- Exportar el contrato `/openapi.json` y generar automáticamente en `frontend/src/api/generated/` los tipos y hooks de TanStack Query con **Orval**, respaldados por un mutator HTTP con cookie `__session`, CSRF y Problem Details (RFC 9457).
- Implementar el sistema de tokens CSS y componentes base del [Manual UI/UX](file:///c:/Users/PC/Desktop/PORTAL_DE_SERVICIOS_ESTUDIANTILES/prototipos/uploads/manual_de_dise_o_ui_ux_sistema_web_g_u_e_mariscal_c_ceres.md) (paleta `#C81E1E` / `#1E293B` / `#D97706` / `#F8FAFC`, tipografías `Plus Jakarta Sans`, `Inter` con `tabular-nums` y `Space Grotesk`, badges `AD/A/B/C`, avatar de iniciales y tema claro/oscuro en `localStorage`).
- Implementar el shell responsivo (`PortalLayout`) basado en [Portal Estudiante v2.dc.html](file:///c:/Users/PC/Desktop/PORTAL_DE_SERVICIOS_ESTUDIANTILES/prototipos/Portal%20Estudiante%20v2.dc.html) con sidebar escritorio y barra inferior móvil (`360x640`+).
- Configurar `Vitest` + `React Testing Library` + `MSW` en `frontend/` y `pytest` + `TestClient` en `backend/`.

**Non-Goals:**
- Implementar las vistas de negocio de `Estudiante v2` (se implementan en `identidad-estudiante-web`, `seguimiento-estudiante-web` y `evaluacion-reportes-estudiante-web`).
- Implementar `service.py`, `reglas.py`, `repository.py`, `models.py`, PostgreSQL, Alembic o `import-linter` (`bootstrap-backend` y cambios de negocio del backend).
- Subida de foto de perfil (`RC07`, `RC08`; se usa avatar de iniciales) ni endpoints exclusivos de otros roles (`Docente`, `Apoderado`, `Auxiliar`, `Secretaría`, `Dirección`, `Administrador`).

## Decisions

### 1. Contratos y endpoints stub por módulo en `backend/app/` (`ADR-008`)
Para respetar `enfoque-arquitectonico.md` desde el inicio, los endpoints viven en la capa de presentación (`router.py` y `schemas.py`) de cada módulo propietario y **no** contienen reglas de negocio ni llamadas entre módulos ni base de datos:

| Módulo (`backend/app/modules/`) | Endpoints expuestos bajo `/api/v1` | Esquemas principales (`schemas.py`) |
| :--- | :--- | :--- |
| `core` (`app/main.py`, `core/errors.py`) | `GET /health` | `HealthOut`, `ProblemDetail` |
| `identidad` | `POST /identidad/login`, `POST /identidad/activar`, `POST /identidad/logout`, `GET /identidad/sesion`, `POST /identidad/cambiar-contrasena`, `GET /identidad/aviso-privacidad` | `LoginIn`, `ActivacionIn`, `CambioContrasenaIn`, `SesionOut`, `AvisoPrivacidadOut` |
| `seguimiento` | `GET /seguimiento/estudiantes/{estudiante_id}/inicio`, `POST /seguimiento/estudiantes/{estudiante_id}/novedades/visto`, `GET /seguimiento/estudiantes/{estudiante_id}/cursos`, `GET /seguimiento/estudiantes/{estudiante_id}/cursos/{asignatura_id}` | `InicioEstudianteOut` (incluye novedades, KPIs y agenda semanal para variantes A/B/C), `CursoResumenOut`, `CursoDetalleOut` |
| `evaluacion` | `GET /evaluacion/estudiantes/{estudiante_id}/calificaciones`, `GET /evaluacion/estudiantes/{estudiante_id}/actividades`, `GET /evaluacion/estudiantes/{estudiante_id}/mensajes`, `POST /evaluacion/mensajes/{mensaje_id}/leer`, `POST /evaluacion/mensajes/{mensaje_id}/respuestas` | `CalificacionesCursoOut`, `ActividadOut` (tipo `trabajo` \| `sesion_clase`), `MensajeOut`, `RespuestaMensajeIn`, `RespuestaMensajeOut` |
| `asistencia` | `GET /asistencia/estudiantes/{estudiante_id}` | `AsistenciaMesOut`, `DiaAsistenciaOut`, `IncidenciaAsistenciaOut` |
| `reportes` | `GET /reportes/estudiantes/{estudiante_id}/libretas`, `GET /reportes/estudiantes/{estudiante_id}/libretas/{trimestre_id}/descarga` | `LibretasOut` (incluye situación final `PRO`/`PER`/`RR` cuando aplica), `UrlDescargaOut` |

- **Comportamiento stub y evolución:** Cada `router.py` devuelve datos ficticios tipados válidos (sin datos reales de menores, `tdd.md` regla 8) o `Depends` reemplazable por `service.py` cuando se implemente cada módulo del backend, manteniendo intactos los paths y esquemas `...In` / `...Out` (`DTO` pattern).
- **Validación y errores:** FastAPI traduce errores de validación (`RequestValidationError`), `HTTPException` (como `404`) y errores base al esquema RFC 9457 `ProblemDetail` (`type`, `title`, `status`, `detail`, `instance`) en `core/errors.py`.
- **Dependencias entre módulos:** Cero dependencias entre módulos (`router.py` solo importa sus propios `schemas.py`), cumpliendo `arquitectura-inicial.md` y evitando ciclos.

### 2. Organización de carpetas en `frontend/src/` (`ADR-008`)
- `frontend/src/app/`: `main.tsx`, `App.tsx`, `queryClient.ts` (TanStack Query), `RouterProvider`, `ThemeProvider` y manejo global de sesión expirada (`401`).
- `frontend/src/api/`:
  - `http.ts`: mutator de Orval sobre `fetch` (`credentials: 'include'`, header `X-CSRF-Token` en métodos mutadores leyendo cookie CSRF, parseo de `ProblemDetailError` RFC 9457, disparo de `onUnauthorized` en `401` y preservación de sesión en `403`).
  - `generated/`: cliente TypeScript + hooks React Query generados por Orval agrupados por tag (`core`, `identidad`, `seguimiento`, `evaluacion`, `asistencia`, `reportes`). Nunca se edita a mano.
- `frontend/src/shared/`:
  - `styles/tokens.css`: variables CSS del Manual UI/UX y tokens propios bajo `[data-theme="dark"]` (WCAG AA, sin `filter: invert()`).
  - `components/`: `Button`, `Card`, `BadgeNivel` (`AD/A/B/C/—`), `AvatarIniciales`, `EstadoVacio`, `BannerHero`, `PortalLayout` (sidebar escritorio y topbar/bottom-bar móvil).
- `frontend/src/features/`: carpetas espejo de los 9 módulos del MVP (`identidad/`, `seguimiento/`, `evaluacion/`, `asistencia/`, `reportes/`, `institucion/`, `personas/`, `matriculas/`, `auditoria/`). En este cambio se habilita la ruta base y estado de conectividad para probar la integración end-to-end contra `/api/v1/health`.

### 3. Estrategia de caché y descarga de archivos (`ADR-002`, `ADR-006`)
- `QueryClient` con `retry: false` en `401`/`403`/`404` y `staleTime` de 60 s en cliente; las respuestas del backend llevan `Cache-Control: private, no-store` (`ADR-006`).
- `Libreta` expone un endpoint dedicado `/descarga` que entregará la URL firmada temporal de 15 minutos (`ADR-002`, `RC05`).

### 4. Recurso visual institucional
- Copiar `escudo.png` a `frontend/public/escudo.png` (recurso gráfico público sin datos personales) para evitar dependencias en runtime hacia `prototipos/`.

## Plan de Pruebas por Capa (`tdd.md`)

| Capa | Qué se prueba | Herramienta | Tipo |
| :--- | :--- | :--- | :--- |
| **Core y errores** (`backend/app/core/errors.py`, `main.py`) | `GET /api/v1/health` (HTTP 200), respuesta RFC 9457 en `404` y validación `422` en formato Problem Details | `pytest` + `TestClient` | Integración sin BD |
| **Contratos OpenAPI de módulos** (`backend/app/modules/*/router.py`) | Presencia de las 18 rutas de Estudiante v2 en `/openapi.json`, validación Pydantic (`422` ante payloads inválidos) y conformidad con esquemas `...Out` | `pytest` + `TestClient` | Contrato / Integración sin BD |
| **Cliente HTTP** (`frontend/src/api/http.ts`) | Envío de `credentials: 'include'`, header CSRF en mutaciones, parseo de `ProblemDetail` en `409`, callback `401` y conservación de sesión en `403` | `Vitest` + `MSW` | Unitaria con red simulada |
| **Tema y preferencias** (`ThemeProvider`) | Alternancia claro/oscuro y persistencia en `localStorage` tras remonte | `Vitest` + `React Testing Library` | Unitaria |
| **Componentes base y Shell** (`AvatarIniciales`, `BadgeNivel`, `PortalLayout`) | Iniciales desde nombre completo sin subida de foto, variantes `AD/A/B/C/—`, sidebar en escritorio (`>= 1024 px`) y barra inferior/topbar en móvil (`360x640`) | `Vitest` + `React Testing Library` | Componentes UI |

*Nota sobre `api/generated/`:* Según `docs/06-estandares/tdd.md` sección 9, el código generado por Orval no se edita ni se prueba directamente.

## Risks / Trade-offs

- **Evolución de esquemas al implementar el backend real:** Algunos campos de detalle (p. ej. paginación por cursor en `seguimiento` o filtros finos) podrían requerir ajustes menores cuando se implementen `service.py` y `repository.py`. Mitigación: diseñar los `schemas.py` alineados a `01-diseno-interno-de-modulos.md` y `Portal Estudiante v2.dc.html` desde ahora y regenerar Orval con un solo comando ante cambios en OpenAPI.
- **Convivencia con `bootstrap-backend`:** `backend/pyproject.toml` mínimo será ampliado en `bootstrap-backend` con SQLAlchemy, Alembic, `testcontainers`, `ruff` e `import-linter`. Mitigación: respetar exactamente la estructura de carpetas de `enfoque-arquitectonico.md` desde el inicio.
