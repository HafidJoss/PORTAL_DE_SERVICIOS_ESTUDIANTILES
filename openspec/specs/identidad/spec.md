# identidad Specification

## Purpose
Definir los comportamientos observables del módulo de identidad para el portal web del estudiante: ingreso por DNI, activación de cuenta con código de un solo uso y aviso de privacidad, protección de rutas, cierre de sesión, consulta de datos personales y cambio de contraseña.

## Requirements

### Requirement: Ingreso del estudiante mediante DNI y contraseña (RF14, AC04)
El sistema SHALL permitir al estudiante iniciar sesión ingresando su DNI de 8 dígitos numéricos y su contraseña, ofreciendo mostrar u ocultar la contraseña, recordar el DNI en el navegador y consultar la indicación de que solo el Administrador restablece contraseñas.

#### Scenario: Ingreso exitoso con DNI y contraseña válidos
- GIVEN el estudiante está en la pantalla de ingreso
- WHEN ingresa un DNI de 8 dígitos válido, su contraseña y confirma el envío
- THEN el sistema autentica la sesión contra el servicio de identidad y redirige a la vista de inicio del portal

#### Scenario: Rechazo en el formulario por DNI con formato inválido o contraseña vacía
- GIVEN el estudiante está en la pantalla de ingreso
- WHEN ingresa un DNI con menos de 8 dígitos o deja la contraseña vacía e intenta ingresar
- THEN el sistema muestra un mensaje de validación claro y no envía la petición de inicio de sesión

#### Scenario: Rechazo por credenciales incorrectas o cuenta bloqueada desde la API
- GIVEN el estudiante envía credenciales de ingreso
- WHEN el servicio de identidad responde con un error Problem Details (como `401` o `429`)
- THEN el sistema muestra el detalle del error en la pantalla de ingreso sin autenticar la sesión

#### Scenario: Consulta de ayuda para contraseña olvidada (RF14)
- GIVEN el estudiante está en la pantalla de ingreso
- WHEN selecciona la opción "¿Olvidaste tu contraseña?"
- THEN el sistema muestra el aviso informativo indicando que solo el Administrador puede restablecerla y que debe acudir a Secretaría con su DNI

### Requirement: Activación de cuenta con código de un solo uso y aviso de privacidad (RF14, RF29, AC04)
El sistema SHALL permitir activar una cuenta nueva ingresando DNI, código de un solo uso, nueva contraseña de al menos 8 caracteres y su confirmación, exigiendo la aceptación expresa del Aviso de privacidad cuyo texto completo pueda leerse en pantalla antes de aceptar.

#### Scenario: Lectura del Aviso de privacidad desde el formulario de activación (RF29)
- GIVEN el estudiante se encuentra en la pestaña de activación de cuenta
- WHEN selecciona el enlace "Aviso de privacidad"
- THEN el sistema muestra un diálogo con el contenido institucional vigente sobre tratamiento de datos personales conforme a la Ley N.º 29733 y su reglamento

#### Scenario: Activación exitosa de cuenta
- GIVEN el estudiante ingresa un DNI de 8 dígitos, un código de 6 caracteres, una contraseña de al menos 8 caracteres coincidente con su confirmación y marca la aceptación del Aviso de privacidad
- WHEN envía el formulario de activación y el servicio responde positivamente
- THEN el sistema muestra la confirmación de "Cuenta activada" con la acción para volver a la pestaña de ingreso

#### Scenario: Bloqueo de activación por datos inválidos o falta de aceptación de privacidad
- GIVEN el estudiante completa el formulario de activación
- WHEN la nueva contraseña tiene menos de 8 caracteres, no coincide con la confirmación o no marca la aceptación del Aviso de privacidad
- THEN el sistema impide el envío, señala el motivo específico y mantiene al usuario en el formulario

### Requirement: Protección de rutas privadas y cierre de sesión (RF14, AC04)
El sistema MUST restringir las rutas internas del portal a usuarios con sesión activa, reflejar el nombre completo y grado/sección del usuario autenticado en la navegación y permitir cerrar sesión en cualquier momento desde escritorio o móvil.

#### Scenario: Redirección al ingreso cuando no existe sesión activa
- GIVEN un usuario no autenticado intenta acceder a una ruta interna del portal (como `/inicio` o `/configuracion`)
- WHEN la verificación de sesión indica que no está autenticado
- THEN el sistema redirige al usuario a la pantalla de ingreso sin mostrar contenido protegido

