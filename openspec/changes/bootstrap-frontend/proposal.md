# Proposal

## Why

El repositorio no cuenta todavía con proyecto inicializado en `frontend/` ni con los endpoints y contratos OpenAPI en `backend/` para generar el cliente TypeScript con Orval. Este cambio estructura la base completa del frontend (React + TypeScript + Vite, sistema visual institucional, shell responsivo para `Estudiante v2`, cliente HTTP/TanStack Query y entorno de pruebas TDD) y deja listos en FastAPI los endpoints y esquemas de contrato OpenAPI para todos los flujos de `Estudiante v2`, de modo que las vistas del frontend puedan conectarse desde el inicio y la lógica real del backend se implemente después sin romper el contrato.

## What Changes

- **Contratos y endpoints stub en FastAPI (`backend/`):** Creación del punto de entrada (`backend/app/main.py`, `backend/app/core/errors.py`) y de la capa de presentación (`router.py` y `schemas.py` Pydantic separados de entrada y salida) para `GET /api/v1/health` y los 5 módulos consumidos por `Estudiante v2`: `identidad`, `seguimiento`, `evaluacion`, `asistencia` y `reportes`. Exponen respuestas tipadas de contrato (sin base de datos ni reglas de negocio aún) y errores en formato Problem Details (RFC 9457).
- **Proyecto base del frontend (`frontend/`):** Inicialización con React, TypeScript y Vite, configuración de TanStack Query, React Router, Vitest + React Testing Library + MSW y generación completa del cliente TypeScript en `frontend/src/api/generated/` con Orval a partir del OpenAPI exportado por FastAPI (`ADR-001`, `ADR-008`).
- **Sistema de diseño y tokens CSS:** Tokens y componentes base del Manual UI/UX de la G.U.E. Mariscal Cáceres (paleta 60-30-10 `#C81E1E` / `#1E293B` / `#D97706` / `#F8FAFC`, tipografías `Plus Jakarta Sans`, `Inter` con `tabular-nums` y `Space Grotesk`, botones, tarjetas, badges `AD/A/B/C`, avatar de iniciales y soporte de tema claro/oscuro en `localStorage`).
- **Shell responsivo de navegación:** Estructura adaptable escritorio (barra lateral fija con escudo y perfil) y móvil (`360x640` / `390x844` con barra superior y barra inferior de navegación), lista para alojar las vistas de `Estudiante v2` en los cambios siguientes (`RC01`, `AC07`).
- **Cliente HTTP y manejo de errores:** Mutator para Orval con envío de credenciales (`cookie` httpOnly `__session`), encabezado CSRF, detección de sesión expirada (`401`) y traducción uniforme de errores RFC 9457 Problem Details (`ADR-004`, `ADR-008`).

## Capabilities

### New Capabilities
- `plataforma-web`: Infraestructura base de la SPA responsiva, sistema de diseño institucional, cliente HTTP con manejo de errores Problem Details, verificación de salud y contratos OpenAPI base en `/api/v1` para el flujo de Estudiante v2.

### Modified Capabilities
<!-- Ninguna: aún no existen specs vigentes en openspec/specs/. -->

## Trazabilidad y Alcance

- **Requisitos e historias atendidos:** Prepara el contrato API y la plataforma visual para `HU06`, `HU10`, `HU12`, `HU16` (`RF01`, `RF04`, `RF07`, `RF08`, `RF14`, `RF15`, `RF20`, `RF22`–`RF27`, `RF28`, `RF29`); cumple directamente `RC01`, `RC03`, `RC05`, `RC07`, `AC01`, `AC04`, `AC06` y `AC07`.
- **Módulos propietarios:** Infraestructura transversal (`frontend/src/shared/`, `frontend/src/api/`, `backend/app/main.py`, `backend/app/core/errors.py`) y capa de presentación stub (`router.py` y `schemas.py`) en `backend/app/modules/{identidad,seguimiento,evaluacion,asistencia,reportes}/`.
- **Decisiones arquitectónicas aplicadas:** `ADR-001`, `ADR-002`, `ADR-004`, `ADR-006`, `ADR-008`.
- **Fuera de alcance (`RC08`):** Implementación de las pantallas de negocio de `Estudiante v2` (van en los cambios `identidad-estudiante-web`, `seguimiento-estudiante-web` y `evaluacion-reportes-estudiante-web`), lógica de `service.py`/`reglas.py`/`repository.py`, PostgreSQL/Alembic/`import-linter` (`bootstrap-backend`), subida de foto de perfil (`RC07`), portales de otros roles (`Apoderado`, `Docente`, `Auxiliar`, `Secretaría`, `Dirección`, `Administrador`), matrícula, admisión, pagos o chat en tiempo real (`RC08`).

## Impact

- **Código nuevo en `backend/`:** `pyproject.toml`, `app/main.py`, `app/core/errors.py`, `app/modules/{identidad,seguimiento,evaluacion,asistencia,reportes}/{router.py,schemas.py}`, script de exportación `openapi.json` y pruebas `pytest` de contratos/errores.
- **Código nuevo en `frontend/`:** `package.json`, `vite.config.ts`, `tsconfig.json`, `orval.config.ts`, `vitest.config.ts`, `public/escudo.png`, `src/app/`, `src/shared/`, `src/api/http.ts`, `src/api/generated/`, carpetas espejo `src/features/` y pruebas en Vitest.
- **Dependencias externas de diseño:** Tipografías Google Fonts (`Plus Jakarta Sans`, `Inter`, `Space Grotesk`) e iconos (`lucide-react`), sin servicios de Google Cloud en local (`tdd.md` regla 9).
