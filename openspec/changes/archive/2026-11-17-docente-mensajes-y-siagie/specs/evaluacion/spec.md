# Spec Delta: evaluacion

## ADDED Requirements

### Requirement: Envío docente de mensajes a sección o estudiante sin archivos adjuntos (RF25, HU15, RC08)
El portal SHALL permitir al docente redactar y enviar mensajes de tipo `Tarea` o `Recordatorio` dirigidos a toda una sección asignada o a un estudiante específico y su apoderado, listando cronológicamente los mensajes enviados sin ofrecer subida de archivos adjuntos ni chat en tiempo real (`RC08`).

#### Scenario: Envío exitoso de mensaje a una sección y registro en enviados
- **GIVEN** un docente autenticado accede a la pantalla `Mensajes`
- **WHEN** selecciona el tipo `Recordatorio`, elige la sección `4.° A`, redacta asunto y texto válidos y acciona `Enviar`
- **THEN** el sistema registra el mensaje sin controles para adjuntar archivos, limpia los campos del formulario y lo incorpora al inicio del listado cronológico de mensajes enviados

#### Scenario: Validación de asunto o contenido insuficiente al enviar mensaje
- **GIVEN** un docente intenta enviar un mensaje con asunto menor a 3 caracteres o cuerpo menor a 5 caracteres
- **WHEN** acciona `Enviar`
- **THEN** el sistema bloquea el envío mostrando un aviso claro de validación y mantiene los campos editables para su corrección
