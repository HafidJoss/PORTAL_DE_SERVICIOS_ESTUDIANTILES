# Proposal

## Why

Con la base de autenticación multi-rol y el tablero inicial del docente ya implementados en `docente-base-y-seguimiento`, el núcleo operativo de [Portal Docente.dc.html](../../../prototipos/Portal%20Docente.dc.html) reside en el registro continuo de clases y criterios (`Nota del día`), el registro auxiliar cualitativo por capacidades, la creación de actividades sin subida de archivos, el cierre trimestral con sugerencia por mediana y conclusiones descriptivas, y la publicación de observaciones y anuncios en el detalle de cada sección. Esta segunda parte de la Fase 2 habilita dichas capacidades de extremo a extremo respetando `ADR-008` (`seguimiento` → `evaluacion`, sin ciclos) y la escala CNEB (`AD`, `A`, `B`, `C`).

## What Changes

- **Evaluación docente y cálculo por mediana (`evaluacion`)**:
  - Exponer en `backend/app/modules/evaluacion/` los endpoints contractuales stub para sesiones de clase y criterios `K1..K4`, actividades (`borrador` / `publicada`), confirmación de niveles del trimestre con validación de conclusiones (`RF22`) y publicación de observaciones por estudiante (`RF24`).
  - Implementar en `frontend/src/features/evaluacion/` la lógica pura de cálculo por mediana / último nivel registrado y validación de conclusiones obligatorias (`B`/`C` en primaria, `C` en secundaria) en `utilidades/calculoMediana.ts` y exportación CSV del registro en `utilidades/exportadorCsvAuxiliar.ts`.
  - Implementar los componentes modulares de evaluación docente (`fichaClaseCuadricula.tsx`, `formularioNuevaClase.tsx`, `registroAuxiliarTabla.tsx`, `panelCierreCompetencias.tsx`, `formularioActividadDocente.tsx`, `listaEstudiantesSeccion.tsx`) y la vista directa `/nota-del-dia` (`notaDelDiaVista.tsx`) optimizada para captura rápida en celular (`RF06`, `AC07`).
- **Detalle de sección en 6 subpestañas (`seguimiento`)**:
  - Ampliar `backend/app/modules/seguimiento/` con los endpoints contractuales de detalle de sección docente (`GET .../secciones/{seccion_id}`) y publicación de anuncios unidireccionales (`POST .../secciones/{seccion_id}/anuncios`).
  - Implementar `CursoDocenteDetalleVista` (`features/seguimiento/vistas/cursoDocenteDetalleVista.tsx`) con cabecera de sección, barra de retorno y seis pestañas navegables (`Novedades`, `Clases`, `Registro auxiliar`, `Actividades`, `Cierre`, `Estudiantes`), conectando las acciones rápidas de `CursosDocenteVista` directamente a cada pestaña.
- **Enrutamiento y contrato OpenAPI (`plataforma-web`)**:
  - Registrar las rutas contractuales nuevas en OpenAPI y reemplazar en `app/aplicacion.tsx` las vistas puente de `/cursos/:asignaturaId` y `/nota-del-dia` por `CursoDocenteDetalleVista` y `NotaDelDiaVista`.
- **Fuera de alcance en este cambio (`docente-mensajes-y-siagie` / `RC08`)**:
  - Redactor de envío de mensajes (`MensajesDocenteVista`) y exportación Excel SIAGIE / Actas preliminares (`ExportarSiagieVista`), que corresponden a la parte 3 (`docente-mensajes-y-siagie`).
  - Subida de archivos de actividades o evidencias y chat libre en tiempo real (`RC08`), así como persistencia real en PostgreSQL (Fase 5).

## Capabilities

### New Capabilities

*(Ninguna: amplía las capacidades vigentes en `openspec/specs/`.)*

### Modified Capabilities

- `evaluacion`: cuadrícula de criterios `K1..K4` y nota del día, registro auxiliar sin promedios numéricos, alta borrador/publicada de actividades sin adjuntos, cierre por competencia con sugerencia por mediana y conclusiones obligatorias (`RF22`), y registro de observaciones (`RF06`, `RF07`, `RF08`, `RF22`, `RF23`, `RF24`, `HU02`, `HU14`, `AC07`, `RC08`).
- `seguimiento`: detalle de sección docente con seis pestañas (`Novedades`, `Clases`, `Registro auxiliar`, `Actividades`, `Cierre`, `Estudiantes`), distribución de niveles y publicación de anuncios unidireccionales (`RF04`, `RF23`, `RF24`, `RF26`, `ADR-008`, `RC08`).
- `plataforma-web`: reemplazo de las vistas puente `/cursos/:asignaturaId` y `/nota-del-dia` para `Docente` y ampliación del contrato OpenAPI bajo `/api/v1` (`RC03`, `AC06`, `AC07`).

## Impact

- **IDs atendidos:** `RF04`, `RF06`, `RF07`, `RF08`, `RF22`, `RF23`, `RF24`, `RF26`, `HU02`, `HU10`, `HU12`, `HU14`, `AC04`, `AC06`, `AC07`, `RC03`, `RC08`, `ADR-008`.
- **Backend (`backend/`):** `app/modules/evaluacion/{schemas.py,router.py}`, `app/modules/seguimiento/{schemas.py,router.py}`, `openapi.json`, `tests/core/test_integracion_salud_y_errores.py`, `tests/evaluacion/test_integracion_contrato_evaluacion.py` y `tests/seguimiento/test_integracion_contrato_seguimiento.py`.
- **Frontend (`frontend/src/`):** regeneración Orval en `api/generated/`, nuevos módulos bajo `features/evaluacion/{utilidades,componentes,vistas,pruebas}/`, actualización en `features/seguimiento/{vistas,componentes,pruebas}/`, y actualización de rutas docentes en `app/aplicacion.tsx` y `app/pruebas/`.
- **Frontera `ADR-008`:** solo `seguimiento` (`cursoDocenteDetalleVista.tsx`) importa componentes de `evaluacion`; `evaluacion` mantiene cero dependencias hacia `seguimiento`.
