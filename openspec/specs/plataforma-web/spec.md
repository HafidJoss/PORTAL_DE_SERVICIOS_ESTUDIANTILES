# plataforma-web Specification

## Purpose
Proveer la plataforma base de la aplicación web del Portal de Servicios Estudiantiles: shell responsivo institucional, manejo uniforme de errores y sesión en el cliente, preferencia visual persistente y el conjunto de contratos OpenAPI base bajo `/api/v1` para el flujo de Estudiante v2.

## Requirements

### Requirement: Shell responsivo e identidad visual del portal (RC01, AC07)
La aplicación web SHALL adaptarse tanto a pantallas de escritorio como a dispositivos móviles de al menos 360x640 píxeles, mostrando la barra lateral institucional en escritorio y la navegación inferior junto con la barra superior en móvil, con avatares de iniciales y badges de nivel de logro `AD`, `A`, `B` y `C` conformes al sistema visual de la institución.

#### Scenario: Navegación visible en escritorio
- GIVEN una pantalla con ancho de escritorio (mayor o igual a 1024 px)
- WHEN el usuario abre la aplicación dentro de una ruta autenticada del portal
- THEN el sistema muestra la barra lateral institucional con el escudo del colegio, los enlaces de navegación y el avatar de iniciales del usuario

#### Scenario: Navegación compacta en dispositivo móvil
- GIVEN una pantalla con resolución móvil de 360x640 px
- WHEN el usuario abre la aplicación dentro de una ruta autenticada del portal
- THEN el sistema oculta la barra lateral de escritorio y muestra la barra superior con el avatar de iniciales y la barra de navegación inferior sin desbordamiento horizontal

#### Scenario: Representación visual de avatar con iniciales sin subida de archivos (RC07, RC08)
- GIVEN un usuario autenticado cuyo nombre es "Luis Ángel Quispe"
- WHEN el sistema renderiza el avatar del usuario en la navegación
- THEN muestra las iniciales "LQ" sobre el contenedor circular institucional y no ofrece carga ni almacenamiento de fotografías

### Requirement: Preferencia de tema claro y oscuro en el navegador (RC01)
La aplicación web SHALL permitir alternar entre tema claro y tema oscuro y recordar la selección en el navegador del usuario entre recargas sin requerir almacenamiento remoto.

#### Scenario: Cambio y persistencia del tema visual
- GIVEN el usuario visualiza el portal con el tema claro activo
- WHEN selecciona el tema oscuro y recarga la aplicación
- THEN la aplicación mantiene el tema oscuro activo tras la recarga

### Requirement: Comunicación desacoplada y manejo uniforme de errores RFC 9457 (RC03, AC04)
El cliente web SHALL enviar credenciales de sesión y el token de protección CSRF en las peticiones hacia la API bajo `/api/v1`, y MUST traducir las respuestas de error en formato Problem Details a un error estructurado entendible por las vistas, diferenciando las respuestas de sesión inválida (`401`) y acceso denegado (`403`).

#### Scenario: Traducción de error Problem Details recibido desde la API
- GIVEN la API responde a una petición con estado HTTP 409 y cuerpo Problem Details con `title` y `detail`
- WHEN el cliente HTTP procesa la respuesta
- THEN el cliente expone el título, detalle y código de estado del problema para su visualización sin mostrar errores técnicos sin formato

#### Scenario: Detección de sesión expirada o inválida (AC04)
- GIVEN el usuario navega con una sesión expirada o inválida
- WHEN la API responde con estado HTTP 401 a una petición
- THEN el cliente notifica la expiración de sesión y redirige a la pantalla de ingreso evitando mostrar datos protegidos

#### Scenario: Rechazo por falta de permisos (AC04)
- GIVEN un usuario autenticado intenta consultar un recurso fuera de su rol o pertenencia
- WHEN la API responde con estado HTTP 403 en formato Problem Details
- THEN el cliente muestra un mensaje claro de acceso no autorizado sin cerrar su sesión vigente

