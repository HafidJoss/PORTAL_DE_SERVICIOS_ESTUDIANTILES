# Actores del sistema

Actores que interactúan con el sistema y lo que necesita realizar cada uno.

| Actor | ¿Qué necesita realizar? |
| :--- | :--- |
| **Estudiante** | Consultar las calificaciones periódicas confirmadas por el docente y los promedios consolidados por competencias pedagógicas, ver la plana docente asignada y descargar su libreta de notas en PDF. |
| **Apoderado (padre, madre o tutor)** | Gestionar y consultar la situación académica de múltiples hijos bajo una cuenta única (vista familiar multi-hijo), realizar solicitudes de admisión y traslado en línea, cargar requisitos probatorios y monitorear el estado de sus trámites. Incluye al **postulante**: el apoderado que inicia una solicitud y puede no tener cuenta aún; consulta el estado de su trámite con el código de seguimiento (ticket). |
| **Docente (Titular / Suplente)** | Acceder a su panel privado, registrar calificaciones masivamente mediante una cuadrícula interactiva por competencias según la escala oficial (CNEB), validar notas y confirmar el cierre del registro de los cursos que tiene asignados. El cambio de estado del periodo lectivo lo realiza Secretaría Académica. |
| **Secretaría Académica** | Aperturar y cambiar los estados de los periodos lectivos, auditar expedientes de admisión y traslados desde una bandeja centralizada, emitir dictámenes (Pendiente de Revisión, Observado con observaciones técnicas, Aprobado y Rechazado), generar pre-matrículas y emitir reportes/actas institucionales. |
| **Administrador** | Configurar el catálogo escolar (niveles educativos, grados, secciones y asignaturas curriculares), administrar usuarios y credenciales, aplicar políticas estrictas de control de acceso (RBAC) y auditar la bitácora de eventos críticos. |
| **SIAGIE (Sistema Externo MINEDU)** | Sistema externo sin integración automática en el MVP (RC06): Secretaría descarga las plantillas y sábanas de notas consolidadas en formato Excel (.xlsx), estructuradas reglamentariamente, y las transcribe o carga manualmente en SIAGIE. |
