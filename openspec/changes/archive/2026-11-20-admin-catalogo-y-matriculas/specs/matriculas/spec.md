# matriculas Specification

## Purpose

Definir los comportamientos observables del módulo `matriculas` para la administración operativa de la nómina vigente: estudiantes sin sección (nómina SIAGIE), listado y resumen de estudiantes por sección, asignación por grado, movimiento entre secciones y cambio de estado escolar con trazabilidad en auditoría.

## ADDED Requirements

### Requirement: Gestión del pool de estudiantes sin sección y asignación por grado (RF18, RF21, HU13, AC04)
El sistema SHALL permitir al `Administrador` consultar los estudiantes de la nómina SIAGIE que aún no tienen sección y asignarlos únicamente a una sección del mismo grado y nivel correspondiente, actualizando los listados y registrando la asignación en auditoría.

#### Scenario: Asignación exitosa desde el pool sin sección hacia una sección del grado correspondiente (RF21, RF18)
- **GIVEN** existe un estudiante en el pool `Sin sección` correspondiente a `1.°` de `Secundaria` y una sección `1.° P` de `Secundaria`
- **WHEN** el Administrador asigna al estudiante a la sección `1.° P`
- **THEN** el estudiante sale del pool `Sin sección`, aparece en el listado ordenado de `1.° P` con estado `Activo` y se registra un evento de tipo `Asignación` en auditoría (`Sin sección` → `1.° P`)

#### Scenario: Rechazo de asignación cuando el grado de la sección no coincide con el estudiante (RF21)
- **GIVEN** un estudiante del pool pertenece a `4.°` grado de `Secundaria`
- **WHEN** se intenta asignarlo a una sección de `1.°` grado
- **THEN** el sistema rechaza la operación con estado HTTP `422` en formato Problem Details sin modificar la ubicación del estudiante

### Requirement: Consulta de estudiantes por sección, movimiento y cambio de estado escolar (RF18, RF21, HU13, AC04)
El sistema SHALL mostrar los estudiantes asignados a una sección con su ficha de resumen (código SIAGIE, DNI, apoderado, tutor, indicadores del trimestre y último nivel por área), permitir mover a un estudiante a otra sección del mismo grado o retirarlo al pool `Sin sección`, y permitir cambiar su estado (`Activo`, `Retirado`, `Trasladado`) registrando cada cambio en auditoría.

#### Scenario: Movimiento de estudiante hacia otra sección del mismo grado o retiro al pool (RF21, RF18)
- **GIVEN** un estudiante está asignado a `3.° B`
- **WHEN** el Administrador lo mueve a `3.° A` o elige `Quitar de la sección`
- **THEN** el sistema actualiza las nóminas correspondientes (o lo devuelve al pool `Sin sección`) y registra el cambio en la bitácora de auditoría

#### Scenario: Cambio de estado escolar de un estudiante con registro de auditoría (RF21, RF18)
- **GIVEN** un estudiante figura como `Activo` en una sección
- **WHEN** el Administrador cambia su estado a `Trasladado` o `Retirado`
- **THEN** el sistema persiste el nuevo estado y registra un evento en la bitácora con valores `Activo` → nuevo estado

#### Scenario: Rechazo de operaciones de matrícula para roles no autorizados (AC04)
- **GIVEN** un usuario autenticado con rol `Docente`, `Apoderado` o `Estudiante`
- **WHEN** intenta consultar el pool `Sin sección`, listar la nómina administrativa o mover/modificar estudiantes
- **THEN** el sistema responde con estado HTTP `403` en formato Problem Details sin exponer ni modificar datos
