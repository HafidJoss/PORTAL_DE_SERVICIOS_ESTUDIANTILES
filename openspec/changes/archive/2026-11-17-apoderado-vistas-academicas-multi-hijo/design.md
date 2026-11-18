# Design

## Context

Las seis vistas académicas implementadas en la Fase 1 (`CursosVista`, `CursoDetalleVista`, `CalificacionesVista`, `TrabajosVista`, `MensajesVista` y `LibretaVista`) resuelven actualmente el estudiante exclusivamente mediante `resolverEstudianteId(usuario)` y consumen endpoints stub que ignoran `estudiante_id` o no validan pertenencia de apoderado (`DA05`). A su vez, el Bloque 1 de la Fase 3 (`apoderado-base-y-selector-hijos`) dejó disponible el estado `hijoSeleccionadoId` y el selector contextual `Cambiar de menor` en `MarcoPortal`, con rutas académicas temporales (`VistaPuenteApoderado`) en `frontend/src/app/aplicacion.tsx`.

## Goals / Non-Goals

**Goals:**
- Habilitar las seis vistas académicas reales (`/cursos`, `/cursos/:asignaturaId`, `/calificaciones`, `/trabajos`, `/mensajes` y `/libreta`) para `Apoderado`, sincronizadas en vivo con el `hijoActivo` seleccionado.
- Diferenciar los datos académicos devueltos por el backend para `est-demo-1` (`Luis Ángel Quispe Huamán · 3.° de Secundaria B`) y `est-demo-2` (`Sofía Quispe Huamán · 1.° de Secundaria A`) sin alterar los casos existentes de Fase 1.
- Exigir validación de pertenencia `DA05` (`403 Problem Details`) en los endpoints de `seguimiento`, `evaluacion` y `reportes` cuando se consulten en contexto de apoderado (`apoderado_id`).
- Cumplir `RC08`: cero campos `<input type="file">`, escala cualitativa `AD/A/B/C` sin promedios aritméticos y `MensajesVista` en modo informativo de solo lectura de respuestas para `Apoderado` (con confirmación de lectura y enlace a `Trabajos`).

**Non-Goals:**
- Vista de asistencia mensual y envío de justificaciones escritas del apoderado (`RF20`, reservada para el Bloque 3 `apoderado-asistencia-y-justificaciones`).
- Persistencia SQLAlchemy en PostgreSQL, autenticación JWT real con cookies `__session` (`ADR-004`) y migraciones Alembic (planificadas en la etapa de persistencia).

## Decisions

### 1. Guardia transversal `DA05` en `backend/app/core/pertenencia.py`
- Se ubicará una utilidad pura `validar_pertenencia_apoderado(apoderado_id: str | None, estudiante_id: str) -> None` dentro de `backend/app/core/pertenencia.py` (capa transversal `core`, análoga a `app/core/errores.py`).
- Cuando `apoderado_id` es `None` (llamadas directas del rol `Estudiante` y pruebas contractuales de Fase 1), la guardia no bloquea el flujo; cuando recibe un `apoderado_id`, verifica que `(apoderado_id, estudiante_id)` pertenezcan al vínculo `("apo-demo-1", {"est-demo-1", "est-demo-2"})` y, de lo contrario, lanza `ErrorAplicacion(..., status_code=403)` traducido automáticamente a `Problem Details` (`RFC 9457`).
- **Alineación `ADR-008`**: `seguimiento`, `evaluacion` y `reportes` importan únicamente `app.core.pertenencia`, evitando importaciones cruzadas entre módulos o acceso directo a tablas ajenas. Al conectar PostgreSQL en la siguiente etapa (`ADR-004`), el `apoderado_id` se extraerá de la sesión firmada y se validará contra el servicio N:M correspondiente.

### 2. Contextualización multi-hijo por módulo en backend (sin romper contratos Fase 1)
- Los endpoints estudiantiles existentes reciben el parámetro opcional de query `apoderado_id: str | None = None`:
  - `seguimiento/router.py`: `GET /estudiantes/{estudiante_id}/cursos` y `GET /estudiantes/{estudiante_id}/cursos/{asignatura_id}`. Para `est-demo-2` devolverá `1.° de Secundaria A` con cursos propios (incluyendo `cta` Ciencia y Tecnología además de `mat` Matemática adaptada al grado).
  - `evaluacion/router.py`: `GET /estudiantes/{estudiante_id}/calificaciones`, `GET /estudiantes/{estudiante_id}/actividades` y `GET /estudiantes/{estudiante_id}/mensajes`. También validará pertenencia opcional si `apoderado_id` llega en las consultas del alumno; `POST /mensajes/{mensaje_id}/leer` mantiene su firma para confirmación de lectura.
  - `reportes/router.py`: `GET /estudiantes/{estudiante_id}/libretas` y `GET /estudiantes/{estudiante_id}/libretas/{trimestre_id}/descarga`. Para `est-demo-2` reflejará `1.° Secundaria · A` y competencias acordes al grado, manteniendo `expira_en_segundos=900` (`RC05`, `ADR-002`).
- Los datos devueltos para `est-demo-1` permanecen intactos respecto a Fase 1, preservando compatibilidad total. Tras editar routers, se regenerará `backend/openapi.json` y el cliente TypeScript mediante Orval.

