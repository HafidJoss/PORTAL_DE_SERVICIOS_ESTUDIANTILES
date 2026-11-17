# Estándar de Nomenclatura

> **Proyecto:** Portal de Servicios Estudiantiles · **Alcance:** frontend, backend, base de datos y documentación
> **Estado:** vigente · **Versión:** 2.0

---

## 1. Propósito

Unificar cómo se nombran carpetas, archivos, símbolos y rutas en todo el repositorio para mantener una estructura homogénea en español, predecible en el explorador de archivos y libre de conflictos entre compiladores, herramientas de prueba y desarrolladores o agentes de IA.

---

## 2. Convención del Frontend (`frontend/src/`)

En `frontend/src/` (fuera de `api/generated/`, que autogenera Orval), **todas las carpetas y todos los archivos** (`.ts`, `.tsx` y `.css`) usan **`camelCase` estricto en español**.

Para compatibilidad con React/JSX y TypeScript, únicamente los **símbolos exportados** de componentes React, interfaces y tipos mantienen `PascalCase`, ya que JSX interpreta las etiquetas en minúscula (`<boton />`) como elementos HTML nativos.

| Elemento | Convención | Ejemplos válidos | Evitar |
|---|---|---|---|
| Carpetas internas de `src/` | `camelCase` en español | `vistas/`, `componentes/`, `utilidades/`, `ganchos/`, `estilos/`, `preferencias/`, `pruebas/`, `testSetup/` | `components/`, `pages/`, `hooks/`, `__tests__/`, `mi-carpeta/` |
| Archivos de vistas y componentes (`.tsx`) | `camelCase` en español (`*Vista.tsx` para páginas enrutables) | `inicioVista.tsx`, `cursosVista.tsx`, `boton.tsx`, `tarjeta.tsx`, `marcoPortal.tsx` | `InicioPage.tsx`, `Button.tsx`, `PortalLayout.tsx` |
| Símbolos React, props, tipos e interfaces | `PascalCase` en español | `InicioVista`, `Boton`, `Tarjeta`, `MarcoPortal`, `PreferenciasAvisos` | `InicioPage`, `Button`, `PortalLayout` |
| Variables, parámetros y funciones | `camelCase` | `estudianteId`, `leerPreferenciasAvisos`, `construirGrillaLaboral` | `estudiante_id` local, `LeerDatos` |
| Hooks personalizados | `camelCase` con prefijo `use` | `useEsMovil.ts`, `useEsMovil()`, `useTema()` | `UseEsMovil.ts`, `useTheme()` |
| Módulos de lógica, filtros y cliente HTTP | `camelCase` | `filtrosMensajes.ts`, `resumenLibreta.ts`, `clienteHttp.ts`, `clienteConsultas.ts` | `http.ts`, `queryClient.ts`, `filtros_mensajes.ts` |
| Archivos de prueba | `test<Tipo><Contexto>.test.ts(x)` en `camelCase` | `testUnitarioCalendarioMes.test.ts`, `testComponenteMarcoPortal.test.tsx`, `testIntegracionTrabajosVista.test.tsx`, `testE2eRecorridoEstudiante.test.tsx` | `App.test.tsx`, `TrabajosPage.test.tsx` |
| Constantes globales de configuración | `UPPER_SNAKE_CASE` | `AVISOS_POR_DEFECTO`, `MESES_LECTIVOS_ASISTENCIA` | `avisosPorDefecto` mutable |
| Tokens CSS y rutas web | `kebab-case` | `--status-info-bg`, `/trabajos`, `/libreta` | `--statusInfoBg` |

### Subcarpetas estándar por módulo en `features/` y `shared/`

- En cada módulo de `features/<modulo>/`: `vistas/`, `componentes/`, `utilidades/` y `pruebas/` (creando únicamente las subcarpetas que el módulo utilice; los módulos aún no implementados conservan solo `.gitkeep`).
- En `shared/`: `componentes/`, `estilos/`, `ganchos/`, `preferencias/`, `utilidades/` y `pruebas/`.
- En `app/`: archivos raíz (`principal.tsx`, `aplicacion.tsx`, `clienteConsultas.ts`, `proveedorTema.tsx`) y `pruebas/` para las pruebas transversales `testE2e*` y `testUnitarioProveedorTema.test.tsx`.
- En `api/`: `clienteHttp.ts`, `generated/` (Orval) y `pruebas/`.

