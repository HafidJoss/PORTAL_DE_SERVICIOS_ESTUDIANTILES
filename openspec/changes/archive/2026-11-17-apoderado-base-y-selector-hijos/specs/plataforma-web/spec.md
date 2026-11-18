# Spec Delta: plataforma-web

## ADDED Requirements

### Requirement: Selector global de hijo y enrutamiento inicial de Apoderado (RC01, RC03, AC06, AC07)
La aplicación web SHALL mostrar al rol `Apoderado` un selector de menor activo (`Cambiar de menor`) dentro del marco responsivo del portal en escritorio y móvil, habilitar `/inicio` y `/configuracion` con rutas puente temporales para las vistas académicas de los bloques siguientes, y declarar los contratos familiares en OpenAPI bajo `/api/v1`.

#### Scenario: Cambio de menor desde la cabecera en escritorio y móvil sin desbordamiento (AC07)
- **GIVEN** un apoderado autenticado con al menos dos hijos vinculados navega en el portal
- **WHEN** abre `Cambiar de menor` en escritorio o móvil (`360x640 px`) y selecciona a otro hijo vinculado
- **THEN** el marco actualiza el menor activo mostrado y resuelve sin desbordamiento horizontal ni pérdida de sesión

#### Scenario: Esquema OpenAPI declara endpoints familiares bajo seguimiento e identidad
- **GIVEN** la API expone su esquema OpenAPI vigente
- **WHEN** se consultan `UsuarioSesionOut` y las rutas bajo `/api/v1/seguimiento/apoderados/{apoderado_id}/`
- **THEN** están declarados `apoderado_id`, `hijos_vinculados`, la consulta por hijo `inicio` con control de pertenencia y `comunicados/{comunicado_id}/confirmar-lectura`
