# Requisitos funcionales

Capacidades que debe ofrecer el sistema y su trazabilidad con las historias de usuario. El centro del MVP es el seguimiento continuo del estudiante y la reducción de la carga docente. Los IDs son estables: lo que sale del MVP se marca como *Pospuesto* y conserva su texto.

| ID | Requisito funcional | Prioridad (MoSCoW) |
| :--- | :--- | :--- |
| **RF01** | El sistema deberá implementar una vista familiar multi-hijo centralizada, permitiendo que un apoderado siga de forma continua a sus hijos, y solo a ellos, bajo un único perfil y credencial de acceso. El estudiante dispone de la misma vista sobre sí mismo. El vínculo apoderado–estudiante lo registran quienes administran usuarios (RF14). | Debe |
| **RF02** | El sistema deberá mantener el legajo y expediente digital por estudiante, incluyendo vinculación de documentos probatorios de filiación, antecedentes escolares y resolución de matrícula. | Pospuesto |
| **RF03** | El sistema debe permitir al Administrador la configuración integral del catálogo escolar: niveles educativos (primaria y secundaria), grados, secciones, catálogo oficial de asignaturas curriculares y las competencias de cada asignatura, además de las competencias transversales, que no pertenecen a un área. | Debe |
| **RF04** | El sistema debe permitir la asignación de docentes titulares y suplentes a cursos y secciones, de un tutor por sección y de auxiliares a secciones, garantizando que el estudiante y el apoderado conozcan la plana docente responsable. | Debe |
| **RF05** | El sistema deberá permitir al Administrador organizar cada año lectivo en tres trimestres y gestionar el estado de cada uno (Aperturado, En Evaluación, Cierre Preliminar, Cerrado). Los trabajos y calificativos se registran con el trimestre En Evaluación; en Cierre Preliminar solo se ajustan niveles y conclusiones. | Debe |
| **RF06** | El sistema debe proveer una cuadrícula interactiva para el personal docente, optimizada para captura masiva por lista de alumnos y por competencias, usable desde el celular. | Debe |
| **RF07** | El sistema debe sugerir el nivel de logro del trimestre con el último calificativo publicado de cada competencia, para que el docente lo confirme o lo cambie. La escala es AD, A, B y C, sin promedios. La situación final usa el último nivel de logro registrado de cada competencia (RVM 094-2020, modificada por RVM 048-2024). | Debe |
| **RF08** | El sistema debe validar los datos antes de confirmar y prevenir calificaciones fuera de la escala y modificaciones extemporáneas. Por trimestre solo se exigen las competencias desarrolladas; al cierre anual todas deben tener nivel. Los calificativos publicados quedan visibles para el estudiante y su apoderado. | Debe |
| **RF09** | El sistema debe disponer de un formulario público/semipúblico de preinscripción y admisión escolar disponible en línea las 24 horas, con captura estructurada de datos del menor, apoderado e institución de procedencia. | Pospuesto |
| **RF10** | El sistema debe generar de forma inmediata un código de expediente único y no adivinable (ticket de seguimiento) para cada solicitud de matrícula o traslado. El apoderado lo usa para consultar el estado de su trámite; la consulta pública muestra solo el estado, sin datos personales del menor. | Pospuesto |
| **RF11** | El sistema debe proveer un módulo para el registro de solicitudes formales de traslado (ingreso y salida institucional) con especificación de motivos justificados y colegio de origen/destino. | Pospuesto |
| **RF12** | El sistema debe ofrecer un repositorio seguro para la subida de documentos probatorios digitalizados (DNI del menor y apoderado, partida de nacimiento, certificados de estudio, ficha única de matrícula) en formatos PDF o imagen legible, con validación de tipo MIME y tamaño máximo de 5 MB por archivo. | Pospuesto |
| **RF13** | El sistema debe proveer una bandeja de revisión centralizada para el personal de Secretaría Académica, con capacidad de dictaminar expedientes mediante estados: 'Pendiente de Revisión', 'Observado', 'Aprobado' y 'Rechazado' (obligando a registrar comentario técnico en caso de 'Observado'). Al aprobar un expediente, el sistema genera la pre-matrícula del estudiante. | Pospuesto |
| **RF14** | El sistema debe implementar autenticación y control de acceso basado en 7 roles (RBAC). Secretaría, Dirección y el Administrador agregan y editan usuarios; Secretaría no crea ni asciende cuentas de Administrador o Dirección. La cuenta se activa con un código de un solo uso, de modo que nadie conoce la contraseña de otra persona. El usuario es el documento de identidad y, como muchos apoderados no usan correo, solo el Administrador restablece contraseñas. | Debe |
| **RF15** | El sistema debe generar la libreta de cada trimestre en PDF, basada en el Informe de progreso: nivel de logro y conclusión por competencia, resumen de asistencia y, al cierre del año, la situación final. | Debe |
| **RF16** | El sistema debe generar automáticamente, a partir de los niveles confirmados, el Excel para cargar en el SIAGIE, con el formato de la plantilla que este genera, además de actas preliminares por sección en Excel (.xlsx) y PDF. El docente descarga sus cursos; Secretaría y Dirección, la sección completa. El Acta Oficial se emite desde el SIAGIE. | Debe |
| **RF17** | El sistema debe emitir reportes de control administrativo: relación de solicitudes por estado de expediente, estadísticas de vacantes ocupadas/disponibles y listado de alumnos no evaluados. | Pospuesto |
| **RF18** | El sistema debe registrar en una bitácora de auditoría los eventos críticos (fecha, hora, usuario, IP, entidad afectada y valores anterior y nuevo): cambios de calificativos publicados, niveles y conclusiones, cambios de estado, publicación de libretas, reaperturas y cambios en cuentas, y permitir su consulta a Dirección y al Administrador. | Debe |
| **RF19** | El sistema debe permitir al auxiliar registrar una vez al día la asistencia de las secciones asignadas (presente, falta, tardanza, falta justificada y tardanza justificada). | Debe |
| **RF20** | El sistema debe permitir al estudiante y al apoderado consultar la asistencia registrada, dentro de la vista familiar multi-hijo. | Debe |
| **RF21** | El sistema debe permitir a Secretaría Académica cargar la nómina de estudiantes obtenida del SIAGIE, con su código de estudiante, y asignar cada estudiante a una sección por año lectivo, registrando si está activo, retirado o trasladado. El proceso de matrícula se realiza fuera del portal. | Debe |
| **RF22** | El sistema debe permitir al docente registrar la conclusión descriptiva por competencia y trimestre, con recomendaciones personalizadas. Es obligatoria con nivel B o C en primaria y con nivel C en secundaria; si el nivel C se repite en dos trimestres consecutivos, debe explicar por qué no hay avance. | Debe |
| **RF23** | El sistema debe permitir al docente registrar actividades (título, fecha, fecha de entrega y competencias) y el resultado de cada estudiante (estado de entrega, calificativo y comentario), en borrador o publicado. Solo lo publicado es visible. No se suben archivos de trabajos al portal. | Debe |
| **RF24** | El sistema debe permitir al docente registrar observaciones sobre un estudiante, con fecha y tipo, visibles para el estudiante y su apoderado al publicarse. | Debe |
| **RF25** | El sistema debe permitir al docente enviar mensajes de tareas y recordatorios de pendientes a una sección o a un estudiante y su apoderado. La comunicación va en un solo sentido; no incluye chat. | Debe |
| **RF26** | El sistema debe mostrar al apoderado y al estudiante las novedades desde su última visita: calificativos, observaciones, mensajes, asistencia y libretas publicadas. Los pendientes se derivan de las actividades sin entregar. | Debe |
| **RF27** | El sistema debe permitir al Administrador y a Dirección publicar la libreta de un trimestre para que sea visible para estudiantes y apoderados. | Debe |
| **RF28** | El sistema debe calcular al cierre del año la situación final de cada estudiante (PRO, PER o RR) según las condiciones vigentes por nivel y grado, excluyendo las competencias transversales y permitiendo una decisión manual con sustento en los casos especiales. | Debería |
| **RF29** | El sistema debe mostrar el aviso de privacidad, aplicar plazos de conservación y registrar por al menos dos años los inicios y cierres de sesión y las visualizaciones, importaciones y exportaciones de datos personales (D. S. N.º 016-2024-JUS, art. 46). | Debe |
| **RF30** | El sistema debe permitir al Administrador y a Dirección reabrir un trimestre Cerrado para corregir niveles y conclusiones, con motivo obligatorio y una nueva versión de la libreta. Si el Acta Oficial ya se emitió, debe registrarse el documento de autorización de la UGEL. | Debe |
| **RF31** | El sistema debe permitir a Dirección, Secretaría y tutores consultar por sección el avance, la asistencia y los pendientes, dentro del alcance de cada rol. | Debería |

