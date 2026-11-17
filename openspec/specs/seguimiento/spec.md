# seguimiento Specification

## Purpose
Define el comportamiento observable de las vistas web de seguimiento diario del estudiante: tablero de inicio en tres variantes (`A`, `B` y `C`), marcado de novedades vistas, listado de cursos y detalle por asignatura.

## Requirements

### Requirement: Tablero de inicio en tres variantes (RF01, HU10, AC01)
El portal MUST mostrar al estudiante autenticado la vista de inicio con saludo, contador de novedades sin ver y selector entre tres variantes de presentación: `A · Feed de novedades`, `B · Resumen por módulos` y `C · Agenda semanal`, manteniendo la variante elegida mientras navega en su sesión.

#### Scenario: Cambio entre variantes A, B y C del tablero
- **GIVEN** un estudiante con sesión activa que accede a la ruta de inicio y recibe sus datos de seguimiento
- **WHEN** selecciona sucesivamente las variantes `A · Feed de novedades`, `B · Resumen por módulos` y `C · Agenda semanal`
- **THEN** la variante `A` muestra las novedades agrupadas temporalmente junto a próximas entregas y resumen de asistencia; la variante `B` muestra los indicadores KPI, próximas entregas, últimos calificativos, mensajes recientes y distribución de niveles (`AD`, `A`, `B`, `C`); y la variante `C` muestra la agenda de lunes a viernes destacando el día actual

#### Scenario: Estado sin novedades ni entregas en inicio
- **GIVEN** un estudiante cuya respuesta de inicio no contiene novedades ni entregas pendientes
- **WHEN** visualiza el tablero de inicio en la variante `A`
- **THEN** el portal muestra un estado vacío informativo sin errores de renderizado y mantiene accesible el cambio a las variantes `B` y `C`

#### Scenario: Error de carga o acceso con rol distinto a estudiante
- **GIVEN** un estudiante cuya consulta al tablero falla por error del servidor, o una cuenta sin perfil de estudiante activo
- **WHEN** intenta abrir la vista de inicio
- **THEN** ante un fallo de consulta el portal muestra un mensaje de error con opción de reintentar sin exponer detalles técnicos, y sin perfil de estudiante válido bloquea o redirige fuera del flujo de seguimiento del alumno

### Requirement: Filtro de novedades y marcado como visto (RF01, RF26, HU10)
El portal MUST filtrar las novedades mostradas según las preferencias locales de avisos activas y permitir marcar todas las novedades como vistas, actualizando a cero el contador visible de novedades pendientes.

#### Scenario: Filtrado de novedades por preferencias locales de avisos
- **GIVEN** un estudiante que desactivó los avisos de asistencia o calificaciones en sus preferencias de configuración
- **WHEN** carga la vista de inicio
- **THEN** las novedades correspondientes a las categorías desactivadas se omiten del listado visible sin alterar los datos recibidos del servidor

#### Scenario: Marcar todo como visto exitosamente
- **GIVEN** un estudiante con novedades sin ver en su tablero de inicio
- **WHEN** activa el control `Marcar todo como visto`
- **THEN** el portal registra la visita en el servidor, actualiza la marca de última visita y muestra el contador de novedades sin ver en cero

#### Scenario: Error al marcar novedades como vistas
- **GIVEN** un estudiante con novedades sin ver cuyo intento de confirmar lectura falla en el servidor
- **WHEN** activa el control `Marcar todo como visto`
- **THEN** el portal informa el error de forma clara y conserva el conteo previo de novedades sin ver para permitir un nuevo intento

### Requirement: Listado resumen de mis cursos (RF04, HU12)
El portal MUST listar las asignaturas del estudiante con el grado y sección actual, total de pendientes, docente titular, horario, próximas entregas por curso, chips de niveles recientes y accesos directos a las secciones del curso.

#### Scenario: Visualización de la grilla de asignaturas y accesos rápidos
- **GIVEN** un estudiante con asignaturas asignadas en su sección actual
- **WHEN** accede a la vista de cursos
- **THEN** visualiza el resumen con cantidad de cursos y pendientes totales, una tarjeta por asignatura con docente, horario, iniciales, próximas entregas (o mensaje positivo cuando no tiene entregas pendientes), niveles recientes y accesos directos a detalle, trabajos, calificaciones y personas del curso

#### Scenario: Estudiante sin cursos asignados o fallo de carga
- **GIVEN** un estudiante sin asignaturas registradas o con falla de respuesta al consultar cursos
- **WHEN** accede a la vista de cursos
- **THEN** el portal muestra un estado vacío informativo cuando la lista está vacía, o un mensaje de error con acción de reintento cuando falla la carga

