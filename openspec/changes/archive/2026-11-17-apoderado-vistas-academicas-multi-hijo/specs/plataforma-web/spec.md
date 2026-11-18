# Delta Specification · plataforma-web

## ADDED Requirements

### Requirement: Rutas académicas multi-hijo de Apoderado y parámetro de pertenencia en contratos OpenAPI (AC04, AC06, RC03, DA05)

El enrutador del portal web MUST reemplazar las vistas puente temporales de `Apoderado` en `/cursos`, `/cursos/:asignaturaId`, `/calificaciones`, `/trabajos`, `/mensajes` y `/libreta` por las vistas académicas reales enlazadas al menor seleccionado (`hijoActivoId`), conservando únicamente `/asistencia` como puente hacia el Bloque 3 y manteniendo los contratos OpenAPI/Orval con parámetro opcional `apoderado_id` para validar pertenencia `DA05` sin romper las rutas del rol `Estudiante`.

#### Scenario: Navegación completa de Apoderado por vistas académicas reales y cambio de menor en vivo
- **GIVEN** un apoderado autenticado en `/inicio` con `est-demo-1` y `est-demo-2` vinculados
- **WHEN** navega por `/cursos`, `/cursos/:asignaturaId`, `/calificaciones`, `/trabajos`, `/mensajes` y `/libreta` y cambia de menor desde `Cambiar de menor`
- **THEN** cada ruta renderiza su vista académica real con los datos del menor activo sin mostrar pantallas de módulo en preparación (salvo `/asistencia`), refresca la vista activa ante el cambio de menor y mantiene la protección frente al rol `Estudiante` y `Docente`
