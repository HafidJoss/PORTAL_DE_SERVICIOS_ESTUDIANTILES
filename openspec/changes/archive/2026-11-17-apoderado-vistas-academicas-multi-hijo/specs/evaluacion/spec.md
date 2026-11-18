# Delta Specification · evaluacion

## ADDED Requirements

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
