# Spec Delta: reportes

## ADDED Requirements

### Requirement: Verificación y descarga firmada de Excel SIAGIE y Actas preliminares docentes (RF16, HU07, RC05, RC06)
El portal SHALL presentar al docente el estado de preparación por trimestre (`I`, `II` y `III Trimestre`) y sección asignada indicando las competencias confirmadas (`competencias_confirmadas / 4`), y emitir enlaces temporales firmados (`TTL 15 minutos`, `RC05`) para descargar la plantilla `Excel SIAGIE` y el `Acta preliminar` únicamente cuando las cuatro competencias de la sección estén confirmadas.

#### Scenario: Descarga temporal de Excel SIAGIE y Acta preliminar en sección lista
- **GIVEN** una sección tiene sus cuatro competencias confirmadas (`4/4`) en el trimestre seleccionado
- **WHEN** el docente acciona `Excel SIAGIE` o `Acta preliminar`
- **THEN** el portal solicita al servidor la URL temporal firmada vigente por 15 minutos (`RC05`) y muestra la confirmación de descarga con el nombre del archivo correspondiente

#### Scenario: Bloqueo de exportación cuando faltan competencias por confirmar (RF16, RC06)
- **GIVEN** una sección en el trimestre en evaluación aún tiene competencias pendientes (`< 4`)
- **WHEN** el servidor recibe una solicitud de descarga para esa sección o el docente interactúa con la fila incompleta
- **THEN** el backend rechaza la emisión del enlace con respuesta Problem Details `400` y en la vista web se dirige al docente hacia el cierre de competencias de la sección correspondiente
