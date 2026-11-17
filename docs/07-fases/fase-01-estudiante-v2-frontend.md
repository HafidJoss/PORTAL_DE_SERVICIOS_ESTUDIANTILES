# Fase 1 · Portal Estudiante v2 (Frontend + API Contractual Stub)

> **Estado:** Completada · **Rama de trabajo:** `dev` · **Fecha de cierre:** 2026-11-16

---

## 1. Resumen ejecutivo y alcance

En esta primera fase se construyó de extremo a extremo la aplicación web para el rol **Estudiante (`Estudiante v2`)** respaldada por un contrato **OpenAPI 3.1** expuesto desde un backend stub en FastAPI y consumido mediante hooks TypeScript generados con Orval (`ADR-006`).

### En alcance
- Base de frontend en React 18 + TypeScript + Vite, sistema de diseño institucional (`tokens.css` claro/oscuro WCAG AA), layout responsivo (`PortalLayout`), `ThemeProvider`, `http.ts` con soporte RFC 9457 (`ProblemDetailError`), CSRF y manejo de `401`.
- Backend contractual stub en FastAPI (`backend/app/`) con 19 rutas bajo `/api/v1`, esquema `backend/openapi.json` y pruebas contractuales con `pytest`.
- Implementación completa de las 10 rutas del estudiante (`/ingresar`, `/inicio`, `/cursos`, `/cursos/:asignaturaId`, `/trabajos`, `/asistencia`, `/calificaciones`, `/mensajes`, `/libreta`, `/configuracion`).
- Refactorizaciones de cierre de fase: habilitación de ESLint con `typescript-eslint`, uso estricto de tokens semánticos `--status-info-*` en modo oscuro y alternancia real listado/detalle en móvil (`< 1024 px`) con el hook compartido `useEsMovil`.

### Fuera de alcance en Fase 1
- Persistencia en PostgreSQL, migraciones Alembic, hashing Argon2 y cookies reales `__session` (corresponden a la Fase 2).
- Flujos exclusivos de otros roles: `Apoderado` (justificación en texto, vista multi-hijo), `Docente` (registro diario y confirmación de medianas), `Auxiliar`, `Secretaría` (nómina SIAGIE), `Dirección`/`Administrador` (publicación/reapertura y Excel SIAGIE).
- Subida de archivos, chat en tiempo real y pagos (`RC08`).

---

## 2. Arquitectura, rutas y módulos implementados

### Frontend (`frontend/src/`)

| Área / Módulo (`ADR-008`) | Archivos principales | Responsabilidad |
|---|---|---|
| `app/` | `App.tsx`, `main.tsx`, `ThemeProvider.tsx`, `queryClient.ts` | Enrutamiento autenticado (`RequiereSesion`), manejo global de `401`, proveedor de tema y TanStack Query |
| `api/` | `http.ts`, `generated/*` (Orval) | Cliente HTTP tipado (`credentials: "include"`, `X-CSRF-Token`, RFC 9457) y hooks por módulo |
| `shared/` | `components/*`, `hooks/useEsMovil.ts`, `preferencias/preferenciasAvisos.ts`, `utils/sesion.ts`, `styles/tokens.css`, `testShared/*` | Primitivas UI reutilizables, tokens claro/oscuro y utilidades compartidas sin acoplamiento entre features |
| `testSetup/` | `setup.ts` | Arranque global de Vitest y limpieza DOM (`@testing-library/jest-dom`) |
| `features/identidad/` | `IngresoPage.tsx`, `ConfiguracionPage.tsx`, `FormLogin.tsx`, `FormActivarCuenta.tsx`, `ModalPrivacidad.tsx`, `validaciones.ts` | Ingreso por DNI, activación con código, aviso de privacidad (`RF29`), tema, avisos locales y cambio de contraseña |
| `features/seguimiento/` | `InicioPage.tsx`, `variantes/*` (`A`, `B`, `C`), `CursosPage.tsx`, `CursoDetallePage.tsx`, `filtrosSeguimiento.ts`, `preferenciasInicio.ts` | Tablero de inicio en 3 variantes con `Marcar todo como visto`, grilla de cursos y detalle en 4 subpestañas (`Novedades`, `Trabajos`, `Calificaciones`, `Personas`) |
| `features/evaluacion/` | `TrabajosPage.tsx`, `TarjetaActividad.tsx`, `CalificacionesPage.tsx`, `MensajesPage.tsx`, `filtros*.ts` | Trabajos y notas del día (`sesion_clase`), calificaciones por competencias (`AD/A/B/C`) y mensajería por hilos con confirmación de lectura y respuesta acotada |
| `features/asistencia/` | `AsistenciaPage.tsx`, `CalendarioAsistencia.tsx`, `calendarioMes.ts` | Consulta mensual (`Sep/Oct/Nov`), 5 KPIs, grilla L–V (`P/T/F/FJ/TJ/FE`) e incidencias en solo lectura |
| `features/reportes/` | `LibretaPage.tsx`, `resumenLibreta.ts` | Libretas trimestrales, situación final (`PRO/PER/RR`) y obtención bajo demanda de URL firmada temporal (`TTL 15 min`) para PDF |

