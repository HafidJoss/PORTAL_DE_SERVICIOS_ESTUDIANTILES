# Spec Delta

## Purpose
Define el comportamiento observable de la consulta de trabajos y sesiones de clase (`nota del día`) del estudiante en la vista de actividades académicas, en modo solo consulta sin subida de archivos.

## ADDED Requirements

### Requirement: Filtrado y resumen de actividades en Trabajos y pendientes (RF23, HU10, RC08)
El portal MUST mostrar las actividades académicas del estudiante agrupadas mediante pestañas (`Pendientes`, `Entregados` y `Todos`), indicando el conteo de pendientes y próximos a vencer, e informando explícitamente que las entregas se realizan en clase y el portal no recibe archivos (`RC08`).

#### Scenario: Filtrado por pestañas Pendientes, Entregados y Todos
- **GIVEN** un estudiante con actividades en estado pendiente, vencido, entregado y calificado
- **WHEN** accede a la vista de trabajos y alterna entre las pestañas `Pendientes`, `Entregados` y `Todos`
- **THEN** la pestaña `Pendientes` muestra únicamente actividades pendientes o vencidas; `Entregados` muestra actividades entregadas o calificadas; y `Todos` muestra la lista completa junto al resumen superior de pendientes y actividades que vencen pronto

#### Scenario: Restricción sin subida de archivos en la vista de trabajos
- **GIVEN** un estudiante revisando una actividad en estado pendiente o vencido
- **WHEN** visualiza el listado y el detalle de la actividad
- **THEN** no existen botones ni campos para adjuntar o subir archivos y se mantiene visible el aviso informativo de entrega presencial en clase

#### Scenario: Pestaña sin actividades o error de consulta
- **GIVEN** un estudiante sin actividades coincidentes con la pestaña activa, o una consulta que falla por error del servidor
- **WHEN** selecciona la pestaña o carga la vista de trabajos
- **THEN** muestra un estado vacío descriptivo cuando no hay elementos en el filtro activo, o un mensaje de error con opción de reintento cuando falla la carga

### Requirement: Detalle expandible diferenciando trabajo y sesión de clase (RF23, HU10, AC06)
Cada tarjeta de actividad MUST permitir expandir y contraer su detalle inline de forma accesible, diferenciando visual y textualmente un trabajo o tarea de una sesión de clase (`nota del día`) con su competencia, capacidad, descripción, nivel (`AD`, `A`, `B`, `C`) y comentario docente cuando existan.

#### Scenario: Expansión de un trabajo pendiente y una sesión de clase calificada
- **GIVEN** una actividad de tipo trabajo con fecha de entrega y una actividad de tipo sesión de clase calificada con nivel y comentario
- **WHEN** el estudiante activa ambas tarjetas para ver su detalle
- **THEN** cada tarjeta despliega su competencia, capacidad y descripción; el trabajo muestra su fecha asignada y fecha límite de entrega; y la sesión de clase se identifica como `Nota del día` mostrando el nivel de logro y el comentario publicado sin mostrar fecha de entrega obligatoria

#### Scenario: Acceso restringido sin sesión o sin identificador de estudiante
- **GIVEN** un visitante sin sesión activa o un usuario sin perfil de estudiante asociado
- **WHEN** intenta acceder a la vista de trabajos
- **THEN** el portal impide mostrar el detalle académico y redirige o informa la falta de permisos de estudiante
