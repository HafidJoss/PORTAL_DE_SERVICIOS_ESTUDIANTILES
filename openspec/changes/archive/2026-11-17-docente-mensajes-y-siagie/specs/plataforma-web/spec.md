# Spec Delta: plataforma-web

## ADDED Requirements

### Requirement: Rutas docentes finales para Mensajes y Exportar SIAGIE y contratos OpenAPI (RC03, AC06)
La API del portal SHALL exponer bajo `/api/v1` los endpoints contractuales docentes `/evaluacion/docentes/{docente_id}/mensajes` (`GET`, `POST`), `/reportes/docentes/{docente_id}/siagie` (`GET`) y `/reportes/docentes/{docente_id}/siagie/{seccion_id}/descarga` (`POST`), y la aplicación web SHALL activar las rutas operativas `/mensajes` y `/siagie` para el rol `Docente` sin vistas en construcción.

#### Scenario: Esquema OpenAPI declara contratos docentes de mensajería y SIAGIE
- **GIVEN** la API expone su esquema OpenAPI vigente
- **WHEN** se consultan las rutas bajo `/api/v1/evaluacion/docentes/` y `/api/v1/reportes/docentes/`
- **THEN** todas las operaciones de mensajería saliente y descargas SIAGIE/actas están declaradas con validación de entrada y respuestas Problem Details

#### Scenario: Navegación del docente por Mensajes y Exportar SIAGIE completos
- **GIVEN** un docente autenticado navega hacia `/mensajes` o `/siagie` desde el menú lateral o móvil
- **WHEN** se renderiza la vista correspondiente
- **THEN** la aplicación muestra el redactor con historial de enviados o el panel trimestral de descargas SIAGIE sin marcadores temporales de pantalla en preparación
