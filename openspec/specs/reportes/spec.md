# reportes Specification

## Purpose
Define el comportamiento observable de la consulta web de libretas trimestrales, la visualización de la situación final anual y la obtención de enlaces temporales firmados para descargar la libreta en PDF.

## Requirements

### Requirement: Consulta de libretas trimestrales y estado de publicación (RF27, RF28, HU06)
El portal MUST mostrar al estudiante los trimestres del año lectivo indicando cuántos han sido publicados, presentar el informe oficial de progreso por áreas, competencias (`AD`, `A`, `B`, `C`), marca de competencia transversal y situación final (`PRO`, `PER`, `RR`) cuando exista publicación, o informar cuando un trimestre aún no se publica.

#### Scenario: Visualización de una libreta trimestral publicada
- **GIVEN** un estudiante con al menos un trimestre cuya libreta fue publicada por Dirección
- **WHEN** accede a la vista de libreta y selecciona un trimestre publicado
- **THEN** visualiza el encabezado institucional, grado y sección, áreas curriculares con sus competencias, niveles, conclusiones, eventual indicación de competencias transversales y la aclaración de que el Acta Oficial se emite desde el SIAGIE

#### Scenario: Trimestre seleccionado aún no publicado
- **GIVEN** un estudiante que selecciona un trimestre cuyo estado aún no es publicado
- **WHEN** consulta la vista previa del trimestre
- **THEN** el portal no muestra documento descargable e informa que la libreta estará disponible cuando Dirección la publique, ofreciendo un enlace hacia calificaciones

#### Scenario: Situación final calculada al cierre del año
- **GIVEN** un estudiante cuya respuesta incluye una situación final anual calculada (`PRO`, `PER` o `RR`)
- **WHEN** consulta la vista de libreta
- **THEN** el portal destaca la situación final junto a su etiqueta descriptiva

#### Scenario: Error de consulta o acceso sin perfil de estudiante
- **GIVEN** una falla del servidor al obtener las libretas, o una sesión perteneciente a un rol distinto a estudiante
- **WHEN** intenta abrir la vista de libreta
- **THEN** ante error del servidor muestra un mensaje claro con opción de reintentar, y sin perfil de estudiante impide la consulta académica

### Requirement: Descarga segura de libreta en PDF mediante enlace temporal firmado (RF15, RC05, ADR-002, AC01)
Para cada libreta trimestral publicada, el portal MUST solicitar bajo demanda una URL temporal firmada (vigencia de 15 minutos conforme a `RC05` y `ADR-002`) para descargar el PDF correspondiente, sin exponer rutas públicas permanentes ni habilitar descargas en trimestres no publicados.

#### Scenario: Generación exitosa de enlace firmado para descargar PDF
- **GIVEN** un estudiante visualizando una libreta trimestral publicada
- **WHEN** activa la acción `Descargar PDF`
- **THEN** el portal solicita la URL firmada al servidor, muestra la confirmación de descarga temporal lista junto con el nombre de archivo sugerido y la vigencia de 15 minutos, y habilita el acceso al enlace firmado

#### Scenario: Error al solicitar la URL firmada de descarga
- **GIVEN** un estudiante que solicita descargar el PDF de una libreta publicada y el servidor responde con error
- **WHEN** falla la obtención del enlace firmado
- **THEN** el portal muestra un mensaje de error claro sin exponer trazas técnicas y permite volver a intentar la descarga

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
