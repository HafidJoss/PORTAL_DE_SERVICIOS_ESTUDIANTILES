# Estándar de Nomenclatura

> **Proyecto:** Portal de Servicios Estudiantiles · **Alcance:** frontend, backend, base de datos y documentación
> **Estado:** vigente · **Versión:** 1.0

---

## 1. Propósito

Unificar cómo se nombran carpetas, archivos, símbolos y rutas en todo el repositorio para mantener un árbol legible en el editor y coherente entre desarrolladores y agentes de IA.

---

## 2. Regla principal de `camelCase` en el Frontend (TypeScript / React)

En `frontend/src/` el estilo base es **`camelCase`**, salvo las excepciones idiomáticas de React/JSX y los campos recibidos directamente del contrato OpenAPI:

| Elemento | Convención | Ejemplos válidos | Evitar |
|---|---|---|---|
| Carpetas internas de `src/` | `camelCase` | `testSetup/`, `testShared/`, `testIdentidad/`, `preferencias/` | `__tests__/`, `entorno_pruebas/`, `mi-carpeta/` |
| Variables, parámetros y funciones | `camelCase` | `estudianteId`, `leerPreferenciasAvisos`, `construirGrillaLaboral` | `estudiante_id` local, `LeerDatos` |
| Hooks personalizados | `camelCase` con prefijo `use` | `useEsMovil.ts`, `useEsMovil()` | `UseEsMovil.ts` |
| Módulos de lógica, filtros y utilidades | `camelCase` | `filtrosMensajes.ts`, `resumenLibreta.ts`, `calendarioMes.ts` | `filtros_mensajes.ts` |
| Archivos de prueba de lógica / utilidades | `camelCase` + `.test.ts` | `filtrosMensajes.test.ts`, `useEsMovil.test.ts` | `filtros_mensajes.test.ts` |
| Componentes, páginas e interfaces/tipos React | `PascalCase` | `InicioPage.tsx`, `TarjetaActividad.tsx`, `InicioPage.test.tsx` | `inicio-page.tsx`, `tarjeta_actividad.tsx` |
| Constantes globales de configuración | `UPPER_SNAKE_CASE` | `AVISOS_POR_DEFECTO`, `MESES_LECTIVOS_ASISTENCIA` | `avisosPorDefecto` mutable |
| Tokens CSS y rutas web | `kebab-case` | `--status-info-bg`, `/trabajos`, `/libreta` | `--statusInfoBg` |

### Relación con contratos OpenAPI / Orval

- Los esquemas de Pydantic en el backend y los endpoints REST usan `snake_case` por estándar PEP 8 de Python.
- El código autogenerado en `frontend/src/api/generated/` conserva los nombres JSON del contrato (`novedades_sin_ver`, `fecha_entrega`), pero las variables, estados y props internas de los componentes TypeScript deben nombrarse en `camelCase`.

---

## 3. Convenciones fuera del Frontend

| Ámbito | Convención | Ejemplos | Referencia |
|---|---|---|---|
| **Backend (Python / FastAPI)** | `snake_case` (PEP 8) en módulos, funciones y esquemas; `PascalCase` en clases | `reglas.py`, `obtener_inicio_estudiante`, `InicioEstudianteOut` | [arquitectura-inicial.md](../02-arquitectura-software/arquitectura-inicial.md) |
| **PostgreSQL / Migraciones** | `snake_case` | `grado_seccion`, `version_sesion` | [enfoque-arquitectonico.md](../02-arquitectura-software/enfoque-arquitectonico.md) |
| **Documentación y OpenSpec** | `kebab-case` en español | `fase-01-estudiante-v2-frontend.md`, `identidad-estudiante-web` | [AGENTS.md](../../AGENTS.md) |

---

## 4. Organización visible de pruebas en el explorador

- **Frontend**: se aplica la estructura descrita en [tdd.md · Sección 7.1](tdd.md#71-estructura-de-carpetas-del-frontend): carpetas en `camelCase` con prefijo `test` según su función (`testSetup/` para el entorno global de Vitest y `test<Area>/` por módulo: `testApi/`, `testApp/`, `testShared/`, `testIdentidad/`, `testSeguimiento/`, `testEvaluacion/`, `testAsistencia/`, `testReportes/`). No se crean carpetas genéricas `__tests__/`.
- **Backend**: se aplica `backend/tests/conftest.py` y `backend/tests/<modulo>/test_<capa>.py` según [tdd.md · Sección 5.1](tdd.md#51-estructura-de-carpetas).
