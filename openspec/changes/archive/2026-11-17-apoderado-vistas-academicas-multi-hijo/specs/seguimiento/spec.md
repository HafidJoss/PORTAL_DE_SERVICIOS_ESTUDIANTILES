# Delta Specification · seguimiento

## ADDED Requirements

### Requirement: Consulta multi-hijo de cursos y detalle de curso para el apoderado (RF04, HU12, DA05, RC08)

El portal MUST permitir al apoderado autenticado consultar la grilla de asignaturas (`Cursos`) y el detalle completo de cada curso (`Novedades`, `Trabajos`, `Calificaciones` y `Personas`, sin subida de archivos conforme a `RC08`) del menor vinculado seleccionado (`hijoActivo`), diferenciando los datos por grado y nivel cuando cambia de menor desde el selector del marco y bloqueando con `403 Problem Details` (`DA05`) cualquier consulta con un `estudiante_id` no vinculado al apoderado.

#### Scenario: Consulta de cursos y detalle por menor vinculado en Apoderado
- **GIVEN** un apoderado autenticado con al menos dos menores vinculados en grados distintos (`est-demo-1` y `est-demo-2`)
- **WHEN** accede a `/cursos`, ingresa al detalle de un curso del menor activo y luego cambia de menor en `Cambiar de menor`
- **THEN** la grilla de cursos y las cuatro pestañas del detalle muestran exclusivamente las asignaturas, docentes, niveles `AD/A/B/C` y actividades del menor activo (`RC08`, sin campos `<input type="file">`) y se actualizan automáticamente al seleccionar otro menor vinculado

#### Scenario: Rechazo de pertenencia ante menor no vinculado en cursos (DA05)
- **GIVEN** una solicitud académica de cursos o detalle de curso asociada a un identificador `apoderado_id` válido y a un `estudiante_id` que no pertenece a ese apoderado
- **WHEN** el servidor procesa la consulta con ese contexto de apoderado
- **THEN** responde con estado `403` en formato Problem Details (`RFC 9457`) sin exponer información del estudiante ajeno
