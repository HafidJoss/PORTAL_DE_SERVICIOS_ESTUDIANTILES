# Delta Specification · asistencia

## ADDED Requirements

### Requirement: Consulta multi-hijo de asistencia mensual y envío de justificaciones escritas del apoderado (RF20, HU16, DA05, RC08)

El portal MUST permitir al apoderado consultar los indicadores KPI, el calendario L–V y las incidencias mensuales del menor vinculado seleccionado (`hijoActivo`), enviando justificaciones escritas (`>= 5` caracteres) en incidencias `T` o `F` pendientes sin subida de archivos (`RC08`), manteniendo al rol `Estudiante` en solo lectura y rechazando con `403 Problem Details` (`DA05`) cualquier menor ajeno.

#### Scenario: Consulta multi-hijo y envío de justificación escrita en Apoderado
- **GIVEN** un apoderado autenticado consultando la asistencia mensual de un menor vinculado (`est-demo-1` o `est-demo-2`) con una tardanza (`T`) o falta injustificada (`F`) pendiente
- **WHEN** activa `Justificar`, elige un motivo, redacta al menos 5 caracteres y confirma `Enviar al auxiliar`, y luego cambia al segundo menor desde `Cambiar de menor`
- **THEN** la justificación se registra sin campos `<input type="file">` (`RC08`), la incidencia pasa al estado `Justificación enviada · en revisión` y al cambiar de menor los KPIs, calendario e incidencias se recargan para el estudiante seleccionado

#### Scenario: Validación de justificación breve o intento del rol Estudiante
- **GIVEN** un apoderado que intenta enviar una justificación con menos de 5 caracteres, o un estudiante consultando `/asistencia`
- **WHEN** el apoderado envía el texto inválido o el estudiante visualiza sus incidencias `T`/`F`
- **THEN** al apoderado se le impide el envío indicando la longitud mínima sin perder el texto redactado, y al estudiante no se le muestra ningún botón ni formulario `Justificar` (`RC08`)

#### Scenario: Rechazo de pertenencia e incidencia inexistente en asistencia (DA05)
- **GIVEN** una consulta mensual con `apoderado_id` o un envío de justificación dirigido a un `estudiante_id` no vinculado al apoderado, o hacia una incidencia inexistente
- **WHEN** el backend procesa la solicitud
- **THEN** responde con estado `403 Problem Details` (`DA05`) ante estudiante ajeno o `404 Problem Details` ante incidencia desconocida
