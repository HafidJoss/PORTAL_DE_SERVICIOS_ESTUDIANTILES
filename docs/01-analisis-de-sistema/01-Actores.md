# Actores del sistema

Actores que interactúan con el sistema y lo que necesita realizar cada uno en el MVP de seguimiento continuo.

| Actor | ¿Qué necesita realizar? |
| :--- | :--- |
| **Apoderado (padre, madre o tutor legal)** | Seguir de forma continua a sus hijos, y solo a ellos, bajo una cuenta única (vista familiar multi-hijo): novedades, asistencia, trabajos, pendientes, observaciones, mensajes de los docentes, calificaciones y libreta publicada. |
| **Estudiante** | Seguir su propio avance: trabajos, pendientes, recordatorios, observaciones, calificaciones, asistencia y libreta publicada, y conocer a sus docentes y a su tutor. |
| **Docente (Titular / Suplente / Tutor)** | Registrar de forma continua trabajos y calificativos por competencia desde una cuadrícula, escribir observaciones, enviar mensajes de tareas y recordatorios, confirmar el nivel de cada trimestre con su conclusión descriptiva y descargar el Excel de sus cursos para el SIAGIE, sin volver a digitar. El tutor consulta además el avance de su sección. |
| **Auxiliar de educación** | Registrar una vez al día la asistencia de las secciones asignadas (presente, falta, tardanza y sus justificaciones). En primaria, esa asignación puede recaer en el tutor. |
| **Secretaría Académica** | Cargar la nómina del SIAGIE, asignar estudiantes a sección, agregar y editar usuarios, descargar el Excel de la sección completa y emitir actas preliminares. No crea ni asciende cuentas de Administrador o Dirección y no accede a credenciales. |
| **Dirección** | Consultar el avance por sección, agregar y editar usuarios, publicar la libreta, reabrir notas para corregirlas y consultar la bitácora. Es responsable del uso del SIAGIE y emite desde él el Acta Oficial de Evaluación. |
| **Administrador** | Configurar el catálogo escolar (niveles, grados, secciones, asignaturas y competencias), aperturar y cambiar los estados de años y trimestres, administrar cuentas y roles, restablecer contraseñas de forma exclusiva, publicar la libreta, reabrir notas y auditar la bitácora. |
| **SIAGIE (Sistema Externo MINEDU)** | Sistema externo sin integración automática (RC06): el SIAGIE genera su plantilla Excel, el portal la llena con los niveles confirmados y la institución la carga en él. También aporta la nómina que Secretaría carga en el portal. |

**Versión futura:** el **postulante**, es decir, el apoderado que inicia una solicitud sin tener cuenta, vuelve cuando se incorpore admisión (RF09 a RF13, pospuestos).
