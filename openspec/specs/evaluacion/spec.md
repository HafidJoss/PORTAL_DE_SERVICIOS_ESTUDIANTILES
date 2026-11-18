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

### Requirement: Registro de sesiones de clase, criterios y Nota del día (RF06, RF07, RF23, HU14, AC07)
El sistema SHALL permitir al docente crear sesiones con criterios editables (`K1..K4`), registrar niveles `AD/A/B/C` por criterio desde escritorio o móvil, calcular la **nota del día** mediante mediana cualitativa con ajuste manual y completado masivo, y exigir los cuatro criterios completos antes de publicar.

#### Scenario: Creación de sesión, cálculo automático de nota del día y publicación exitosa
- **GIVEN** un docente abre la ficha de una clase pendiente o crea una nueva clase con tema y cuatro criterios
- **WHEN** registra los cuatro criterios (`K1..K4`) para los estudiantes de la sección (o utiliza `Completar vacíos con A`) y acciona `Guardar y publicar`
- **THEN** la nota del día de cada estudiante refleja el nivel predominante (mediana) de sus criterios o su ajuste manual marcado, la sesión cambia a estado publicada y permite descargar la ficha en formato tabular

#### Scenario: Bloqueo de publicación por criterios incompletos
- **GIVEN** una sesión de clase tiene estudiantes sin los cuatro criterios registrados
- **WHEN** el docente intenta ejecutar `Guardar y publicar`
- **THEN** el sistema impide la publicación indicando cuántos estudiantes tienen criterios pendientes sin perder los avances capturados

### Requirement: Registro auxiliar cualitativo por capacidades sin promedios numéricos (RF07, RF08, HU02)
El portal MUST presentar al docente un registro auxiliar filtrable por competencia (`C1..C4`) que agrupe las sesiones publicadas por capacidad, calcule el nivel sugerido por capacidad y el nivel sugerido de la competencia según el método configurado (`mediana` o `último nivel registrado`), sin mostrar promedios aritméticos ni notas vigesimales, y permita descargar el registro por competencia.

#### Scenario: Cambio de competencia y cálculo cualitativo en el registro auxiliar
- **GIVEN** una sección cuenta con sesiones publicadas distribuidas entre competencias y capacidades
- **WHEN** el docente consulta el registro auxiliar y alterna entre las competencias `C1`, `C2`, `C3` y `C4`
- **THEN** el sistema muestra las sesiones agrupadas bajo cada capacidad con su nivel calculado por capacidad, el nivel sugerido de la competencia en escala `AD/A/B/C` (o un estado vacío si la competencia aún no tiene clases registradas)

### Requirement: Gestión de actividades en borrador o publicadas sin subida de archivos (RF23, RC08)
El sistema SHALL permitir al docente crear actividades académicas indicando título, fecha de entrega, competencia e indicaciones, guardándolas como `Borrador` o publicándolas inmediatamente para estudiantes y apoderados, y publicar posteriormente borradores existentes sin ofrecer carga ni adjunto de archivos (`RC08`).

#### Scenario: Creación de borrador, publicación posterior y ausencia de carga de archivos
- **GIVEN** un docente se encuentra en la gestión de actividades de una sección
- **WHEN** registra una actividad válida seleccionando `Guardar borrador` y luego acciona `Publicar` sobre esa actividad
- **THEN** la actividad pasa de `Borrador` a `Publicada`, sin mostrar campos ni botones para adjuntar archivos (`RC08`), y valida título y fecha obligatorios antes de guardar

### Requirement: Cierre trimestral de competencias y validación de conclusiones descriptivas (RF07, RF08, RF22, HU02)
El sistema SHALL permitir al docente revisar por cada competencia el nivel sugerido, aplicar todos los sugeridos o ajustar niveles individuales (`AD`, `A`, `B`, `C`), redactar la conclusión descriptiva y confirmar la competencia únicamente cuando todos los estudiantes cuenten con nivel asignado y quienes tengan nivel obligatorio (`B` o `C` en Primaria; `C` en Secundaria) posean conclusión descriptiva válida de al menos 10 caracteres.

#### Scenario: Confirmación exitosa de competencia tras completar conclusiones obligatorias
- **GIVEN** un docente revisa el cierre de una competencia en Secundaria con al menos un estudiante en nivel `C`
- **WHEN** ingresa una conclusión descriptiva de al menos 10 caracteres para cada estudiante con nivel `C` (o ajusta el nivel) y acciona `Confirmar niveles`
- **THEN** el sistema confirma la competencia mostrando el indicador de confirmación y habilitando la persistencia del cierre trimestral

#### Scenario: Rechazo de confirmación cuando falta nivel o conclusión descriptiva obligatoria (RF22)
- **GIVEN** una competencia en cierre tiene estudiantes sin nivel asignado o estudiantes con nivel obligatorio sin conclusión descriptiva suficiente
- **WHEN** el docente intenta confirmar los niveles de la competencia
- **THEN** el sistema rechaza la confirmación, señala la cantidad exacta de estudiantes pendientes y mantiene la competencia sin confirmar

