# plataforma-web Delta Specification

## ADDED Requirements

### Requirement: Activación definitiva de Catálogo escolar para Administrador y contratos OpenAPI de institucion y matriculas (RC03, AC06, AC07)
El enrutador del portal SHALL reemplazar la vista puente temporal `/catalogo` del rol `Administrador` por la vista operativa de `Catálogo escolar` con sus tres pestañas (`Secciones`, `Asignaturas y competencias` y `Asignaciones docentes`), conservando solo `/cuentas` y `/bitacora` como puentes hacia el Bloque 3, y la API SHALL exponer en OpenAPI los contratos tipados de secciones, asignaturas, asignaciones y matrículas.

#### Scenario: Navegación administrativa hacia Catálogo escolar sin vista en preparación (AC07)
- **GIVEN** un Administrador autenticado navega a `/catalogo` desde el menú lateral o desde una solicitud de Inicio
- **WHEN** se renderiza la vista de `Catálogo escolar`
- **THEN** muestra las tres pestañas operativas (`Secciones`, `Asignaturas y competencias`, `Asignaciones docentes`) con filtros responsivos sin marcadores de módulo en preparación

#### Scenario: Esquema OpenAPI declara rutas de catálogo y matrículas bajo institucion y matriculas (RC03, AC06)
- **GIVEN** la API expone su esquema OpenAPI vigente
- **WHEN** se inspeccionan las rutas registradas bajo `/api/v1/institucion/` y `/api/v1/matriculas/`
- **THEN** están declaradas todas las operaciones de secciones, asignaturas, asignaciones docentes, pool `sin-seccion`, estudiantes por sección, asignación, movimiento y cambio de estado con respuestas Problem Details
