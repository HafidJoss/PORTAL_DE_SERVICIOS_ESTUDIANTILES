# auditoria Specification

## Purpose
Definir los comportamientos observables del módulo `auditoria` para la consulta de la bitácora inalterable de eventos críticos y su exportación en formato CSV conforme a trazabilidad institucional y protección de datos personales.

## Requirements

### Requirement: Consulta filtrable de la bitácora inalterable y exportación CSV (RF18, RF29, AC04, ADR-005)
El sistema SHALL permitir al `Administrador` consultar en orden cronológico inverso el registro inalterable de eventos críticos (fecha, hora, usuario, rol, tipo de evento, entidad, antes, después e IP), filtrar por tipo de evento (`Todos`, `Calificativo`, `Nivel`, `Estado`, `Libreta`, `Reapertura`, `Cuenta`, `Asignación`, `Seguridad`, `Sesión`) y exportar la vista filtrada en formato CSV UTF-8.

#### Scenario: Consulta de eventos y visibilidad en vivo de mutaciones administrativas (RF18, ADR-005)
- **GIVEN** el Administrador ha ejecutado cambios en trimestres, catálogo o cuentas
- **WHEN** consulta la bitácora de auditoría sin filtro o filtrando por tipo (`Cuenta`, `Estado`, `Asignación`)
- **THEN** visualiza primero los eventos más recientes con fecha, hora, usuario, rol, entidad, cambio `Antes → Después` e IP de origen

#### Scenario: Exportación CSV de la bitácora filtrada (RF18, RF29)
- **GIVEN** el Administrador solicita exportar la bitácora con un filtro de tipo activo o en `Todos`
- **WHEN** invoca la descarga CSV
- **THEN** la API responde con `Content-Type: text/csv; charset=utf-8`, encabezado institucional (`Fecha;Hora;Usuario;Rol;Evento;Entidad;Antes;Después;IP`) y las filas coincidentes con el filtro

#### Scenario: Rechazo de acceso a la bitácora para roles no autorizados (AC04)
- **GIVEN** un usuario autenticado con rol `Docente`, `Apoderado` o `Estudiante`
- **WHEN** intenta consultar o exportar la bitácora de auditoría
- **THEN** el sistema rechaza la petición con estado HTTP `403` en formato Problem Details sin exponer registros
