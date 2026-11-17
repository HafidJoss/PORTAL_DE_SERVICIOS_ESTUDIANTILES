# Spec Delta: seguimiento

## ADDED Requirements

### Requirement: Tablero de inicio docente con bandeja y programación diaria (RF26, RF31, AC01, AC07)
El portal SHALL mostrar al docente autenticado un tablero de inicio con saludo contextual del trimestre, resumen de mensajes sin leer y clases pendientes por calificar, la bandeja de entrada unificada con filtros (`Todos`, `No leídos`, `Institución`, `Estudiantes`), las clases programadas del día con su estado (`Terminada`, `En curso`, `Siguiente`), los pendientes por calificar, alertas de atención prioritaria y la línea de tiempo de etapas del trimestre.

#### Scenario: Visualización integral del tablero inicial del docente
- **GIVEN** un docente autenticado accede a `/inicio` y la API responde con su tablero de seguimiento
- **WHEN** se carga la vista de inicio docente
- **THEN** visualiza su bandeja de entrada ordenada con etiquetas por origen (`Institución`, `Asistencia` o `Estudiante` + sección), el bloque `Clases de hoy` con horarios y estado, `Notas pendientes`, `Requiere tu atención` y el cronograma del trimestre vigente

#### Scenario: Filtrado de mensajes en bandeja y manejo de bandeja vacía o error de carga
- **GIVEN** un docente visualiza su bandeja de entrada con mensajes de institución, asistencia y estudiantes
- **WHEN** selecciona sucesivamente los filtros `No leídos`, `Institución` y `Estudiantes`, o cuando la API devuelve error de servidor
- **THEN** cada filtro muestra únicamente los mensajes que corresponden a la categoría elegida (mostrando un estado vacío informativo si no hay coincidencias) y, ante error de red o servidor, la vista muestra un aviso claro con acción para reintentar

### Requirement: Lectura y respuesta acotada en hilos desde la bandeja docente (RF25, RC08)
El sistema SHALL permitir al docente abrir un mensaje de la bandeja marcándolo como leído, marcar todos los mensajes como leídos en una sola acción y responder en hilo únicamente a consultas provenientes de estudiantes (`kind: "stu"`), sin permitir adjuntar archivos ni habilitar chat libre entre usuarios (`RC08`).

#### Scenario: Marcado masivo y respuesta en hilo a consulta de estudiante
- **GIVEN** un docente con mensajes sin leer abre una consulta enviada por un estudiante
- **WHEN** escribe una respuesta válida y la envía, o acciona `Marcar todo como leído`
- **THEN** la respuesta se registra en el hilo del mensaje sin controles para adjuntar archivos, o todos los mensajes pasan a estado leído reduciendo el contador de sin leer a cero

#### Scenario: Validación de respuesta vacía y mensajes institucionales de solo lectura
- **GIVEN** un docente abre un comunicado enviado por Dirección o intenta enviar una respuesta en blanco a un estudiante
- **WHEN** inspecciona el comunicado institucional o envía texto vacío o menor al mínimo requerido
- **THEN** el comunicado institucional no ofrece caja de respuesta en hilo y el envío vacío es rechazado mostrando un mensaje de validación sin invocar mutaciones inválidas

### Requirement: Grilla de secciones asignadas al docente en Mis cursos (RF04, RF06, HU12, AC07)
El portal MUST presentar al docente el resumen de sus secciones a cargo con totales de secciones y estudiantes, tarjetas por sección con horario, aula, barra de progreso de clases pendientes por calificar, contador de competencias confirmadas en el cierre (`X/4`) y accesos directos a las acciones de cada sección.

#### Scenario: Visualización de tarjetas por sección en Mis cursos del docente
- **GIVEN** un docente autenticado accede a `/cursos`
- **WHEN** la API devuelve sus secciones asignadas
- **THEN** visualiza el encabezado con cantidad total de secciones y estudiantes y una tarjeta por cada sección con su código, horario, aula, listado de notas pendientes con barra de progreso (o indicador `Todo calificado.`), avance de cierre y botones de acceso rápido

#### Scenario: Estado vacío y recuperación ante error al consultar Mis cursos
- **GIVEN** un docente sin secciones asignadas o cuya consulta de secciones falla en el servidor
- **WHEN** accede a `/cursos`
- **THEN** el portal muestra un estado vacío informativo cuando la lista está vacía, o un mensaje claro con botón `Reintentar` cuando ocurre un error
