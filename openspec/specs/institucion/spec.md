# institucion Specification

## Purpose
Definir los comportamientos observables del módulo `institucion` para la gestión operativa del Administrador en el portal: tablero de inicio con bandeja de solicitudes y avance de cierre por sección, y control del ciclo de vida de los trimestres del año lectivo (transiciones de estado, publicación de libretas y reapertura excepcional con registro en auditoría).

## Requirements

### Requirement: Tablero operativo de inicio del Administrador y atención de solicitudes (RF31, HU17, AC04, AC07)
El sistema SHALL presentar al `Administrador` un tablero de inicio con los indicadores del periodo, el trimestre vigente, el avance de cierre por sección, el resumen de cuentas y una bandeja de solicitudes filtrable donde pueda ver detalles y marcar cada solicitud como atendida.

#### Scenario: Consulta exitosa del tablero operativo con rol Administrador
- **GIVEN** un usuario autenticado con rol `Administrador` accede a la vista de inicio del portal
- **WHEN** el sistema consulta el tablero operativo institucional
- **THEN** muestra los tres indicadores en la portada, la bandeja de solicitudes filtrada inicialmente en `Por atender`, la tarjeta del trimestre vigente con sus cuatro etapas, el listado de avance de cierre por sección y el resumen numérico de cuentas (`Activas`, `Pendientes`, `Bloqueadas`)

#### Scenario: Filtrado y atención de una solicitud operativa
- **GIVEN** el Administrador visualiza solicitudes pendientes en la bandeja del tablero de inicio
- **WHEN** selecciona una solicitud para desplegar su detalle y acciona `Marcar como atendida`
- **THEN** el sistema marca la solicitud como atendida, reduce el contador de solicitudes pendientes en el tablero y la traslada al filtro `Atendidas`

#### Scenario: Rechazo de acceso al tablero administrativo para roles no autorizados (AC04)
- **GIVEN** un usuario autenticado con un rol distinto a `Administrador` (como `Docente`, `Apoderado` o `Estudiante`)
- **WHEN** intenta consultar el tablero operativo administrativo o marcar una solicitud como atendida
- **THEN** el sistema rechaza la operación con estado HTTP `403` en formato Problem Details sin exponer información institucional reservada

### Requirement: Gestión del ciclo de vida de trimestres, publicación de libreta y reapertura excepcional (RF05, RF18, RF27, RF30, HU09, AC04)
El sistema SHALL permitir al `Administrador` consultar los trimestres del año lectivo, avanzar válidamente entre sus cuatro estados (`Aperturado`, `En Evaluación`, `Cierre Preliminar`, `Cerrado`), publicar la libreta de un trimestre cerrado y reabrir un trimestre cerrado con motivo obligatorio y autorización UGEL tras el Acta Oficial, registrando cada mutación en auditoría.

#### Scenario: Avance válido de estado de un trimestre con registro de auditoría (RF05, RF18, HU09)
- **GIVEN** un trimestre se encuentra en estado `En Evaluación` y el usuario autenticado tiene rol `Administrador`
- **WHEN** confirma la transición hacia `Cierre Preliminar`
- **THEN** el sistema actualiza el estado del trimestre a `Cierre Preliminar`, muestra la confirmación correspondiente y registra un evento en la bitácora de auditoría con fecha, hora, usuario, rol, IP, tipo `Estado`, entidad del trimestre y valores antes/después (`En Evaluación` → `Cierre Preliminar`)

#### Scenario: Publicación de libreta en un trimestre cerrado con registro de auditoría (RF27, RF18)
- **GIVEN** un trimestre se encuentra en estado `Cerrado` con su libreta pendiente de publicación
- **WHEN** el Administrador confirma `Publicar libreta`
- **THEN** el sistema marca la libreta del trimestre como publicada y registra en la bitácora un evento de tipo `Libreta` con fecha, hora, usuario, IP y cambio `No publicada` → `Publicada`

#### Scenario: Reapertura excepcional con motivo obligatorio y autorización UGEL tras Acta Oficial (RF30, RF18)
- **GIVEN** un trimestre se encuentra en estado `Cerrado` y el Administrador solicita reabrirlo
- **WHEN** ingresa un motivo descriptivo de al menos 15 caracteres, indica que el Acta Oficial ya fue emitida en el SIAGIE e ingresa el número de documento de autorización de la UGEL
- **THEN** el sistema cambia el estado del trimestre a `Cierre Preliminar`, marca el trimestre como `Reabierto`, despublica la libreta previa y registra en la bitácora un evento de tipo `Reapertura` con fecha, hora, usuario, IP, motivo, referencia UGEL y transición `Cerrado` → `Cierre Preliminar`

#### Scenario: Rechazo de reapertura por motivo insuficiente o ausencia de documento UGEL (RF30)
- **GIVEN** un trimestre se encuentra en estado `Cerrado` y el Administrador abre el panel de reapertura
- **WHEN** intenta confirmar con un motivo menor a 15 caracteres, o marca que el Acta Oficial ya fue emitida sin ingresar un documento de autorización UGEL válido (mínimo 5 caracteres)
- **THEN** el sistema rechaza la operación con estado HTTP `422` en formato Problem Details (y validación previa en pantalla) sin alterar el estado del trimestre

