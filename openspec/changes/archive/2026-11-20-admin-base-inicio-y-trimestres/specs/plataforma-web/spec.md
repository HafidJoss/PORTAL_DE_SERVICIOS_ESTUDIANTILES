# plataforma-web Delta Specification

## ADDED Requirements

### Requirement: Navegación institucional responsiva y contratos OpenAPI del bloque base del Administrador (RC01, RC03, AC06, AC07)
El shell responsivo del portal SHALL adaptar su navegación en escritorio y móvil (`360x640 px`) para sesiones con rol `Administrador` (con vistas puente para los Bloques 2 y 3), y la API SHALL declarar en OpenAPI los contratos tipados bajo `/api/v1/institucion/` para generar el cliente Orval.

#### Scenario: Menú lateral e inferior para sesión Administrador sin desbordamiento (AC07)
- **GIVEN** un usuario autenticado con rol `Administrador` navega en escritorio (`>= 1024 px`) o móvil (`360x640 px`)
- **WHEN** se renderiza el marco principal del portal
- **THEN** muestra el subtítulo `Portal de Administración`, los accesos administrativos correspondientes y el avatar de iniciales sin desbordamiento horizontal y sin afectar la navegación de `Estudiante`, `Docente` ni `Apoderado`

#### Scenario: Esquema OpenAPI declara contratos administrativos bajo institucion (RC03, AC06)
- **GIVEN** la API expone su esquema OpenAPI vigente
- **WHEN** se inspeccionan las rutas registradas bajo `/api/v1/institucion/`
- **THEN** están declarados `GET /api/v1/institucion/tablero-admin`, `PATCH /api/v1/institucion/solicitudes/{solicitud_id}/atender`, `GET /api/v1/institucion/trimestres`, `POST /api/v1/institucion/trimestres/{trimestre_id}/transicion` y `POST /api/v1/institucion/trimestres/{trimestre_id}/publicar-libreta` con validación de entrada y respuestas Problem Details