#### Scenario: Cierre de sesión desde la navegación del portal
- GIVEN el estudiante navega autenticado dentro del portal
- WHEN acciona el botón "Cerrar sesión"
- THEN el sistema invoca el cierre de sesión en el servicio de identidad, limpia la caché de sesión y redirige a la pantalla de ingreso

### Requirement: Configuración personal, preferencias locales y cambio de contraseña (RF14, RC07, RC08)
La vista de configuración del estudiante SHALL mostrar su avatar de iniciales (sin subida de fotografías) y sus datos personales en solo lectura, permitir alternar el tema claro/oscuro y sus preferencias de avisos en el navegador, y permitir actualizar su propia contraseña validando la contraseña actual y los requisitos de seguridad.

#### Scenario: Visualización de datos personales en solo lectura sin subida de foto (RC07, RC08)
- GIVEN el estudiante autenticado abre la pantalla de configuración
- WHEN se renderiza su perfil
- THEN ve su avatar con iniciales, sus datos personales (nombres, apellidos, DNI, código de estudiante, grado/sección y tutor) en modo de solo lectura con la indicación de acudir a Secretaría para correcciones, y no existe opción para subir imágenes

#### Scenario: Persistencia de preferencias de avisos en el navegador
- GIVEN el estudiante está en la pantalla de configuración
- WHEN desactiva el interruptor de avisos para "Asistencia" y vuelve a cargar la vista
- THEN la preferencia desactivada para "Asistencia" se mantiene recordada en el navegador

#### Scenario: Cambio exitoso de contraseña propia (RF14)
- GIVEN el estudiante autenticado está en configuración
- WHEN ingresa su contraseña actual, una nueva contraseña de al menos 8 caracteres y su confirmación coincidente, y guarda los cambios
- THEN el sistema envía la solicitud al servicio de identidad, limpia los campos del formulario y confirma que la contraseña fue actualizada

#### Scenario: Rechazo de cambio de contraseña por validación local o error de la API
- GIVEN el estudiante intenta cambiar su contraseña
- WHEN la nueva contraseña tiene menos de 8 caracteres, difiere de la confirmación o el servicio devuelve un error Problem Details (como contraseña actual incorrecta)
- THEN el sistema muestra el mensaje de error sin limpiar la sesión vigente

### Requirement: Ingreso y perfil de sesión del docente mediante DNI (RF14, AC04)
El sistema SHALL permitir al docente autenticar su sesión mediante su DNI de 8 dígitos numéricos y contraseña, exponiendo en la sesión su identificador docente, especialidad, nivel educativo y secciones asignadas sin afectar las credenciales ni los datos de sesión del estudiante.

#### Scenario: Ingreso exitoso de docente con DNI y contraseña válidos
- **GIVEN** un docente con cuenta activa está en la pantalla de ingreso
- **WHEN** ingresa su DNI de 8 dígitos válido y su contraseña y confirma el envío
- **THEN** el servicio de identidad responde con su perfil `Docente` (especialidad, nivel educativo y secciones a cargo) y el portal redirige a la vista de inicio correspondiente al rol docente

#### Scenario: Protección de rutas docentes sin sesión o con rol distinto
- **GIVEN** un usuario sin sesión activa o autenticado con un rol distinto a `Docente`
- **WHEN** intenta consultar o renderizar recursos exclusivos del tablero docente
- **THEN** el sistema bloquea la visualización del flujo docente y redirige al ingreso o al inicio de su rol correspondiente

### Requirement: Configuración personal y preferencias del docente en solo lectura (RF14, RC07, RC08)
La vista de configuración del docente SHALL mostrar su avatar de iniciales sin subida de fotografías (`RC08`), presentar sus datos laborales y secciones a cargo en modo de solo lectura con la indicación de acudir a Secretaría para correcciones, permitir alternar el tema claro/oscuro y sus avisos locales, y permitir el cambio de su propia contraseña.

#### Scenario: Visualización de perfil docente en configuración sin subida de imagen (RC07, RC08)
- **GIVEN** un docente autenticado abre la pantalla de configuración
- **WHEN** se renderiza su ficha de perfil
- **THEN** visualiza su avatar de iniciales, nombres, apellidos, DNI, especialidad, nivel educativo y secciones asignadas en solo lectura sin controles para cargar fotografías de perfil
