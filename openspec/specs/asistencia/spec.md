# asistencia Specification

## Purpose
Define el comportamiento observable de la consulta mensual de asistencia e incidencias del estudiante en el portal web, incluyendo indicadores, calendario laboral y restricciones de solo lectura para el rol estudiante.

## Requirements

### Requirement: Consulta mensual e indicadores de asistencia (RF20, HU16, AC01)
El portal MUST permitir al estudiante seleccionar el mes lectivo (septiembre, octubre o noviembre) y mostrar la sección del estudiante junto a cinco indicadores mensuales: porcentaje de asistencia, días presentes, tardanzas, faltas e incidencias justificadas.

#### Scenario: Cambio de mes en la vista de asistencia
- **GIVEN** un estudiante autenticado que abre la vista de asistencia
- **WHEN** cambia el mes seleccionado entre septiembre, octubre y noviembre
- **THEN** el portal consulta la asistencia del mes seleccionado, marca como activo el selector correspondiente y actualiza los cinco indicadores KPI, el calendario e incidencias con los datos recibidos para ese mes

#### Scenario: Error al consultar la asistencia mensual o falta de perfil de estudiante
- **GIVEN** un estudiante cuya consulta mensual devuelve error, o una sesión sin perfil de estudiante asociado
- **WHEN** accede a la vista de asistencia o cambia de mes
- **THEN** ante un fallo de servidor muestra un mensaje de error claro con opción de reintento, y sin perfil de estudiante válido bloquea o redirige fuera del flujo de asistencia del alumno

### Requirement: Calendario lunes a viernes, códigos e incidencias mensuales (RF20, HU16, RC08, AC04)
El portal MUST presentar la grilla semanal de lunes a viernes con el código diario de asistencia (`P`, `T`, `F`, `FJ`, `TJ`, `FE` o celda vacía sin registro), su leyenda explicativa y las incidencias detalladas del mes en modo solo lectura para el estudiante.

#### Scenario: Visualización de códigos diarios, leyenda e incidencias del mes
- **GIVEN** un mes con registros de presencia (`P`), tardanza (`T`), falta injustificada (`F`), falta o tardanza justificada (`FJ`, `TJ`) y feriado o evento (`FE`), además de incidencias detalladas
- **WHEN** el estudiante consulta la vista de asistencia
- **THEN** cada día muestra su número y etiqueta o código accesible, la leyenda explica todos los códigos válidos y el bloque de incidencias detalla fecha, estado y observación sin incluir controles para que el estudiante envíe justificaciones (`RC08` / exclusivo de apoderado)

#### Scenario: Mes sin incidencias ni registros
- **GIVEN** un mes seleccionado donde la lista de incidencias del estudiante está vacía
- **WHEN** visualiza la sección de incidencias del mes
- **THEN** el portal muestra un mensaje positivo o estado vacío indicando que no se registran tardanzas ni faltas en el periodo consultado

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
