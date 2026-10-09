# Requisitos funcionales

Capacidades que debe ofrecer el sistema y su trazabilidad con las historias de usuario.

| ID | Requisito funcional |
| :--- | :--- |
| **RF01** | El sistema deberá implementar una vista familiar multi-hijo centralizada, permitiendo que un padre o apoderado gestione y consulte la situación académica de múltiples estudiantes registrados bajo un único perfil y credencial de acceso. |
| **RF02** | El sistema deberá mantener el legajo y expediente digital por estudiante, incluyendo vinculación de documentos probatorios de filiación, antecedentes escolares y resolución de matrícula. |
| **RF03** | El sistema debe permitir la configuración integral del catálogo escolar: niveles educativos, grados, secciones y catálogo oficial de asignaturas curriculares. |
| **RF04** | El sistema debe permitir el mapeo y asignación directa de docentes titulares y suplentes a cursos y secciones específicas, garantizando que el estudiante y apoderado conozcan la plana docente responsable. |
| **RF05** | El sistema deberá permitir a Secretaría Académica gestionar el estado de los periodos lectivos (Aperturado, En Evaluación, Cierre Preliminar, Consolidado) para restringir temporalmente la edición de notas. |
| **RF06** | El sistema debe proveer una cuadrícula interactiva de ingreso de notas para personal docente, optimizada para captura masiva de calificativos por lista de alumnos y por competencias pedagógicas. |
| **RF07** | El sistema debe ejecutar el cálculo automatizado de promedios ponderados y consolidados según la escala oficial de calificación del Ministerio de Educación (CNEB: AD, A, B, C y vigesimal según corresponda). |
| **RF08** | El sistema debe contar con un mecanismo de validación y confirmación previa de notas que prevenga campos vacíos, calificaciones fuera de rango o modificaciones extemporáneas tras el cierre oficial de actas. Las calificaciones confirmadas por el docente quedan visibles para el estudiante y su apoderado. |
| **RF09** | El sistema debe disponer de un formulario público/semipúblico de preinscripción y admisión escolar disponible en línea las 24 horas, con captura estructurada de datos del menor, apoderado e institución de procedencia. |
| **RF10** | El sistema debe generar de forma inmediata un código de expediente único y no adivinable (ticket de seguimiento) para cada solicitud de matrícula o traslado. El apoderado lo usa para consultar el estado de su trámite; la consulta pública muestra solo el estado, sin datos personales del menor. |
| **RF11** | El sistema debe proveer un módulo para el registro de solicitudes formales de traslado (ingreso y salida institucional) con especificación de motivos justificados y colegio de origen/destino. |
| **RF12** | El sistema debe ofrecer un repositorio seguro para la subida de documentos probatorios digitalizados (DNI del menor y apoderado, partida de nacimiento, certificados de estudio, ficha única de matrícula) en formatos PDF o imagen legible, con validación de tipo MIME y tamaño máximo de 5 MB por archivo. |
| **RF13** | El sistema debe proveer una bandeja de revisión centralizada para el personal de Secretaría Académica, con capacidad de dictaminar expedientes mediante estados: 'Pendiente de Revisión', 'Observado', 'Aprobado' y 'Rechazado' (obligando a registrar comentario técnico en caso de 'Observado'). Al aprobar un expediente, el sistema genera la pre-matrícula del estudiante. |
| **RF14** | El sistema debe implementar autenticación y control de acceso basado en roles estrictos (RBAC), incluyendo la administración de usuarios y credenciales por parte del Administrador. |
| **RF15** | El sistema debe permitir la generación y exportación de libretas de calificaciones informativas en formato PDF estandarizado para estudiantes y apoderados. |
| **RF16** | El sistema debe permitir la generación de actas preliminares de evaluación y cuadros de mérito consolidados por sección exportables a formato Excel (.xlsx) y PDF, facilitando la compatibilidad reglamentaria con SIAGIE. |
| **RF17** | El sistema debe emitir reportes de control administrativo: relación de solicitudes por estado de expediente, estadísticas de vacantes ocupadas/disponibles y listado de alumnos no evaluados. |
| **RF18** | El sistema debe registrar en una bitácora de auditoría los eventos críticos (fecha, hora, usuario e IP de las modificaciones de notas y de los cambios de estado en trámites) y permitir su consulta al Administrador. |

## Relación entre historias de usuario y requisitos funcionales

| Historia de usuario | Requisitos funcionales relacionados |
| :--- | :--- |
| **HU01 Vista familiar multi-hijo** | RF01 |
| **HU02 Ingreso masivo de notas** | RF06, RF07, RF08, RF18 |
| **HU03 Preinscripción y traslados** | RF09, RF10, RF11 |
| **HU04 Carga de probatorios** | RF02, RF12 |
| **HU05 Bandeja de dictamen y secretaría** | RF02, RF13, RF17, RF18 |
| **HU06 Consulta de notas y libreta PDF** | RF01, RF07, RF15 |
| **HU07 Reportes y exportación SIAGIE** | RF16, RF17 |
| **HU08 Configuración del catálogo escolar** | RF03, RF04, RF14, RF18 |
| **HU09 Estados de los periodos lectivos** | RF05 |
