# personas Specification

## Purpose

Definir los comportamientos observables del módulo `personas` para la administración de cuentas y roles del portal por documento de identidad (DNI): consulta filtrable por estado, rol y búsqueda, alta con código de activación de un solo uso, edición, restablecimiento de contraseña y bloqueo/desbloqueo con trazabilidad en auditoría.

## ADDED Requirements

### Requirement: Consulta filtrable y gestión de alta/edición de cuentas por DNI (RF04, RF14, RF18, AC04)
El sistema SHALL permitir al `Administrador` consultar las cuentas filtradas por estado (`todas`, `activa`, `pendiente`, `bloqueada`), rol y búsqueda por nombre o DNI, crear nuevas cuentas validando nombres y apellidos, DNI único de 8 dígitos y rol permitido (generando un código de activación de 6 caracteres), y editar nombre, DNI o rol de cuentas no administradoras registrando cada cambio en auditoría.

#### Scenario: Alta exitosa de cuenta con generación de código de activación y auditoría (RF04, RF14, RF18)
- **GIVEN** el Administrador está en la gestión de cuentas y roles
- **WHEN** registra una nueva cuenta con nombres y apellidos completos, un DNI de 8 dígitos no registrado y rol `Apoderado`
- **THEN** el sistema crea la cuenta en estado `Pendiente de activación`, devuelve un código de activación de 6 caracteres y registra un evento de tipo `Cuenta` en la bitácora de auditoría (`—` → `Creada`)

#### Scenario: Rechazo por DNI duplicado, formato inválido o intento de editar cuenta Administrador (RF04, AC04)
- **GIVEN** una petición con DNI ya existente, DNI distinto de 8 dígitos, nombre con menos de dos palabras o sobre una cuenta de rol `Administrador`
- **WHEN** el sistema valida la solicitud
- **THEN** responde `409` por DNI duplicado, `422` por formato/rol inválido o `403` al intentar modificar una cuenta `Administrador` en formato Problem Details

### Requirement: Restablecimiento de contraseña y bloqueo o desbloqueo de cuentas (RF14, RF18, AC04)
El sistema SHALL permitir exclusivamente al `Administrador` restablecer la contraseña (o regenerar el código de activación) de cuentas no administradoras devolviendo un nuevo código de 6 caracteres y pasando la cuenta a estado `Pendiente de activación`, así como bloquear o desbloquear cuentas dejando constancia en la bitácora de auditoría.

#### Scenario: Restablecimiento de contraseña y desbloqueo con registro en auditoría (RF14, RF18)
- **GIVEN** una cuenta de apoderado se encuentra `Bloqueada` o `Activa`
- **WHEN** el Administrador ejecuta `Desbloquear` o `Restablecer contraseña`
- **THEN** el sistema actualiza el estado de la cuenta (generando un nuevo código de 6 caracteres al restablecer) y registra el evento en auditoría con los valores antes y después

#### Scenario: Rechazo de operaciones de cuentas para roles no autorizados (RF14, AC04)
- **GIVEN** un usuario autenticado con rol distinto a `Administrador` (como `Docente`, `Apoderado` o `Estudiante`)
- **WHEN** intenta consultar el directorio de cuentas, crear, editar, bloquear o restablecer contraseñas
- **THEN** el sistema deniega la operación con estado HTTP `403` en formato Problem Details sin alterar ninguna cuenta