### Requirement: Endpoint de verificación de salud y contratos OpenAPI para Estudiante v2 (RC03, AC06)
La API del portal SHALL exponer bajo `/api/v1` el endpoint de salud (`GET /api/v1/health`) y los endpoints contractuales iniciales de `identidad`, `seguimiento`, `evaluacion`, `asistencia` y `reportes` necesarios para `Estudiante v2`, con sus esquemas de entrada y salida en OpenAPI para generar el cliente tipado del frontend y permitir la implementación posterior de su lógica de negocio.

#### Scenario: Respuesta exitosa del servicio de salud
- GIVEN la API está en ejecución
- WHEN el cliente consulta `GET /api/v1/health`
- THEN el sistema responde con estado HTTP 200 y el indicador de estado operativo del servicio

#### Scenario: Contrato OpenAPI completo para los endpoints de Estudiante v2
- GIVEN la API expone su esquema OpenAPI
- WHEN se inspeccionan las rutas registradas bajo `/api/v1`
- THEN el esquema incluye los endpoints de `identidad` (`login`, `activar`, `logout`, `sesion`, `cambiar-contrasena`, `aviso-privacidad`), `seguimiento` (`inicio`, `novedades/visto`, `cursos`, `cursos/{asignatura_id}`), `evaluacion` (`calificaciones`, `actividades`, `mensajes`, `mensajes/{mensaje_id}/leer`, `mensajes/{mensaje_id}/respuestas`), `asistencia` (`estudiantes/{estudiante_id}`) y `reportes` (`libretas`, `libretas/{trimestre_id}/descarga`) con sus esquemas tipados

#### Scenario: Validación de formato de entrada en endpoint contractual (RF14, RF25)
- GIVEN un endpoint contractual que recibe datos estructurados (como `POST /api/v1/identidad/login`)
- WHEN se envía una petición con campos obligatorios ausentes o formato inválido
- THEN la API rechaza la petición con estado HTTP 422 y respuesta estructurada en formato Problem Details

#### Scenario: Respuesta de ruta inexistente en formato Problem Details
- GIVEN una ruta inexistente bajo `/api/v1/`
- WHEN el cliente realiza una petición a dicha ruta
- THEN la API responde con estado HTTP 404 y estructura Problem Details (`type`, `title`, `status`, `detail`)

### Requirement: Navegación institucional parametrizada según rol autenticado (RC01, AC07)
El shell responsivo del portal SHALL adaptar sus enlaces de barra lateral en escritorio y de navegación inferior en dispositivo móvil según el rol de la sesión activa (`Estudiante` o `Docente`), mostrando insignias de mensajes sin leer y notas pendientes para el docente sin alterar la navegación del estudiante ni producir desbordamiento horizontal en pantallas de 360x640 px.

#### Scenario: Menú lateral e insignias para sesión con rol Docente en escritorio
- **GIVEN** una pantalla de ancho igual o superior a 1024 px con sesión activa de rol `Docente`
- **WHEN** se renderiza el marco principal del portal
- **THEN** la navegación muestra los accesos docentes (`Inicio`, `Mis cursos`, `Nota del día`, `Mensajes`, `Exportar SIAGIE` y `Configuración`), el avatar con iniciales del docente y los contadores de pendientes cuando correspondan

#### Scenario: Barra inferior compacta para sesión Docente en móvil
- **GIVEN** una pantalla con resolución móvil de 360x640 px y sesión activa de rol `Docente`
- **WHEN** se renderiza una ruta autenticada del portal docente
- **THEN** el sistema oculta la barra lateral de escritorio y muestra la navegación inferior docente con accesos compactos sin desbordamiento horizontal

### Requirement: Contratos OpenAPI para tablero de inicio, bandeja y secciones docentes (RC03, AC06)
La API del portal SHALL exponer bajo `/api/v1` los endpoints contractuales de `seguimiento` para docentes (`inicio`, `bandeja/{mensaje_id}/leer`, `bandeja/leer-todo`, `bandeja/{mensaje_id}/responder` y `cursos`) junto con los campos opcionales de perfil docente en `identidad`, con sus esquemas tipados en OpenAPI para generar el cliente del frontend.

