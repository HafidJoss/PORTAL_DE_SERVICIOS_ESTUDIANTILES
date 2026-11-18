# Spec Delta: seguimiento

## ADDED Requirements

### Requirement: Tablero de inicio del apoderado por menor y bandeja familiar (RF01, RF26, HU01, AC01)
El portal SHALL mostrar al apoderado autenticado el inicio correspondiente al hijo seleccionado con saludo personalizado, KPIs (`Sin leer`, `Tareas pendientes`, `Asistencia`), bandeja familiar filtrable (`Todos`, `No leídos`, `Institución`, `Docentes`), próximas entregas y accesos rápidos, validando que el menor pertenezca al apoderado (`DA05`).

#### Scenario: Consulta del tablero inicial familiar y filtrado de bandeja por categoría
- **GIVEN** un apoderado autenticado visualiza `/inicio` para uno de sus hijos vinculados
- **WHEN** alterna entre los filtros `No leídos`, `Institución` y `Docentes` o cambia de hijo seleccionado
- **THEN** la bandeja filtra correctamente cada categoría mostrando estado vacío si no hay coincidencias, y al cambiar de menor actualiza los datos para ese estudiante

#### Scenario: Rechazo por intento de acceso a un estudiante ajeno al apoderado (DA05)
- **GIVEN** un apoderado intenta consultar el inicio de un identificador de estudiante no vinculado a su perfil
- **WHEN** solicita el recurso al backend de seguimiento
- **THEN** el servicio rechaza la operación con error `403` en formato Problem Details sin exponer información del estudiante ajeno

### Requirement: Confirmación de lectura de comunicados institucionales para apoderados (RF25, RC08)
El sistema SHALL permitir al apoderado marcar toda la bandeja como leída y confirmar expresamente la lectura de comunicados institucionales que lo requieran desde su bandeja de entrada, manteniendo de solo lectura los avisos docentes que no habilitan chat libre (`RC08`).

#### Scenario: Confirmación de lectura institucional y marcado masivo en bandeja familiar
- **GIVEN** un apoderado abre un comunicado de Dirección con confirmación requerida en su bandeja
- **WHEN** acciona `Confirmar lectura` o pulsa `Marcar todo como leído`
- **THEN** el sistema registra la confirmación en el servidor mostrando el indicador de lectura confirmada y reduce a cero el conteo de sin leer cuando corresponde
