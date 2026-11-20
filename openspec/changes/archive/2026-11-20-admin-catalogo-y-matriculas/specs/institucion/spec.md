# institucion Delta Specification

## ADDED Requirements

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