### Comprobación de fronteras (`ADR-008`)
- `seguimiento` (nivel compuesto) consume únicamente `../evaluacion/` (`TarjetaActividad` y `filtrarActividadesPorPestana`) y usa `shared/preferencias/preferenciasAvisos.ts` para leer preferencias sin importar `features/identidad`.
- Los módulos de nivel 0 (`identidad`, `evaluacion`, `asistencia`, `reportes`) mantienen cero dependencias cruzadas entre sí.

---

## 3. Trazabilidad y especificaciones consolidadas (`OpenSpec`)

Los 4 cambios de la fase quedaron archivados en `openspec/changes/archive/2026-11-16-*` y consolidados en `openspec/specs/`:

| Spec consolidada | Cambio(s) archivado(s) | Requirements | IDs trazados |
|---|---|---|---|
| `openspec/specs/plataforma-web/spec.md` | `bootstrap-frontend` | 4 | `AC01`, `AC04`, `AC06`, `AC07`, `ADR-006`, `ADR-008` |
| `openspec/specs/identidad/spec.md` | `identidad-estudiante-web` | 4 | `RF14`, `RF29`, `HU08`, `RC07`, `RC08`, `AC04` |
| `openspec/specs/seguimiento/spec.md` | `seguimiento-estudiante-web` | 5 | `RF01`, `RF04`, `RF23`, `RF26`, `HU10`, `HU12`, `RC08`, `AC01`, `AC04`, `AC06`, `AC07` |
| `openspec/specs/asistencia/spec.md` | `seguimiento-estudiante-web` | 2 | `RF20`, `HU16`, `RC08`, `AC01`, `AC04` |
| `openspec/specs/evaluacion/spec.md` | `seguimiento-estudiante-web` + `evaluacion-y-reportes-estudiante-web` | 5 | `RF08`, `RF22`, `RF23`, `RF24`, `RF25`, `HU06`, `HU10`, `HU15`, `RC08`, `AC04`, `AC06` |
| `openspec/specs/reportes/spec.md` | `evaluacion-y-reportes-estudiante-web` | 2 | `RF15`, `RF27`, `RF28`, `HU06`, `RC05`, `ADR-002`, `AC01` |

---

## 4. Evidencia de verificación al cierre

| Verificación | Comando | Resultado observado |
|---|---|---|
| Lint frontend | `cd frontend && npm run lint` | `eslint .` sin errores ni advertencias |
| Compilación y bundle | `cd frontend && npm run build` | `tsc -b && vite build` exitoso (`329.96 kB`, gzip `92.51 kB`, `3.73s`) |
| Pruebas unitarias e integración frontend | `cd frontend && npm test` | **26 archivos de prueba, 79 pruebas aprobadas** (`16.42s`) |
| Pruebas contractuales backend | `cd backend && pytest tests` | **17 pruebas aprobadas** (`0.94s`) |
| Smoke HTTP proxy live (`Vite` + `FastAPI`) | `Invoke-WebRequest` sobre `http://127.0.0.1:5173` y `/api/v1/*` | **17/17** peticiones `GET`/`POST` con estado `HTTP 200` |
| Validación OpenSpec | `openspec validate --specs --strict` | **6/6** specs válidos (`22` requirements totales) |

---

## 5. Limitaciones del stub y puntos de entrada para Fase 2

1. **Autenticación contractual fija (`identidad/router.py`)**: `GET /api/v1/identidad/sesion` devuelve siempre sesión activa demo en modo stub; al implementar el backend real en Fase 2 se activará cookie `__session` `httpOnly`, CSRF real, Argon2 y rechazo `401` efectivo (`ADR-004`).
2. **Inspección visual en Chrome DevTools**: durante el cierre, el subagente de navegador reportó ausencia de `DevToolsActivePort` en Chrome del host (`chrome://inspect/#remote-debugging`), por lo que la validación visual en navegador real quedó cubierta mediante jsdom/RTL (`390 px` y escritorio) y verificación HTTP contra Vite + FastAPI; se recomienda abrir `http://127.0.0.1:5173` en navegador local al arrancar Fase 2.
3. **Siguiente fase recomendada (Fase 2 · Backend real y persistencia)**: implementar `core/` (SQLAlchemy async, PostgreSQL + Alembic, auditoría `ADR-005`), módulo `identidad` y `institucion` (periodos y catálogo) manteniendo intactos los contratos OpenAPI ya consumidos por el frontend.
