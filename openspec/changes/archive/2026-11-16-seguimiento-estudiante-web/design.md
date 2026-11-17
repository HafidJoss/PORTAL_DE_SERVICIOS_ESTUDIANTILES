# Design

## Context

Este cambio continúa el flujo de trabajo definido tras `bootstrap-frontend` (clientes Orval, TanStack Query y componentes base en `frontend/src/shared/components/`) e `identidad-estudiante-web` (`RequiereSesion`, `PortalLayout` y `preferenciasAvisos.ts`). Ver `proposal.md` para la motivación y trazabilidad completa (`HU10`, `HU12`, `HU16`, `RF01`, `RF04`, `RF20`, `RF23`, `RF26`, `AC01`, `AC04`, `AC06`, `AC07`, `RC01`, `RC08`).

A diferencia de un corte vertical completo con persistencia nueva, los endpoints stub y el esquema OpenAPI/Orval para `seguimiento`, `evaluacion` y `asistencia` ya existen en `backend/` y `frontend/src/api/generated/`. Por ello, este diseño cubre exclusivamente la capa web del frontend en TypeScript/React y no introduce cambios de base de datos, migraciones SQL ni modificaciones al contrato OpenAPI (`ADR-006`, `ADR-007` no afectados).

## Goals / Non-Goals

**Goals:**
- Reemplazar las vistas placeholder de `/inicio`, `/cursos` (más `/cursos/:asignaturaId`), `/trabajos` y `/asistencia` en `frontend/src/app/App.tsx`.
- Mantener la separación modular definida en `docs/02-arquitectura-software/arquitectura-inicial.md` y `ADR-008`, evitando dependencias circulares o acoplamientos directos entre features pares.
- Reutilizar los hooks generados por Orval y los componentes de diseño base (`BannerHero`, `Card`, `BadgeNivel`, `AvatarIniciales`, `Button`, `EstadoVacio`).
- Aplicar TDD estricto (`docs/06-estandares/tdd.md`) con cobertura unitaria sobre lógica pura e integración UI mediante `Vitest + React Testing Library + MSW`.

**Non-Goals:**
- Modificar `backend/`, crear tablas/migraciones en PostgreSQL o regenerar `openapi.json` / clientes Orval.
- Implementar formularios de entrega o subida de archivos (`RC08`), ni el flujo de envío de justificaciones de asistencia (exclusivo del rol `apoderado`).
- Implementar las vistas dedicadas del punto 4 (`/calificaciones`, `/mensajes` y `/libreta`), aunque los enlaces de navegación hacia ellas permanecen activos sobre las rutas existentes.

## Decisions

### D1. Organización por módulo y respeto a fronteras (`ADR-008`)

Cada ruta se implementa dentro de la feature correspondiente a su módulo propietario:

- **`frontend/src/features/seguimiento/`** (módulo compuesto de nivel 1 según `arquitectura-inicial.md`):
  - `filtrosSeguimiento.ts`: funciones puras para filtrar `NovedadItemOut[]` según `PreferenciasAvisos`, agrupar novedades por bloque temporal (`grupo`), construir iniciales y mapear variantes del tablero.
  - `preferenciasInicio.ts`: lectura/escritura segura en `localStorage` (`portal-est-inicio-variante`) para recordar la variante elegida (`"A" | "B" | "C"`), con valor inicial `"A"`.
  - `variantes/`: `VarianteFeedNovedades.tsx` (A), `VarianteResumenModulos.tsx` (B) y `VarianteAgendaSemanal.tsx` (C).
  - `InicioPage.tsx`: hero de bienvenida, conteo `novedades_sin_ver`, botón `Marcar todo como visto` y selector de variantes.
  - `CursosPage.tsx`: hero con totales (`cursos.length`, `total_pendientes`), `grado_seccion` y grilla de tarjetas con accesos rápidos (`?tab=trabajos`, `?tab=calificaciones`, `?tab=personas`).
  - `CursoDetallePage.tsx`: barra superior con botón de retorno a `/cursos`, cabecera del curso/docente y 4 subpestañas (`Novedades`, `Trabajos`, `Calificaciones`, `Personas`).
- **`frontend/src/features/evaluacion/`** (módulo de dominio de nivel 0):
  - `filtrosActividades.ts`: funciones puras para filtrar `ActividadOut[]` por pestaña (`pendientes`, `entregados`, `todos`) y distinguir visualmente `trabajo` de `sesion_clase` (`Nota del día`).
  - `TarjetaActividad.tsx`: tarjeta expandible accesible (`aria-expanded`) sin campos ni botones de carga de archivos (`RC08`).
  - `TrabajosPage.tsx`: resumen de pendientes/próximos a vencer, pestañas de filtro, listado de `TarjetaActividad` y aviso permanente de entrega presencial.
