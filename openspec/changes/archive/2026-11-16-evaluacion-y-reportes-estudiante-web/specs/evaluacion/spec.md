# Spec Delta

## Purpose
Define el comportamiento observable de las vistas de calificaciones por competencia y bandeja de mensajes por hilos del estudiante dentro del módulo de evaluación.

## ADDED Requirements

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
