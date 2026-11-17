# Design

## Context

Véase [proposal.md](proposal.md) para motivación y alcance. En el estado actual del repositorio:
- `docente-base-y-seguimiento` implementó el perfil `Docente` en `identidad`, el `MarcoPortal` multi-rol, `InicioDocenteVista`, `CursosDocenteVista` y vistas puente temporales para `/cursos/:asignaturaId`, `/nota-del-dia`, `/mensajes` y `/siagie`.
- En `backend/app/modules/evaluacion/` existen únicamente los 5 endpoints de consulta/lectura de `Estudiante v2` (`calificaciones`, `actividades`, `mensajes`, `leer`, `respuestas`).
- En `frontend/src/features/evaluacion/` existen `TrabajosVista`, `CalificacionesVista`, `MensajesVista` y sus utilidades puras para estudiante; `seguimiento/vistas/cursoDetalleVista.tsx` ya demuestra la dependencia unidireccional permitida por `ADR-008` (`seguimiento` → `evaluacion`).

## Goals / Non-Goals

**Goals:**
- Construir el núcleo puro de reglas de evaluación CNEB (`calculoMediana.ts`) verificable al 100 % sin DOM ni API (`tdd.md`), contemplando tanto Primaria (`B` o `C` obliga conclusión) como Secundaria (`C` obliga conclusión) según `RF22`.
- Implementar en `features/evaluacion/` los componentes interactivos de clase, registro auxiliar, actividades, cierre y observaciones optimizados para móvil y escritorio (`AC07`), más `NotaDelDiaVista` para `/nota-del-dia`.
- Implementar `CursoDocenteDetalleVista` en `features/seguimiento/` componiendo los subcomponentes de `evaluacion/` dentro de sus 6 pestañas (`Novedades`, `Clases`, `Registro auxiliar`, `Actividades`, `Cierre`, `Estudiantes`) sin ciclos entre módulos (`ADR-008`).

**Non-Goals:**
- Redactor de envío masivo de mensajes (`/mensajes`) ni exportación Excel SIAGIE / Actas (`/siagie`), que permanecen como vistas puente hasta `docente-mensajes-y-siagie`.
- Subida de foto en `Configuración` o subida de archivos en actividades (`RC08`).
- Persistencia en PostgreSQL o cálculo desde tablas ORM (Fase 5).

## Decisions

### 1. Motor puro de evaluación CNEB y exportación tabular (`features/evaluacion/utilidades/`)
- **Decisión:** Extraer en `calculoMediana.ts`:
  - `ORDEN_NIVEL = { C: 1, B: 2, A: 3, AD: 4 }` (solo niveles válidos `AD/A/B/C`; valores vacíos o `NE` se excluyen antes de ordenar).
  - `calcularMedianaNiveles(niveles)`: ordena los valores válidos de menor a mayor y devuelve el elemento en `Math.floor(ordenados.length / 2)` (idéntico al prototipo `Portal Docente.dc.html` y `RF07`, sin promedios aritméticos).
  - `calcularNotaDelDia(criterios, ajusteManual?)`: prioriza `ajusteManual` si existe o devuelve `calcularMedianaNiveles(criterios)`.
  - `calcularNivelCapacidad(sesionesCapacidad, estudianteIdx, metodo: "mediana" | "ultimo")` y `calcularSugerenciaCompetencia(nivelesCapacidades, metodo)`.
  - `requiereConclusionDescriptiva(nivel, nivelEducativo: "Primaria" | "Secundaria")` y `validarCierreCompetencia(filas, nivelEducativo)`: exige que todos los alumnos tengan nivel asignado y que los niveles obligatorios (`B`/`C` en Primaria; `C` en Secundaria) tengan conclusión `>= 10` caracteres (`RF22`).
- **Exportación auxiliar local:** `exportadorCsvAuxiliar.ts` genera CSV UTF-8 con BOM (`\uFEFF`) separado por `;` para ficha de clase y registro auxiliar (evita dependencias pesadas en el cliente; el `.xlsx` oficial SIAGIE con `openpyxl` vive en el servicio de reportes).

### 2. Contratos OpenAPI stub de evaluación y detalle de sección (`backend/`)
- **Decisión (`backend/app/modules/evaluacion/`):**
  - `GET /api/v1/evaluacion/docentes/{docente_id}/secciones/{seccion_id}/clases` → `PanelEvaluacionSeccionOut`: catálogo de competencias/capacidades de la asignatura, nómina de estudiantes ordenada alfabéticamente, sesiones de clase (`id`, `competencia`, `capacidad_idx`, `tema`, `evidencia`, `fecha`, `criterios[4]`, `notas_por_estudiante`, `ajustes_manuales`, `estado: "pendiente" | "registrada"`), actividades (`id`, `titulo`, `fecha_entrega`, `competencia`, `descripcion`, `estado: "borrador" | "publicada"`), niveles guardados/confirmados y conclusiones.
  - `POST /api/v1/evaluacion/docentes/{docente_id}/secciones/{seccion_id}/sesiones` → `SesionClaseOut` (valida tema `>= 3` chars y 4 criterios no vacíos → `422` si falla).
  - `POST /api/v1/evaluacion/docentes/{docente_id}/secciones/{seccion_id}/sesiones/{sesion_id}/notas` → `SesionClaseOut` (valida cuando `publicar=True` que todos los estudiantes tengan los 4 criterios → `400` `ErrorAplicacion` si faltan criterios).
  - `POST /api/v1/evaluacion/docentes/{docente_id}/secciones/{seccion_id}/actividades` → `ActividadDocenteOut` (`estado: "borrador" | "publicada"`, valida título `>= 4` chars y fecha).
  - `POST /api/v1/evaluacion/docentes/{docente_id}/actividades/{actividad_id}/publicar` → `ActividadDocenteOut` (`404` si no existe).
  - `POST /api/v1/evaluacion/docentes/{docente_id}/secciones/{seccion_id}/cierre/confirmar` → `ConfirmacionCierreOut` (valida completitud de niveles y conclusiones obligatorias según `nivel_educativo` → `400` `ErrorAplicacion` si faltan).
  - `POST /api/v1/evaluacion/docentes/{docente_id}/secciones/{seccion_id}/observaciones` → `ObservacionDocenteOut` (valida texto `>= 5` chars y tipo `"Positiva" | "Por mejorar"`).
