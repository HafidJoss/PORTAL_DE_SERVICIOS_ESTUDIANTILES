# Spec Delta: identidad

## ADDED Requirements

### Requirement: Ingreso y vínculo multi-hijo del apoderado mediante DNI (RF01, RF14, AC04, DA05)
El sistema SHALL autenticar la sesión del apoderado por DNI de 8 dígitos y contraseña, exponiendo `apoderado_id` y la lista de `hijos_vinculados` (relación N:M) para consultar únicamente a sus menores asignados sin alterar los flujos de `Estudiante` ni `Docente`.

#### Scenario: Autenticación exitosa de apoderado con múltiples hijos vinculados
- **GIVEN** un apoderado con dos menores vinculados accede a `/ingresar`
- **WHEN** ingresa su DNI de 8 dígitos válido y su contraseña y confirma el envío
- **THEN** el servicio de identidad devuelve el perfil `Apoderado` con `apoderado_id` y sus dos menores en `hijos_vinculados`, redirigiendo al inicio del portal familiar

#### Scenario: Protección de rutas de apoderado sin sesión o con rol distinto
- **GIVEN** una sesión perteneciente a un rol distinto a `Apoderado` o sin menores vinculados
- **WHEN** intenta consultar o renderizar recursos exclusivos del tablero de apoderado
- **THEN** el sistema bloquea la visualización del flujo familiar y muestra un aviso o redirige al inicio de su rol correspondiente

### Requirement: Configuración personal y lista de menores del apoderado en solo lectura (RF14, RC07, RC08)
La vista de configuración del apoderado SHALL mostrar su avatar de iniciales sin subida de fotografías (`RC08`), sus datos personales y la lista de menores vinculados en solo lectura, además de preferencias locales de tema y avisos y cambio de contraseña propia.

#### Scenario: Visualización de perfil familiar en configuración sin subida de imagen (RC07, RC08)
- **GIVEN** un apoderado autenticado abre `/configuracion`
- **WHEN** se renderiza su ficha de perfil
- **THEN** visualiza su avatar de iniciales, sus datos personales y sus hijos vinculados con grado/sección y tutor en solo lectura sin controles para cargar fotos
