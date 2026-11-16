# Spec Delta

## Purpose
Define el comportamiento observable de las vistas web de seguimiento diario del estudiante: tablero de inicio en tres variantes (`A`, `B` y `C`), marcado de novedades vistas, listado de cursos y detalle por asignatura.

## ADDED Requirements

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