### Requirement: Detalle del curso y sus cuatro pestañas (RF04, RF23, HU12, RC08)
Al seleccionar una asignatura, el portal MUST mostrar el detalle del curso con barra superior de retorno, cabecera del curso y docente, y cuatro pestañas navegables: `Novedades`, `Trabajos`, `Calificaciones` y `Personas`, respetando la restricción de solo consulta y comunicación unidireccional (`RC08`).

#### Scenario: Navegación entre las cuatro pestañas del curso
- **GIVEN** un estudiante dentro del detalle de una asignatura existente
- **WHEN** alterna entre las pestañas `Novedades`, `Trabajos`, `Calificaciones` y `Personas`
- **THEN** `Novedades` presenta el bloque lateral de próximas entregas y niveles actuales junto al flujo cronológico del curso; `Trabajos` agrupa las actividades del curso diferenciando pendientes y completados sin controles para subir archivos; `Calificaciones` muestra las competencias con niveles por trimestre (`I`, `II`, `III*`); y `Personas` lista al docente del curso y al equipo de sección indicando que los docentes escriben en un solo sentido

#### Scenario: Curso inexistente o no perteneciente al estudiante
- **GIVEN** un estudiante que navega hacia un identificador de asignatura inexistente o ajeno a su matrícula
- **WHEN** el servidor rechaza la consulta del detalle de curso
- **THEN** el portal informa que no se pudo cargar el curso solicitado y ofrece volver al listado de cursos

### Requirement: Adaptación móvil y navegación accesible en seguimiento (AC04, AC06, AC07)
Las vistas de inicio y cursos MUST adaptarse a pantallas móviles y de escritorio sin desbordamiento horizontal y con controles operables por teclado y lectores de pantalla (`AC04`, `AC06`).

#### Scenario: Operación accesible en pestañas y tarjetas interactivas
- **GIVEN** un estudiante que navega en el detalle del curso y el selector de variantes de inicio
- **WHEN** recorre las pestañas de variante o de curso mediante teclado y lector de pantalla
- **THEN** los controles exponen roles y etiquetas accesibles y ajustan su disposición en ancho móvil sin ocultar pestañas ni truncar acciones principales

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

### Requirement: Detalle de sección docente y sus seis pestañas operativas (RF04, RF23, RF26, ADR-008)
Al seleccionar una sección desde `Mis cursos` o desde el tablero inicial, el portal SHALL mostrar al docente el detalle de la sección con barra de retorno, cabecera informativa (`asignatura`, `sección`, `horario`, `aula`, `tutor`, totales de estudiantes, clases registradas y competencias confirmadas) y seis pestañas navegables: `Novedades`, `Clases`, `Registro auxiliar`, `Actividades`, `Cierre` y `Estudiantes`.

#### Scenario: Navegación integral entre las seis pestañas de la sección docente
- **GIVEN** un docente autenticado accede al detalle de una sección asignada (por ejemplo `3.° B`)
- **WHEN** alterna sucesivamente entre las pestañas `Novedades`, `Clases`, `Registro auxiliar`, `Actividades`, `Cierre` y `Estudiantes`
- **THEN** `Novedades` muestra el resumen lateral de notas pendientes, la distribución de niveles (`AD`, `A`, `B`, `C`) y el flujo cronológico; mientras las pestañas restantes muestran respectivamente la lista/ficha de clases, el registro auxiliar, las actividades, el panel de cierre y la nómina de estudiantes

#### Scenario: Acceso directo a una pestaña específica o manejo de sección inexistente
- **GIVEN** un docente utiliza un acceso directo de la tarjeta de sección hacia `Cierre` o navega hacia un identificador de sección inexistente
- **WHEN** se carga el detalle de la sección
- **THEN** si la sección existe abre directamente la pestaña solicitada, y si no existe informa el error con acción para volver a `Mis cursos`

### Requirement: Publicación de anuncios unidireccionales en el flujo de novedades de la sección (RF25, RC08)
El portal SHALL permitir al docente redactar y publicar anuncios en la pestaña `Novedades` de su sección eligiendo la categoría (`Aviso`, `Recordatorio` o `Tarea`), incorporándolos inmediatamente en el flujo cronológico sin habilitar chat ni respuestas libres en el muro (`RC08`).

#### Scenario: Publicación exitosa y validación de anuncio vacío en Novedades
- **GIVEN** un docente abre el publicador de anuncios dentro de `Novedades` de una sección
- **WHEN** intenta publicar con menos de 3 caracteres, y luego redacta un aviso válido y acciona `Publicar`
- **THEN** el sistema bloquea el envío vacío y, al publicar un texto válido, lo agrega al inicio del flujo cronológico de la sección indicando que es comunicación en un solo sentido
