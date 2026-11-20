# plataforma-web Delta Specification

## ADDED Requirements

### Requirement: Activación definitiva de Cuentas y Bitácora para Administrador y cierre de vistas puente de Fase 4 (RC03, AC06, AC07)
El enrutador del portal MUST reemplazar las vistas puente temporales de `Administrador` en `/cuentas` y `/bitacora` por las vistas operativas reales de `Cuentas y roles` y `Bitácora de auditoría`, retirando todas las pantallas en preparación de la Fase 4 y exponiendo en OpenAPI/Orval los contratos de `personas` y `auditoria`.

#### Scenario: Navegación completa del Portal de Administración sin vistas puente (AC07)
- **GIVEN** un Administrador autenticado navega por `/inicio`, `/trimestres`, `/catalogo`, `/cuentas`, `/bitacora` y `/configuracion`
- **WHEN** recorre cada ruta desde el menú lateral o móvil
- **THEN** todas las rutas renderizan sus vistas operativas reales sin ningún marcador de módulo en preparación y manteniendo el aislamiento respecto de `Estudiante`, `Docente` y `Apoderado`

#### Scenario: Esquema OpenAPI declara contratos de personas y auditoria (RC03, AC06)
- **GIVEN** la API expone su esquema OpenAPI vigente
- **WHEN** se inspeccionan las rutas registradas bajo `/api/v1/personas/` y `/api/v1/auditoria/`
- **THEN** están declaradas todas las operaciones de cuentas (`GET`, `POST`, `PATCH`, `restablecer-codigo`, `estado`) y de auditoría (`eventos`, `eventos/exportar`) con validación de entrada y respuestas Problem Details