### Requirement: Registro de observaciones por estudiante desde nómina de sección (RF24, RC08)
El portal SHALL mostrar el listado buscable de estudiantes de la sección con su último nivel registrado y permitir publicar observaciones clasificadas como `Positiva` o `Por mejorar` dirigidas al estudiante y su apoderado, validando una longitud mínima del texto.

#### Scenario: Búsqueda de estudiante y publicación de observación
- **GIVEN** un docente consulta la nómina de estudiantes de una sección
- **WHEN** filtra por nombre de un estudiante, selecciona el tipo de observación (`Positiva` o `Por mejorar`), escribe al menos 5 caracteres y confirma `Publicar observación`
- **THEN** el sistema registra la observación para el estudiante y su apoderado, incrementa el conteo visible de observaciones del alumno y rechaza envíos con texto vacío

### Requirement: Envío docente de mensajes a sección o estudiante sin archivos adjuntos (RF25, HU15, RC08)
El portal SHALL permitir al docente redactar y enviar mensajes de tipo `Tarea` o `Recordatorio` dirigidos a toda una sección asignada o a un estudiante específico y su apoderado, listando cronológicamente los mensajes enviados sin ofrecer subida de archivos adjuntos ni chat en tiempo real (`RC08`).

#### Scenario: Envío exitoso de mensaje a una sección y registro en enviados
- **GIVEN** un docente autenticado accede a la pantalla `Mensajes`
- **WHEN** selecciona el tipo `Recordatorio`, elige la sección `4.° A`, redacta asunto y texto válidos y acciona `Enviar`
- **THEN** el sistema registra el mensaje sin controles para adjuntar archivos, limpia los campos del formulario y lo incorpora al inicio del listado cronológico de mensajes enviados

#### Scenario: Validación de asunto o contenido insuficiente al enviar mensaje
- **GIVEN** un docente intenta enviar un mensaje con asunto menor a 3 caracteres o cuerpo menor a 5 caracteres
- **WHEN** acciona `Enviar`
- **THEN** el sistema bloquea el envío mostrando un aviso claro de validación y mantiene los campos editables para su corrección

### Requirement: Consulta multi-hijo de calificaciones cualitativas y trabajos para el apoderado (RF08, RF22, RF23, HU06, HU10, DA05, RC08)

El portal MUST mostrar al apoderado las calificaciones cualitativas (`AD/A/B/C`, sin promedios aritméticos ni notas vigesimales) y los trabajos/sesiones del menor vinculado seleccionado, actualizando los datos al cambiar de menor, prohibiendo la subida de archivos (`RC08`) y rechazando con `403 Problem Details` (`DA05`) cualquier menor ajeno.

#### Scenario: Consulta de calificaciones y trabajos diferenciada por menor activo
- **GIVEN** un apoderado autenticado consultando `/calificaciones` o `/trabajos` para `est-demo-1`
- **WHEN** selecciona al segundo menor vinculado (`est-demo-2`) en `Cambiar de menor`
- **THEN** ambas vistas vuelven a consultar al backend con el identificador del menor seleccionado, actualizan competencias, conclusiones descriptivas, calificativos publicados y actividades sin mostrar controles `<input type="file">` (`RC08`) ni notas vigesimales

#### Scenario: Rechazo de pertenencia ante menor ajeno en calificaciones o actividades (DA05)
- **GIVEN** una consulta a los endpoints de calificaciones o actividades estudiantiles con parámetro `apoderado_id` y un `estudiante_id` no vinculado
- **WHEN** el backend valida la pertenencia familiar
- **THEN** retorna estado `403` Problem Details (`RFC 9457`) impidiendo el acceso a los registros académicos

### Requirement: Lectura de mensajes informativos multi-hijo del apoderado sin respuesta abierta ni adjuntos (RF24, RF25, HU15, DA05, RC08)

El portal MUST presentar al apoderado la bandeja filtrable de mensajes académicos (`Todos`, `Tareas`, `Recordatorios`, `Observaciones`) del menor seleccionado, permitiendo confirmar lectura (reduciendo el contador sin leer) y navegar a `Trabajos` cuando exista actividad vinculada, manteniendo el hilo en modo informativo de solo lectura sin formulario de respuesta libre ni adjuntos (`RC08`).

#### Scenario: Confirmación de lectura e inexistencia de respuesta abierta para Apoderado
- **GIVEN** un apoderado visualizando el detalle de un mensaje docente en `/mensajes` para su menor activo
- **WHEN** revisa el contenido del mensaje y confirma su lectura
- **THEN** el contador de mensajes sin leer disminuye, permanece visible el enlace `Ver en Trabajos` si aplica y un aviso indica que el mensaje es informativo y no admite respuestas abiertas ni subida de archivos (`RC08`)

#### Scenario: Rechazo de pertenencia en bandeja de mensajes estudiantiles (DA05)
- **GIVEN** una consulta a la bandeja de mensajes de un estudiante con contexto `apoderado_id` hacia un `estudiante_id` no vinculado
- **WHEN** el servidor valida el vínculo apoderado-estudiante
- **THEN** responde con error `403` Problem Details (`RFC 9457`)