- **`frontend/src/features/asistencia/`** (módulo de dominio de nivel 0):
  - `calendarioMes.ts`: funciones puras para generar la grilla de días hábiles (lunes a viernes) del mes seleccionado (`9`, `10` o `11` de `2026`), cruzarla con `DiaAsistenciaOut[]` y exponer metadatos accesibles de leyenda para `P`, `T`, `F`, `FJ`, `TJ` y `FE`.
  - `CalendarioAsistencia.tsx`: grilla de semanas L–V y leyenda de códigos.
  - `AsistenciaPage.tsx`: selector mensual (`Sep`, `Oct`, `Nov`), 5 KPIs mensuales, `CalendarioAsistencia` e incidencias del mes en modo solo lectura.

**Dependencias entre módulos (comprobación frente a `arquitectura-inicial.md`):**
- `seguimiento` -> `identidad`: en lugar de importar directamente desde `features/identidad/`, se extrae la lógica pura de preferencias de avisos (`PreferenciasAvisos`, `AVISOS_POR_DEFECTO`, `leerPreferenciasAvisos`, `guardarPreferenciasAvisos`) hacia `frontend/src/shared/preferencias/preferenciasAvisos.ts`, re-exportándola desde `features/identidad/preferenciasAvisos.ts` para conservar compatibilidad sin acoplamiento entre features.
- `seguimiento` -> `evaluacion`: permitido unidireccionalmente porque `seguimiento` compone información de `evaluacion` (nivel superior en `arquitectura-inicial.md`). En `CursoDetallePage.tsx`, la pestaña `Trabajos` y el bloque lateral `Próximas entregas` consumen `useListarActividadesEstudianteApiV1EvaluacionEstudiantesEstudianteIdActividadesGet` y filtran por el nombre de la asignatura del curso abierto.
- `evaluacion` y `asistencia` NO importan ni dependen de `seguimiento` ni entre sí.

**Alternativa descartada:** Duplicar la lectura de `localStorage` (`portal-est-avisos`) dentro de `seguimiento`. Se descartó para evitar divergencias de esquema o clave con `ConfiguracionPage`.

### D2. Hooks Orval, manejo de caché y `Marcar todo como visto`

Se consumen exclusivamente los hooks generados en `frontend/src/api/generated/`:
- `useObtenerInicioEstudianteApiV1SeguimientoEstudiantesEstudianteIdInicioGet`
- `useMarcarNovedadesVistasApiV1SeguimientoEstudiantesEstudianteIdNovedadesVistoPost`
- `useListarCursosEstudianteApiV1SeguimientoEstudiantesEstudianteIdCursosGet`
- `useObtenerDetalleCursoApiV1SeguimientoEstudiantesEstudianteIdCursosAsignaturaIdGet`
- `useListarActividadesEstudianteApiV1EvaluacionEstudiantesEstudianteIdActividadesGet`
- `useObtenerAsistenciaMensualApiV1AsistenciaEstudiantesEstudianteIdGet`

Al completar la mutación `Marcar todo como visto`, `InicioPage` actualiza inmediatamente los datos en caché (`novedades_sin_ver: 0` y `ultima_visita` devuelta por `NovedadesVistoOut`) e invalida la `queryKey` del inicio del estudiante para mantener coherencia en la sesión (`ADR-006`). Si la mutación falla, conserva el estado previo y muestra un mensaje de error reintentable.

### D3. Resolución de `estudianteId` y restricción de perfil

Dentro de `PortalAutenticado` en `frontend/src/app/App.tsx`, `RequiereSesion` entrega `usuario: UsuarioSesionOut`. Las vistas protegidas resuelven `const estudianteId = usuario.estudiante_id ?? (usuario.rol === "Estudiante" ? usuario.id : "")` y verifican el perfil antes de habilitar las consultas (`query: { enabled: Boolean(estudianteId) }`). Si el usuario autenticado no tiene perfil de estudiante válido, las vistas muestran `EstadoVacio` indicando la restricción de acceso sin ejecutar peticiones inválidas.

### D4. Enrutamiento de `/cursos` y subpestañas

En `frontend/src/app/App.tsx` se habilitan:
- `/inicio` -> `InicioPage`
- `/cursos` -> `CursosPage`
- `/cursos/:asignaturaId` -> `CursoDetallePage` (lee el query param `?tab=novedades|trabajos|calificaciones|personas` con valor por defecto `"novedades"`)
- `/trabajos` -> `TrabajosPage`
- `/asistencia` -> `AsistenciaPage`

