# Spec Delta: seguimiento

## ADDED Requirements

### Requirement: Detalle de sección docente y sus seis pestañas operativas (RF04, RF23, RF26, ADR-008)
Al seleccionar una sección desde `Mis cursos` o desde el tablero inicial, el portal SHALL mostrar al docente el detalle de la sección con barra de retorno, cabecera informativa (`asignatura`, `sección`, `horario`, `aula`, `tutor`, totales de estudiantes, clases registradas y competencias confirmadas) y seis pestañas navegables: `Novedades`, `Clases`, `Registro auxiliar`, `Actividades`, `Cierre` y `Estudiantes`.

#### Scenario: Navegación integral entre las seis pestañas de la sección docente
- **GIVEN** un docente autenticado accede al detalle de una sección asignada (por ejemplo `3.° B`)
- **WHEN** alterna sucesivamente entre las pestañas `Novedades`, `Clases`, `Registro auxiliar`, `Actividades`, `Cierre` y `Estudiantes`
- **THEN** `Novedades` muestra el resumen lateral de notas pendientes, la distribución de niveles (`AD`, `A`, `B`, `C`) y el flujo cronológico; mientras las pestañas restantes muestran respectivamente la lista/ficha de clases, el registro auxiliar, las actividades, el panel de cierre y la nómina de estudiantes

#### Scenario: Acceso directo a una pestaña específica o manejo de sección inexistente
- **GIVEN** un docente utiliza un acceso directo de la tarjeta de sección hacia `Cierre` o navega hacia un identificador de sección inexistente
- **WHEN** se carga el detalle de la sección
- **THEN** si la sección existe abre directamente la pestaña solicitada, y si no existe informa el error con acción para volver a `Mis cursos`

### Requirement: Publicación de anuncios unidireccionales en el flujo de novedades de la sección (RF25, RC08)
El portal SHALL permitir al docente redactar y publicar anuncios en la pestaña `Novedades` de su sección eligiendo la categoría (`Aviso`, `Recordatorio` o `Tarea`), incorporándolos inmediatamente en el flujo cronológico sin habilitar chat ni respuestas libres en el muro (`RC08`).

#### Scenario: Publicación exitosa y validación de anuncio vacío en Novedades
- **GIVEN** un docente abre el publicador de anuncios dentro de `Novedades` de una sección
- **WHEN** intenta publicar con menos de 3 caracteres, y luego redacta un aviso válido y acciona `Publicar`
- **THEN** el sistema bloquea el envío vacío y, al publicar un texto válido, lo agrega al inicio del flujo cronológico de la sección indicando que es comunicación en un solo sentido