- **Decisión (`backend/app/modules/seguimiento/`):**
  - `GET /api/v1/seguimiento/docentes/{docente_id}/secciones/{seccion_id}` → `DetalleSeccionDocenteOut` (`seccion_id`, `nombre`, `asignatura`, `horario`, `aula`, `tutor`, `estudiantes_total`, `clases_registradas`, `competencias_confirmadas`, `distribucion_niveles`, `pendientes`, `stream`; lanza `404` `ErrorAplicacion` si la sección no existe).
  - `POST /api/v1/seguimiento/docentes/{docente_id}/secciones/{seccion_id}/anuncios` → `ElementoStreamSeccionOut` (crea anuncio unidireccional `"Aviso" | "Recordatorio" | "Tarea"` validando texto `>= 3` chars).

### 3. Composición modular respetando `ADR-008`
- **Decisión:** Todo el estado interactivo de las pestañas `Clases`, `Registro auxiliar`, `Actividades`, `Cierre` y `Estudiantes` se construye como componentes autocontenidos dentro de `frontend/src/features/evaluacion/componentes/`.
- `seguimiento/vistas/cursoDocenteDetalleVista.tsx` consulta ambos recursos (`DetalleSeccionDocenteOut` y `PanelEvaluacionSeccionOut`), mantiene el estado local de sesión/ediciones stub sincronizado con las mutaciones API, renderiza `Novedades` directamente y delega las 5 pestañas restantes a los componentes importados desde `../../evaluacion/componentes/*`.
- `evaluacion/vistas/notaDelDiaVista.tsx` reutiliza `FichaClaseCuadricula` cargando directamente la sección activa del día (`4A` por defecto o parámetro `?seccion=...`) para la ruta `/nota-del-dia`.
- De este modo: `seguimiento → evaluacion` es estrictamente unidireccional (verificado por `auditar_estado_fase.py`).

### 4. Plan de pruebas por capa (`tdd.md`)
- **Backend (`backend/tests/`):**
  - `test_integracion_salud_y_errores.py`: actualizar conteo total de rutas OpenAPI (`24 + 9 = 33`).
  - `test_integracion_contrato_evaluacion.py`: probar creación/publicación/validación de sesiones, actividades, confirmación de cierre (`200` y `400` sin conclusión `C`) y observaciones (`200` y `422`).
  - `test_integracion_contrato_seguimiento.py`: probar `GET secciones/{seccion_id}` (`200` y `404`) y `POST anuncios` (`200` y `422`).
- **Frontend (`frontend/src/**/pruebas/`):**
  - `evaluacion/pruebas/testUnitarioCalculoMediana.test.ts` (TDD primero): mediana de criterios, ajuste manual, cálculo por capacidad (`mediana` y `ultimo`), sugerencia de competencia y validación `RF22` en Primaria (`B`/`C`) vs Secundaria (`C`).
  - `evaluacion/pruebas/testComponenteFichaClaseCuadricula.test.tsx`: edición de criterios `K1..K4`, cálculo automático de nota del día, `Completar vacíos con A`, rechazo de publicación incompleta y publicación exitosa.
  - `evaluacion/pruebas/testComponentePanelCierreCompetencias.test.tsx`: `Usar sugeridos`, bloqueo sin conclusión en `C`, confirmación exitosa al redactar conclusión `>= 10` caracteres.
  - `evaluacion/pruebas/testIntegracionNotaDelDiaVista.test.tsx`: carga de `/nota-del-dia`, publicación de ficha activa y reintento ante error.
  - `seguimiento/pruebas/testIntegracionCursoDocenteDetalleVista.test.tsx`: navegación entre las 6 pestañas (`Novedades`, `Clases`, `Registro auxiliar`, `Actividades`, `Cierre`, `Estudiantes`), publicación de anuncio en `Novedades`, alta de actividad sin subida de archivos, alta de observación y error `404` de sección.
  - `app/pruebas/testE2eRecorridoDocenteBase.test.tsx`: ampliar recorrido E2E verificando entrada a `/nota-del-dia` y `/cursos/3B`.

## Risks / Trade-offs

- **[Sincronización visual entre cambios locales stub y caché React Query]** → Al crear una clase, publicar notas, confirmar una competencia o publicar un anuncio/actividad, cada vista/panel actualizará el estado en caché de React Query tras la respuesta `200` de la API para que el conteo en cabecera (`Clases registradas`, `Competencias confirmadas`) y el `Registro auxiliar` se reflejen al instante al cambiar de pestaña.
- **[Complejidad de renderizado en tablas de 30+ alumnos en móvil `360 px`]** → En `FichaClaseCuadricula` y `RegistroAuxiliarTabla` se aplicará contenedor con desplazamiento horizontal controlado (`overflowX: "auto"` dentro de la tarjeta) y primera columna fija (`Estudiante`) tal como define el prototipo `Portal Docente.dc.html`, evitando desbordamiento de la ventana (`AC07`).