**Alternativa descartada:** Manejar el detalle del curso solo con estado local dentro de `CursosPage`. Se descartó porque los elementos `NovedadItemOut.ruta_destino` y los botones de retorno del navegador requieren navegación por URL (`/cursos/:asignaturaId`).

### D5. Plan de pruebas por capa (TDD)

Dado que el cambio se circunscribe al frontend sin backend ni BD propios en este corte, el plan de pruebas sigue la estructura de capas del frontend en `docs/06-estandares/tdd.md`:

1. **Pruebas unitarias de lógica pura (`Vitest`, sin DOM ni red):**
   - `frontend/src/shared/preferencias/__tests__/preferenciasAvisos.test.ts` (o cobertura equivalente al mover el módulo): lectura, valores por defecto y guardado.
   - `frontend/src/features/seguimiento/__tests__/filtrosSeguimiento.test.ts`: filtrado de novedades por categorías `calif`/`tareas`/`asist`/`obs`, agrupación temporal, mapeo de iniciales y persistencia segura de variante `A/B/C`.
   - `frontend/src/features/evaluacion/__tests__/filtrosActividades.test.ts`: filtros `pendientes` (`pendiente` + `vencido`), `entregados` (`entregado` + `calificado`) y `todos`, diferenciación `trabajo` vs `sesion_clase`.
   - `frontend/src/features/asistencia/__tests__/calendarioMes.test.ts`: armado de grilla L–V para `mes = 9, 10, 11` de `2026`, cruce con `DiaAsistenciaOut[]`, huecos iniciales y mapeo de leyenda `P/T/F/FJ/TJ/FE`.
2. **Pruebas de componentes e integración HTTP simulada (`Vitest` + `React Testing Library` + `MSW` sobre `/api/v1/*`):**
   - `InicioPage.test.tsx`: renderizado de variantes A/B/C, respeto a `preferenciasAvisos`, `POST .../novedades/visto` dejando `novedades_sin_ver = 0`, error en mutación, estado vacío y error de consulta.
   - `CursosPage.test.tsx`: grilla de cursos, contadores en hero, mensajes cuando no hay pendientes próximos, error de carga y estado vacío.
   - `CursoDetallePage.test.tsx`: apertura en pestaña por `?tab=`, cambio entre `Novedades`, `Trabajos`, `Calificaciones` y `Personas`, filtro de trabajos del curso sin input de archivos (`RC08`), aviso de comunicación unidireccional y error 404 de curso inexistente.
   - `TrabajosPage.test.tsx`: pestañas `Pendientes`/`Entregados`/`Todos`, expansión/colapso accesible diferenciando `trabajo` de `sesion_clase` (`Nota del día`), ausencia de `input[type="file"]` (`RC08`), estado vacío y error de red.
   - `AsistenciaPage.test.tsx`: cambio de mes (`Sep`, `Oct`, `Nov`) disparando nueva consulta con `?mes=`, render de 5 KPIs, calendario L–V con leyenda, incidencias sin botón de justificar (`RC08`), estado sin incidencias y error de red.
3. **Pruebas de enrutamiento integral (`frontend/src/app/__tests__/App.test.tsx`):**
   - Verificar que un estudiante autenticado navega sin placeholders hacia `/inicio`, `/cursos`, `/cursos/:asignaturaId`, `/trabajos` y `/asistencia`, y que un rol sin perfil de estudiante recibe el bloqueo esperado.

## Risks / Trade-offs

- **[Stub de asistencia con lista parcial de `dias`] -> Mitigation:** `construirGrillaLaboral` genera los días hábiles reales L–V del mes y acopla por número de día los registros que devuelva el endpoint, evitando celdas desalineadas tanto con datos stub como con datos completos del backend real.
- **[Enlaces a rutas del punto 4 (`/calificaciones`, `/mensajes`, `/libreta`)] -> Mitigation:** Los enlaces desde `InicioPage` y `CursoDetallePage` navegan mediante `react-router-dom` hacia rutas ya registradas en `App.tsx`, evitando errores 404 mientras permanecen en modo placeholder hasta el punto 4.
- **[Crecimiento de bundle JS con 4 nuevas vistas] -> Mitigation:** Todas las páginas son componentes ligeros apoyados en `@tanstack/react-query` y primitivas compartidas ya compiladas (`shared/components/`), manteniendo `vite build` compacto para `AC01`.
