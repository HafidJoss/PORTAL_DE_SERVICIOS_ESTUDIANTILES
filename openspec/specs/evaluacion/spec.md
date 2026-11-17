# evaluacion Specification

## Purpose
Define el comportamiento observable de las vistas académicas del módulo de evaluación para el estudiante: consulta de trabajos y notas del día, calificaciones por competencia (`AD/A/B/C`) y bandeja de mensajes por hilos con confirmación de lectura y respuestas acotadas.

## Requirements

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

### Requirement: Consulta de calificaciones por competencia y escala cualitativa (RF08, RF22, RF23, HU06, HU10)
El portal MUST mostrar al estudiante autenticado sus asignaturas con la leyenda cualitativa (`AD`, `A`, `B`, `C`), los niveles por competencia para cada trimestre (`I`, `II`, `III*` preliminar en evaluación sin promedios aritméticos ni notas vigesimales), las conclusiones descriptivas publicadas y el detalle de calificativos publicados, junto con acceso directo a su libreta.

#### Scenario: Consulta por curso de niveles, conclusiones y calificativos publicados
- **GIVEN** un estudiante autenticado con cursos evaluados y trimestres publicados o en evaluación
- **WHEN** accede a la vista de calificaciones y selecciona una asignatura
- **THEN** visualiza la tabla de competencias con niveles por trimestre (`AD`, `A`, `B`, `C` o `—`), la marca aclaratoria cuando el tercer trimestre está en evaluación, las conclusiones descriptivas de trimestres cerrados, los calificativos publicados de trabajos y sesiones de clase, y el enlace hacia la libreta sin mostrar notas vigesimales ni promedios aritméticos

#### Scenario: Asignatura sin calificativos publicados o fallo al consultar calificaciones
- **GIVEN** una asignatura sin calificativos publicados en el trimestre actual, o una falla en la consulta al servidor
- **WHEN** el estudiante consulta la vista de calificaciones
- **THEN** cuando no existen calificativos muestra un mensaje informativo vacío sin ocultar las competencias, y ante fallo del servidor ofrece un mensaje claro con opción de reintentar

#### Scenario: Acceso restringido sin perfil de estudiante activo
- **GIVEN** un usuario autenticado cuyo rol no corresponde a un estudiante ni posee identificador de alumno asociado
- **WHEN** intenta acceder a la vista de calificaciones
- **THEN** el portal impide mostrar el detalle de notas e informa que la vista corresponde solo a estudiantes

### Requirement: Bandeja de mensajes filtrable y vista maestro-detalle (RF24, RF25, HU15, AC04)
El portal MUST mostrar al estudiante la bandeja de mensajes docentes con el conteo de mensajes sin leer, filtros por categoría (`Todos`, `Tareas`, `Recordatorios`, `Observaciones`) y vista de detalle con enlace a trabajos cuando exista una actividad vinculada, adaptándose en móviles con retorno al listado (`AC04`).

#### Scenario: Filtrado por categoría y apertura de detalle con enlace a actividad
- **GIVEN** un estudiante con mensajes de tipo tarea, recordatorio y observación en su bandeja
- **WHEN** alterna entre las pestañas de filtro y selecciona un mensaje vinculado a una actividad académica
- **THEN** el listado se acota al tipo seleccionado, el panel de detalle presenta remitente, curso, destinatarios y cuerpo completo, y muestra la acción para abrir la vista de trabajos

#### Scenario: Bandeja sin mensajes o fallo al cargar mensajes
- **GIVEN** un filtro sin mensajes coincidentes, o una respuesta de error al consultar la bandeja
- **WHEN** el estudiante visualiza la vista de mensajes
- **THEN** muestra un estado vacío descriptivo cuando no hay mensajes visibles, o un error recuperable con acción de reintento cuando falla la consulta

#### Scenario: Navegación móvil con retorno a la bandeja de mensajes
- **GIVEN** un estudiante navegando en ancho móvil que abre el detalle de un mensaje
- **WHEN** activa el control de retorno hacia mensajes
- **THEN** regresa al listado de la bandeja manteniendo el filtro activo y sin desbordamiento horizontal

### Requirement: Confirmación de lectura y respuesta acotada en hilo (RF25, RC08, HU15)
Al consultar un mensaje, el portal MUST permitir confirmar su lectura y enviar respuestas de texto acotadas (entre 1 y 2000 caracteres) dentro del mismo hilo del docente, manteniendo prohibida la subida de archivos adjuntos y la mensajería libre entre estudiantes (`RC08`).

#### Scenario: Confirmación de lectura y decremento del contador sin leer
- **GIVEN** un estudiante con un mensaje pendiente de confirmar lectura
- **WHEN** confirma la lectura del mensaje seleccionado
- **THEN** el mensaje queda marcado con lectura confirmada y el contador superior de mensajes sin leer disminuye en concordancia

#### Scenario: Respuesta válida dentro del hilo sin adjuntos
- **GIVEN** un estudiante visualizando el hilo de un mensaje docente
- **WHEN** escribe un texto válido entre 1 y 2000 caracteres y envía la respuesta
- **THEN** la respuesta aparece incorporada en el hilo con autor y fecha, el campo de texto se limpia y no existen controles para adjuntar archivos (`RC08`)

#### Scenario: Validación de respuesta inválida o error al responder en el hilo
- **GIVEN** un estudiante intentando responder con texto vacío o mayor a 2000 caracteres, o un envío rechazado por el servidor
- **WHEN** activa el envío de la respuesta
- **THEN** si el texto es inválido impide el envío mostrando la regla de longitud, y si falla en el servidor muestra el error conservando el texto redactado para reintentar