### 3. Resolvedor unificado en `frontend/src/shared/utilidades/sesion.ts`
- Se añadirá `resolverContextoEstudiante(usuario: UsuarioSesionOut, hijoActivoId?: string | null): { estudianteId: string; apoderadoId?: string }`:
  - Si `usuario.rol === "Estudiante"`: retorna `{ estudianteId: resolverEstudianteId(usuario), apoderadoId: undefined }`.
  - Si `usuario.rol === "Apoderado"`: resuelve `hijo = resolverHijoActivo(usuario, hijoActivoId)` y `apoderadoId = resolverApoderadoId(usuario)` y retorna `{ estudianteId: hijo?.estudiante_id ?? "", apoderadoId: apoderadoId || undefined }`.
  - Para otros roles (`Docente`, etc.): retorna `{ estudianteId: "", apoderadoId: undefined }`.
- Todas las vistas académicas conservarán compatibilidad hacia atrás haciendo opcional `hijoActivoId?: string | null`.

### 4. Comportamiento de `MensajesVista` y contextualización visual en las seis vistas
- Siguiendo `prototipos/Portal Apoderado.dc.html`, cuando `usuario.rol === "Apoderado"` en `MensajesVista`:
  - Se permite filtrar (`Todos`, `Tareas`, `Recordatorios`, `Observaciones`), abrir el hilo, confirmar lectura (`POST /mensajes/{id}/leer`) y navegar con `Ver en Trabajos`.
  - Se oculta el formulario de respuesta abierta libre y se muestra el aviso institucional: `"Mensaje informativo: no admite respuestas. Consultas, directamente con el docente o la tutora."`, manteniendo cero subida de archivos (`RC08`).
- En `CursosVista`, `CursoDetalleVista`, `CalificacionesVista`, `TrabajosVista`, `MensajesVista` y `LibretaVista`, cuando haya un menor activo resuelto desde `Apoderado`, se mostrará el contexto del menor seleccionado en el subtítulo o encabezado y React Query recargará automáticamente al cambiar `estudianteId` en el `queryKey`.

### 5. Activación en `frontend/src/app/aplicacion.tsx`
- En la rama `usuario.rol === "Apoderado"`, las rutas `/cursos`, `/cursos/:asignaturaId`, `/calificaciones`, `/trabajos`, `/mensajes` y `/libreta` rendirán sus vistas reales pasando `hijoActivoId={hijoActivo?.estudiante_id}`.
- Únicamente `/asistencia` mantendrá `VistaPuenteApoderado` apuntando al Bloque 3.

### 6. Plan de pruebas por capa
- **Backend (integración de API con `TestClient`)**:
  - `backend/tests/seguimiento/test_integracion_contrato_seguimiento.py`: consultas diferenciadas `est-demo-1` vs `est-demo-2` en `/cursos` y `/cursos/{asignatura_id}` con `apoderado_id=apo-demo-1`, más rechazo `403 Problem Details` para `est-ajeno`.
  - `backend/tests/evaluacion/test_integracion_contrato_evaluacion.py`: consultas diferenciadas en `/calificaciones`, `/actividades` y `/mensajes` con `apoderado_id=apo-demo-1`, más rechazo `403 Problem Details` para `est-ajeno`.
  - `backend/tests/reportes/test_integracion_contrato_reportes.py`: consultas diferenciadas y descarga firmada (`expira_en_segundos=900`) en `/libretas` para `est-demo-2`, más rechazo `403` ante `est-ajeno`.
  - (Nota de arquitectura: al ser módulos actualmente en etapa `stub_contractual` sin `repository.py`/`models.py`, no aplican pruebas de PostgreSQL en `testcontainers`; la guardia transversal se prueba mediante las rutas contractuales).
- **Frontend unitario**: `frontend/src/shared/pruebas/testUnitarioSesion.test.ts` ampliado para `resolverContextoEstudiante`.
- **Frontend integración (MSW + React Testing Library)**: ampliación de las pruebas de `CursosVista`, `CursoDetalleVista`, `CalificacionesVista`, `TrabajosVista`, `MensajesVista` y `LibretaVista` validando renderizado multi-hijo, cambio dinámico de `hijoActivoId`, rechazo `DA05`/reintento, ausencia de `<input type="file">` (`RC08`) y modo solo-lectura de respuestas en `MensajesVista`.
- **Frontend E2E (`MemoryRouter` + MSW)**: `frontend/src/app/pruebas/testE2eRecorridoApoderadoAcademico.test.tsx` recorriendo login de apoderado, navegación por `/cursos`, `/cursos/cta`, `/calificaciones`, `/trabajos`, `/mensajes`, `/libreta`, cambio de menor en vivo en `MarcoPortal` y validación de no-regresión frente a `Estudiante`.

## Risks / Trade-offs

- **Parámetro opcional `apoderado_id` en fase stub**: mantener `apoderado_id` como query param opcional preserva el 100 % de las pruebas existentes de `Estudiante` en Fase 1, aunque la verificación criptográfica estricta de sesión quedará delegada al middleware JWT de Fase 4 (`ADR-004`).
- **Aislamiento modular (`ADR-008`)**: centralizar la guardia stub en `app/core/pertenencia.py` evita duplicación de código entre tres routers sin generar acoplamiento cruzado entre `seguimiento`, `evaluacion` y `reportes`.
- **Diferenciación por menor en cliente**: las claves de TanStack Query generadas por Orval incluyen `estudianteId` y `params`, por lo que cambiar de menor desde `MarcoPortal` dispara o lee caché aislada por hijo sin mezclar datos entre menores (`Ley 29733`).
