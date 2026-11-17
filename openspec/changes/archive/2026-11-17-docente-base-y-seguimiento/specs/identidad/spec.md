# Spec Delta: identidad

## ADDED Requirements

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
