# Delta Specification · reportes

## ADDED Requirements

### Requirement: Consulta y descarga temporal firmada de libreta multi-hijo para el apoderado (RF15, RF27, RF28, RC05, DA05)

El portal MUST permitir al apoderado consultar las libretas trimestrales publicadas (`I`, `II`, `III` Trimestre con estado pendiente cuando aún no se publica) y solicitar enlaces temporales firmados de descarga PDF (`TTL 15 minutos`, `RC05`, `ADR-002`) para el menor seleccionado en el marco del portal, actualizando la libreta al cambiar de menor y rechazando con `403 Problem Details` (`DA05`) el acceso a libretas o descargas de menores no vinculados.

#### Scenario: Consulta y descarga firmada de libreta por menor seleccionado
- **GIVEN** un apoderado autenticado en `/libreta` con dos menores vinculados en distintos grados
- **WHEN** visualiza un trimestre publicado, activa `Descargar PDF` y posteriormente cambia al segundo menor
- **THEN** obtiene el enlace temporal firmado con vigencia de 15 minutos (`expira_en_segundos=900`) para el menor activo y, tras el cambio de menor, la libreta actualiza el grado, sección, competencias y enlaces de descarga al nuevo estudiante

#### Scenario: Bloqueo de pertenencia en consulta o descarga de libreta ajena (DA05)
- **GIVEN** una solicitud a los endpoints de libretas o descarga firmada con parámetro `apoderado_id` para un `estudiante_id` no vinculado
- **WHEN** el servidor valida la pertenencia familiar
- **THEN** responde `403` Problem Details (`RFC 9457`) y no emite ninguna URL temporal firmada
