# Delta Specification · plataforma-web

## ADDED Requirements

### Requirement: Activación definitiva de Asistencia para Apoderado y cierre de puentes de Fase 3 (AC04, AC06, AC07, RC03)

El enrutador principal del portal MUST habilitar la vista real de `/asistencia` para el rol `Apoderado` enlazada al menor activo (`hijoActivoId`), retirando las vistas puente temporales de la Fase 3 y actualizando el contrato OpenAPI/Orval con el endpoint de justificaciones escritas (`39` rutas totales).

#### Scenario: Navegación completa en Portal de Familias sin vistas puente
- **GIVEN** un apoderado autenticado con dos menores vinculados navegando desde `/inicio` o la barra lateral/móvil hacia `/asistencia`
- **WHEN** consulta y cambia entre sus menores vinculados en `/asistencia`
- **THEN** visualiza la asistencia real del menor seleccionado sin ninguna pantalla de módulo en preparación (`Módulo en preparación`) y manteniendo el aislamiento de navegación respecto de `Estudiante` y `Docente`