#### Scenario: Rechazo de transición inválida o publicación de libreta sobre trimestre no cerrado (RF05, RF27)
- **GIVEN** un trimestre se encuentra en estado `En Evaluación`
- **WHEN** se solicita cerrarlo directamente saltando `Cierre Preliminar` o se intenta publicar su libreta antes de cerrarlo
- **THEN** el sistema rechaza la solicitud con estado HTTP `409` en formato Problem Details indicando que la transición o publicación no es válida para el estado actual

#### Scenario: Rechazo de operaciones de trimestre para roles no autorizados (RF05, AC04)
- **GIVEN** un usuario autenticado con rol `Docente`, `Apoderado` o `Estudiante`
- **WHEN** intenta ejecutar una transición de estado, publicar una libreta o reabrir un trimestre
- **THEN** el sistema deniega la operación con estado HTTP `403` en formato Problem Details sin modificar los trimestres ni generar cambios en la bitácora

### Requirement: Gestión de secciones del catálogo escolar por nivel y grado (RF03, RF18, HU08, AC04)
El sistema SHALL permitir al `Administrador` consultar las secciones por nivel (`Primaria` y `Secundaria`) y grado, crear una nueva sección en una letra disponible (`A–P`) con tutor y auxiliar, actualizar su personal a cargo y eliminar únicamente secciones sin estudiantes asignados, registrando cada cambio en auditoría.

#### Scenario: Creación válida de sección en letra libre con registro de auditoría (RF03, RF18)
- **GIVEN** el Administrador consulta el grado `1.°` de `Secundaria` donde existe al menos una letra disponible entre `A` y `P`
- **WHEN** crea una nueva sección seleccionando una letra libre, un tutor y un auxiliar
- **THEN** el sistema registra la sección, la devuelve en el listado del grado y registra un evento de tipo `Asignación` en la bitácora de auditoría con fecha, hora, usuario, IP y cambio `—` → `Creada`

#### Scenario: Bloqueo de eliminación cuando la sección aún tiene estudiantes (RF03)
- **GIVEN** una sección tiene uno o más estudiantes asignados
- **WHEN** el Administrador solicita eliminar dicha sección
- **THEN** el sistema rechaza la eliminación con estado HTTP `409` en formato Problem Details indicando que debe mover o retirar primero a los estudiantes

#### Scenario: Eliminación exitosa de una sección vacía con auditoría (RF03, RF18)
- **GIVEN** una sección (como `1.° P`) no tiene estudiantes asignados
- **WHEN** el Administrador confirma su eliminación
- **THEN** el sistema elimina la sección del catálogo y registra el evento de eliminación en la bitácora de auditoría

#### Scenario: Rechazo de duplicado de letra o rol no autorizado (AC04)
- **GIVEN** una solicitud para crear una sección cuya letra ya existe en el mismo nivel/grado, o enviada por un rol distinto a `Administrador`
- **WHEN** la API valida la petición
- **THEN** responde `409` para letra duplicada o `403` en formato Problem Details para rol no autorizado

### Requirement: Catálogo oficial de asignaturas y competencias CNEB (RF03, HU08, AC04)
El sistema SHALL exponer al `Administrador` el catálogo oficial de asignaturas y competencias por nivel (`Primaria`, `Secundaria` y `Transversales`), mostrando las competencias numeradas (`C1`, `C2`, ...) y señalando que las transversales no pertenecen a un área curricular específica.

#### Scenario: Consulta del catálogo curricular filtrado por nivel
- **GIVEN** el Administrador accede a la pestaña `Asignaturas y competencias`
- **WHEN** alterna entre `Secundaria`, `Primaria` y `Transversales` y expande una asignatura
- **THEN** visualiza las asignaturas del nivel elegido con su conteo y listado completo de competencias oficiales

### Requirement: Asignación de docentes titulares y suplentes por sección y asignatura (RF03, RF18, HU08, AC04)
El sistema SHALL permitir al `Administrador` consultar y actualizar al docente titular y al suplente de cada asignatura en una sección, resaltando alertas de asignaturas sin titular o con titular con licencia sin suplente y registrando cada cambio en la bitácora de auditoría.

#### Scenario: Actualización de docente suplente con alerta de licencia y registro en auditoría (RF03, RF18)
- **GIVEN** una asignatura en `2.° A` muestra alerta por docente titular con licencia sin suplente
- **WHEN** el Administrador selecciona un docente suplente
- **THEN** el sistema guarda la asignación, elimina la alerta y registra un evento de tipo `Asignación` en auditoría con los valores antes y después

#### Scenario: Rechazo de actualización de asignaciones para roles no autorizados (AC04)
- **GIVEN** un usuario autenticado con rol distinto a `Administrador`
- **WHEN** intenta consultar o modificar las asignaciones docentes del catálogo
- **THEN** el sistema responde con estado HTTP `403` en formato Problem Details sin alterar la plana docente
