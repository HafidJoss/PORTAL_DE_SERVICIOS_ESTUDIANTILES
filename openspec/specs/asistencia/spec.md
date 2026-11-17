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