### Relación con contratos OpenAPI / Orval

- Los esquemas de Pydantic en el backend y los endpoints REST usan `snake_case` por estándar PEP 8 de Python.
- El código autogenerado en `frontend/src/api/generated/` conserva los nombres JSON del contrato (`novedades_sin_ver`, `fecha_entrega`), pero las variables, estados y props internas de los componentes TypeScript deben nombrarse en `camelCase`.

---

## 3. Convención del Backend (`backend/`) y otros ámbitos

En Python/FastAPI se aplica **PEP 8 (`snake_case`)** para módulos, carpetas, funciones, variables y archivos de prueba (`test_*.py` requerido por el descubrimiento automático de `pytest`), junto con **`PascalCase`** para clases y esquemas Pydantic.

| Ámbito | Convención | Ejemplos válidos | Referencia |
|---|---|---|---|
| **Módulos y carpetas en `backend/app/`** | `snake_case` en español (espejo de los 9 módulos MVP) | `core/errores.py`, `modules/seguimiento/`, `modules/auditoria/` | [enfoque-arquitectonico.md](../02-arquitectura-software/enfoque-arquitectonico.md) |
| **Capas arquitectónicas del módulo** | Nombres de capa del estándar en `snake_case` | `router.py`, `schemas.py`, `service.py`, `reglas.py`, `repository.py`, `models.py` | [enfoque-arquitectonico.md](../02-arquitectura-software/enfoque-arquitectonico.md) |
| **Funciones, variables y endpoints internos** | `snake_case` en español | `crear_app`, `verificar_salud`, `registrar_manejadores_error` | [arquitectura-inicial.md](../02-arquitectura-software/arquitectura-inicial.md) |
| **Clases y esquemas Pydantic** | `PascalCase` en español + sufijo `In`/`Out` | `SaludOut`, `ErrorAplicacion`, `InicioEstudianteOut` | [arquitectura-inicial.md](../02-arquitectura-software/arquitectura-inicial.md) |
| **Pruebas en `backend/tests/<modulo>/`** | `test_<tipo>_<contexto>.py` en `snake_case` y español | `test_integracion_salud_y_errores.py`, `test_integracion_contrato_asistencia.py`, `test_unitario_reglas.py` | [tdd.md · Sección 5.1](tdd.md#51-estructura-de-carpetas) |
| **PostgreSQL / Migraciones** | `snake_case` | `grado_seccion`, `version_sesion` | [enfoque-arquitectonico.md](../02-arquitectura-software/enfoque-arquitectonico.md) |
| **Documentación y OpenSpec** | `kebab-case` en español | `fase-01-estudiante-v2-frontend.md`, `identidad-estudiante-web` | [AGENTS.md](../../AGENTS.md) |

---

## 4. Taxonomía unificada de pruebas

Tanto frontend como backend clasifican sus pruebas por tipo usando la misma semántica adaptada a la sintaxis de cada stack:

| Tipo | Propósito | Prefijo Frontend (`<modulo>/pruebas/`) | Prefijo Backend (`tests/<modulo>/`) |
|---|---|---|---|
| **Unitaria** | Funciones puras, hooks, utilidades, reglas de negocio y servicios con dobles | `testUnitario<Contexto>.test.ts(x)` | `test_unitario_<contexto>.py` |
| **Componente** | Primitivas UI aisladas y adaptadores técnicos (`clienteHttp`) | `testComponente<Contexto>.test.ts(x)` | `test_unitario_<componente>.py` |
| **Integración** | Vistas de feature con TanStack Query + MSW o routers/repositorios FastAPI + BD | `testIntegracion<Vista>.test.tsx` | `test_integracion_<contexto>.py` |
| **E2E** | Flujos completos de navegación o recorrido transversal entre rutas | `testE2e<Flujo>.test.tsx` (en `app/pruebas/`) | `test_e2e_<flujo>.py` |
