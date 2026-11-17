# Tasks

## 1. Base de FastAPI, manejo RFC 9457 y contratos OpenAPI (`backend/`)

- [x] 1.1 Inicializar `backend/pyproject.toml` mínimo (FastAPI, Pydantic, Uvicorn, pytest, httpx) y estructura de paquetes (`backend/app/core/`, `backend/app/modules/`).
- [x] 1.2 [Rojo] Escribir pruebas en `backend/tests/core/test_health_y_errors.py` para `GET /api/v1/health` (HTTP 200), respuesta `404` en formato Problem Details (`type`, `title`, `status`, `detail`) y `422` en formato Problem Details.
- [x] 1.3 [Verde] Implementar `backend/app/core/errors.py` (esquema `ProblemDetail` y manejadores globales RFC 9457) y `backend/app/main.py` (app FastAPI con `/api/v1/health`), verificando `pytest` en verde.
- [x] 1.4 [Rojo] Escribir pruebas de contrato en `backend/tests/identidad/test_router_contrato.py` para las 6 rutas de `identidad` (`login`, `activar`, `logout`, `sesion`, `cambiar-contrasena`, `aviso-privacidad`), incluyendo validación `422` con DNI inválido o contraseña corta.
- [x] 1.5 [Verde] Implementar `backend/app/modules/identidad/schemas.py` y `router.py` stub (con datos ficticios válidos de contrato) y registrarlos en `main.py`, verificando `pytest` en verde.
- [x] 1.6 [Rojo] Escribir pruebas de contrato en `backend/tests/seguimiento/test_router_contrato.py` para los 4 endpoints de `seguimiento` (`inicio` con datos para variantes A/B/C, `novedades/visto`, `cursos`, `cursos/{asignatura_id}`).
- [x] 1.7 [Verde] Implementar `backend/app/modules/seguimiento/schemas.py` y `router.py` stub, verificando `pytest` en verde.
- [x] 1.8 [Rojo] Escribir pruebas de contrato en `backend/tests/evaluacion/test_router_contrato.py`, `backend/tests/asistencia/test_router_contrato.py` y `backend/tests/reportes/test_router_contrato.py` para los endpoints de `evaluacion` (5 rutas, diferenciando `trabajo` y `sesion_clase`, más lectura/respuesta en hilo), `asistencia` (1 ruta) y `reportes` (2 rutas, incluyendo `PRO`/`PER`/`RR` y descarga).
- [x] 1.9 [Verde] Implementar `schemas.py` y `router.py` stub de `evaluacion`, `asistencia` y `reportes`, registrarlos en `main.py` y verificar todas las pruebas de `pytest` en verde.
- [x] 1.10 [Refactor] Agregar script de exportación de `openapi.json` desde FastAPI (sin base de datos ni servidor externo) y verificar que `/openapi.json` expone las 18 rutas bajo `/api/v1`.

## 2. Proyecto React, Vite, Vitest y generación completa con Orval (`frontend/`)

- [x] 2.1 Inicializar `frontend/` con `package.json` (React, TypeScript, Vite, React Router, TanStack Query, lucide-react, Vitest, React Testing Library, `@testing-library/jest-dom`, MSW, Orval, ESLint), `tsconfig.json`, `vite.config.ts` y `vitest.config.ts`.
- [x] 2.2 Configurar `frontend/orval.config.ts` apuntando al `openapi.json` exportado de FastAPI y generar el cliente TypeScript + hooks React Query completos para `Estudiante v2` en `frontend/src/api/generated/`.
- [x] 2.3 Copiar `escudo.png` a `frontend/public/escudo.png` y crear las carpetas espejo bajo `frontend/src/features/` (`identidad`, `seguimiento`, `evaluacion`, `asistencia`, `reportes`, `institucion`, `personas`, `matriculas`, `auditoria`).

## 3. Cliente HTTP, sesión y errores RFC 9457 (`frontend/src/api/`)

- [x] 3.1 [Rojo] Escribir pruebas con Vitest + MSW en `frontend/src/api/__tests__/http.test.ts` para envío de `credentials: 'include'`, header CSRF en mutaciones, traducción de `ProblemDetail` en `409`, disparo de `onUnauthorized` en `401` y conservación de sesión en `403`.
- [x] 3.2 [Verde] Implementar `frontend/src/api/http.ts` (`ProblemDetailError`, lectura de CSRF, callback `401`) y `frontend/src/app/queryClient.ts`, conectando `http.ts` como mutator de Orval y verificando `vitest` en verde.
- [x] 3.3 [Refactor] Regenerar el cliente Orval usando el mutator `http.ts` y confirmar `tsc -b` y `vitest` en verde.

## 4. Sistema de diseño, tema claro/oscuro y componentes base (`frontend/src/shared/`)

- [x] 4.1 Definir `frontend/src/shared/styles/tokens.css` y `frontend/index.html` con Google Fonts (`Plus Jakarta Sans`, `Inter`, `Space Grotesk`), tokens del Manual UI/UX (`#C81E1E`, `#1E293B`, `#D97706`, `#F8FAFC`), `tabular-nums` y variables `[data-theme="dark"]` accesibles (WCAG AA).
- [x] 4.2 [Rojo] Escribir pruebas en `frontend/src/app/__tests__/ThemeProvider.test.tsx` para alternancia de tema claro/oscuro y persistencia en `localStorage` tras remonte.
- [x] 4.3 [Verde] Implementar `frontend/src/app/ThemeProvider.tsx` y verificar pruebas en verde.
- [x] 4.4 [Rojo] Escribir pruebas en `frontend/src/shared/components/__tests__/componentesBase.test.tsx` para `AvatarIniciales` (iniciales desde nombre completo, sin subida de imagen) y `BadgeNivel` (`AD`, `A`, `B`, `C`, `—`).
- [x] 4.5 [Verde] Implementar `Button`, `Card`, `BadgeNivel`, `AvatarIniciales`, `BannerHero` y `EstadoVacio` en `frontend/src/shared/components/`, verificando `vitest` en verde.

## 5. Shell responsivo y verificación integral (`frontend/src/shared/`, `frontend/src/app/`)

- [x] 5.1 [Rojo] Escribir pruebas en `frontend/src/shared/components/__tests__/PortalLayout.test.tsx` para escritorio (`>= 1024 px`: sidebar visible con escudo, navegación y avatar de iniciales) y móvil (`360x640`: sidebar oculta, topbar y navegación inferior visibles sin desbordamiento).
- [x] 5.2 [Verde] Implementar `PortalLayout` (`frontend/src/shared/components/PortalLayout.tsx`) y `frontend/src/app/App.tsx` con las rutas base de `Estudiante v2` y verificación de salud contra el hook generado por Orval.
- [x] 5.3 [Verificación] Ejecutar `pytest` en `backend/`, `npm run build` (`tsc -b` + Vite) y `npm test` en `frontend/`, y `openspec validate bootstrap-frontend --strict` para confirmar todo en verde.