#### Scenario: Esquema OpenAPI incluye endpoints contractuales docentes bajo seguimiento
- **GIVEN** la API expone su esquema OpenAPI vigente
- **WHEN** se inspeccionan las rutas registradas bajo `/api/v1/seguimiento/docentes/{docente_id}/`
- **THEN** el contrato expone los endpoints `inicio`, `bandeja/{mensaje_id}/leer`, `bandeja/leer-todo`, `bandeja/{mensaje_id}/responder` y `cursos` con validación de entrada y respuestas Problem Details ante errores

### Requirement: Contratos OpenAPI y rutas docentes activas para evaluación continua y detalle de sección (RC03, AC06, AC07)
La API del portal SHALL exponer bajo `/api/v1` los endpoints contractuales de `evaluacion` para docentes (`clases`, `sesiones`, `sesiones/{sesion_id}/notas`, `actividades`, `actividades/{actividad_id}/publicar`, `cierre/confirmar`, `observaciones`) y de `seguimiento` (`secciones/{seccion_id}`, `secciones/{seccion_id}/anuncios`), y la aplicación web SHALL activar las rutas operativas `/cursos/:asignaturaId` y `/nota-del-dia` para el rol `Docente`.

#### Scenario: Esquema OpenAPI incluye endpoints docentes de evaluación y detalle de sección
- **GIVEN** la API expone su esquema OpenAPI vigente
- **WHEN** se inspeccionan las rutas registradas bajo `/api/v1/evaluacion/docentes/{docente_id}/` y `/api/v1/seguimiento/docentes/{docente_id}/secciones/`
- **THEN** todas las rutas de sesiones, criterios, actividades, cierre, observaciones, detalle de sección y anuncios están declaradas con validación de entrada y respuestas Problem Details

#### Scenario: Navegación del docente hacia Nota del día y detalle de sección
- **GIVEN** un docente autenticado navega desde el menú lateral o móvil hacia `Nota del día` o selecciona una sección en `Mis cursos`
- **WHEN** la aplicación resuelve las rutas `/nota-del-dia` y `/cursos/:asignaturaId`
- **THEN** renderiza la ficha interactiva de captura rápida de criterios o el detalle completo con sus seis pestañas operativas sin pantallas en construcción

### Requirement: Rutas docentes finales para Mensajes y Exportar SIAGIE y contratos OpenAPI (RC03, AC06)
La API del portal SHALL exponer bajo `/api/v1` los endpoints contractuales docentes `/evaluacion/docentes/{docente_id}/mensajes` (`GET`, `POST`), `/reportes/docentes/{docente_id}/siagie` (`GET`) y `/reportes/docentes/{docente_id}/siagie/{seccion_id}/descarga` (`POST`), y la aplicación web SHALL activar las rutas operativas `/mensajes` y `/siagie` para el rol `Docente` sin vistas en construcción.

#### Scenario: Esquema OpenAPI declara contratos docentes de mensajería y SIAGIE
- **GIVEN** la API expone su esquema OpenAPI vigente
- **WHEN** se consultan las rutas bajo `/api/v1/evaluacion/docentes/` y `/api/v1/reportes/docentes/`
- **THEN** todas las operaciones de mensajería saliente y descargas SIAGIE/actas están declaradas con validación de entrada y respuestas Problem Details

#### Scenario: Navegación del docente por Mensajes y Exportar SIAGIE completos
- **GIVEN** un docente autenticado navega hacia `/mensajes` o `/siagie` desde el menú lateral o móvil
- **WHEN** se renderiza la vista correspondiente
- **THEN** la aplicación muestra el redactor con historial de enviados o el panel trimestral de descargas SIAGIE sin marcadores temporales de pantalla en preparación
