# identidad Delta Specification

## ADDED Requirements

### Requirement: Ingreso y perfil de sesión del Administrador mediante DNI (RF14, AC04)
El sistema SHALL autenticar la sesión del `Administrador` por DNI de 8 dígitos y contraseña, exponiendo en su perfil de sesión el rol `Administrador`, la institución educativa y el alcance (`Primaria y Secundaria`), sin alterar los perfiles ni los flujos vigentes de `Estudiante`, `Docente` ni `Apoderado`.

#### Scenario: Autenticación exitosa de Administrador con DNI y contraseña válidos
- **GIVEN** un usuario con cuenta activa de rol `Administrador` se encuentra en `/ingresar`
- **WHEN** ingresa su DNI de 8 dígitos válido y su contraseña y confirma el ingreso
- **THEN** el servicio de identidad responde con el perfil `Administrador` incluyendo institución y alcance, y el portal redirige al tablero de inicio administrativo

#### Scenario: Protección de rutas administrativas ante rol distinto o ausencia de sesión (AC04)
- **GIVEN** un usuario sin sesión activa o autenticado con un rol distinto a `Administrador`
- **WHEN** intenta acceder a rutas exclusivas de administración (como `/trimestres`)
- **THEN** el sistema bloquea el acceso y redirige a `/ingresar` o al inicio de su rol correspondiente

### Requirement: Configuración personal y avisos del Administrador en solo lectura (RF14, RC07, RC08)
La vista de configuración del `Administrador` SHALL mostrar su avatar de iniciales sin subida de fotografías (`RC08`), sus datos institucionales en solo lectura, sus preferencias locales de tema y avisos administrativos, y el formulario de cambio de contraseña propia.

#### Scenario: Visualización de perfil administrativo en configuración sin subida de imagen (RC07, RC08)
- **GIVEN** un Administrador autenticado abre `/configuracion`
- **WHEN** se renderiza su ficha de perfil
- **THEN** visualiza su avatar de iniciales, nombres, apellidos, DNI, rol, institución y alcance en solo lectura, los cuatro interruptores de avisos administrativos y ningún control para cargar fotografías
