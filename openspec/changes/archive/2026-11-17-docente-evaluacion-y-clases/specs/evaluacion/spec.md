# Spec Delta: evaluacion

## ADDED Requirements

### Requirement: Registro de sesiones de clase, criterios y Nota del día (RF06, RF07, RF23, HU14, AC07)
El sistema SHALL permitir al docente crear sesiones con criterios editables (`K1..K4`), registrar niveles `AD/A/B/C` por criterio desde escritorio o móvil, calcular la **nota del día** mediante mediana cualitativa con ajuste manual y completado masivo, y exigir los cuatro criterios completos antes de publicar.

#### Scenario: Creación de sesión, cálculo automático de nota del día y publicación exitosa
- **GIVEN** un docente abre la ficha de una clase pendiente o crea una nueva clase con tema y cuatro criterios
- **WHEN** registra los cuatro criterios (`K1..K4`) para los estudiantes de la sección (o utiliza `Completar vacíos con A`) y acciona `Guardar y publicar`
- **THEN** la nota del día de cada estudiante refleja el nivel predominante (mediana) de sus criterios o su ajuste manual marcado, la sesión cambia a estado publicada y permite descargar la ficha en formato tabular

#### Scenario: Bloqueo de publicación por criterios incompletos
- **GIVEN** una sesión de clase tiene estudiantes sin los cuatro criterios registrados
- **WHEN** el docente intenta ejecutar `Guardar y publicar`
- **THEN** el sistema impide la publicación indicando cuántos estudiantes tienen criterios pendientes sin perder los avances capturados

### Requirement: Registro auxiliar cualitativo por capacidades sin promedios numéricos (RF07, RF08, HU02)
El portal MUST presentar al docente un registro auxiliar filtrable por competencia (`C1..C4`) que agrupe las sesiones publicadas por capacidad, calcule el nivel sugerido por capacidad y el nivel sugerido de la competencia según el método configurado (`mediana` o `último nivel registrado`), sin mostrar promedios aritméticos ni notas vigesimales, y permita descargar el registro por competencia.

#### Scenario: Cambio de competencia y cálculo cualitativo en el registro auxiliar
- **GIVEN** una sección cuenta con sesiones publicadas distribuidas entre competencias y capacidades
- **WHEN** el docente consulta el registro auxiliar y alterna entre las competencias `C1`, `C2`, `C3` y `C4`
- **THEN** el sistema muestra las sesiones agrupadas bajo cada capacidad con su nivel calculado por capacidad, el nivel sugerido de la competencia en escala `AD/A/B/C` (o un estado vacío si la competencia aún no tiene clases registradas)

### Requirement: Gestión de actividades en borrador o publicadas sin subida de archivos (RF23, RC08)
El sistema SHALL permitir al docente crear actividades académicas indicando título, fecha de entrega, competencia e indicaciones, guardándolas como `Borrador` o publicándolas inmediatamente para estudiantes y apoderados, y publicar posteriormente borradores existentes sin ofrecer carga ni adjunto de archivos (`RC08`).

#### Scenario: Creación de borrador, publicación posterior y ausencia de carga de archivos
- **GIVEN** un docente se encuentra en la gestión de actividades de una sección
- **WHEN** registra una actividad válida seleccionando `Guardar borrador` y luego acciona `Publicar` sobre esa actividad
- **THEN** la actividad pasa de `Borrador` a `Publicada`, sin mostrar campos ni botones para adjuntar archivos (`RC08`), y valida título y fecha obligatorios antes de guardar

### Requirement: Cierre trimestral de competencias y validación de conclusiones descriptivas (RF07, RF08, RF22, HU02)
El sistema SHALL permitir al docente revisar por cada competencia el nivel sugerido, aplicar todos los sugeridos o ajustar niveles individuales (`AD`, `A`, `B`, `C`), redactar la conclusión descriptiva y confirmar la competencia únicamente cuando todos los estudiantes cuenten con nivel asignado y quienes tengan nivel obligatorio (`B` o `C` en Primaria; `C` en Secundaria) posean conclusión descriptiva válida de al menos 10 caracteres.

#### Scenario: Confirmación exitosa de competencia tras completar conclusiones obligatorias
- **GIVEN** un docente revisa el cierre de una competencia en Secundaria con al menos un estudiante en nivel `C`
- **WHEN** ingresa una conclusión descriptiva de al menos 10 caracteres para cada estudiante con nivel `C` (o ajusta el nivel) y acciona `Confirmar niveles`
- **THEN** el sistema confirma la competencia mostrando el indicador de confirmación y habilitando la persistencia del cierre trimestral

#### Scenario: Rechazo de confirmación cuando falta nivel o conclusión descriptiva obligatoria (RF22)
- **GIVEN** una competencia en cierre tiene estudiantes sin nivel asignado o estudiantes con nivel obligatorio sin conclusión descriptiva suficiente
- **WHEN** el docente intenta confirmar los niveles de la competencia
- **THEN** el sistema rechaza la confirmación, señala la cantidad exacta de estudiantes pendientes y mantiene la competencia sin confirmar

### Requirement: Registro de observaciones por estudiante desde nómina de sección (RF24, RC08)
El portal SHALL mostrar el listado buscable de estudiantes de la sección con su último nivel registrado y permitir publicar observaciones clasificadas como `Positiva` o `Por mejorar` dirigidas al estudiante y su apoderado, validando una longitud mínima del texto.

#### Scenario: Búsqueda de estudiante y publicación de observación
- **GIVEN** un docente consulta la nómina de estudiantes de una sección
- **WHEN** filtra por nombre de un estudiante, selecciona el tipo de observación (`Positiva` o `Por mejorar`), escribe al menos 5 caracteres y confirma `Publicar observación`
- **THEN** el sistema registra la observación para el estudiante y su apoderado, incrementa el conteo visible de observaciones del alumno y rechaza envíos con texto vacío