**Prioridad (MoSCoW):** *Debe* = imprescindible para el MVP; *Debería* = importante, se pospone solo si el plazo aprieta; *Podría* = deseable si sobra tiempo; *Pospuesto* = fuera del MVP, pendiente para versiones siguientes.

**Fuentes de las reglas de evaluación:** RVM 094-2020-MINEDU y su modificatoria RVM 048-2024-MINEDU. Las condiciones de RF22 y RF28 deben revisarse cada año frente a la norma vigente.

## Relación entre historias de usuario y requisitos funcionales

| Historia de usuario | Requisitos funcionales relacionados |
| :--- | :--- |
| **HU01 Vista familiar multi-hijo** | RF01 |
| **HU02 Ingreso masivo de notas** | RF06, RF07, RF08, RF18 |
| **HU03 Preinscripción y traslados** (pospuesta) | RF09, RF10, RF11 |
| **HU04 Carga de probatorios** (pospuesta) | RF02, RF12 |
| **HU05 Bandeja de dictamen y secretaría** (pospuesta) | RF02, RF13, RF17 |
| **HU06 Consulta de notas y libreta PDF** | RF01, RF08, RF15, RF27, RF30 |
| **HU07 Excel SIAGIE y actas** | RF16, RF28 |
| **HU08 Configuración del catálogo y cuentas** | RF03, RF04, RF14, RF29 |
| **HU09 Estados de los trimestres** | RF05, RF18 |
| **HU10 Notas y observaciones del estudiante** | RF08, RF22, RF24, RF26 |
| **HU11 Registro de asistencia diaria** | RF19 |
| **HU12 Consulta de asistencia** | RF01, RF20 |
| **HU13 Carga de nómina** | RF21 |
| **HU14 Registro continuo del docente** | RF06, RF07, RF23 |
| **HU15 Mensajes y recordatorios** | RF25 |
| **HU16 Novedades** | RF26 |
| **HU17 Avance por sección** | RF31 |
