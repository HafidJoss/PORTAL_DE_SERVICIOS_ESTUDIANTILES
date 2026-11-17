# Spec Delta: plataforma-web

## ADDED Requirements

### Requirement: Contratos OpenAPI y rutas docentes activas para evaluación continua y detalle de sección (RC03, AC06, AC07)
La API del portal SHALL exponer bajo `/api/v1` los endpoints contractuales de `evaluacion` para docentes (`clases`, `sesiones`, `sesiones/{sesion_id}/notas`, `actividades`, `actividades/{actividad_id}/publicar`, `cierre/confirmar`, `observaciones`) y de `seguimiento` (`secciones/{seccion_id}`, `secciones/{seccion_id}/anuncios`), y la aplicación web SHALL activar las rutas operativas `/cursos/:asignaturaId` y `/nota-del-dia` para el rol `Docente`.

#### Scenario: Esquema OpenAPI incluye endpoints docentes de evaluación y detalle de sección
- **GIVEN** la API expone su esquema OpenAPI vigente
- **WHEN** se inspeccionan las rutas registradas bajo `/api/v1/evaluacion/docentes/{docente_id}/` y `/api/v1/seguimiento/docentes/{docente_id}/secciones/`
- **THEN** todas las rutas de sesiones, criterios, actividades, cierre, observaciones, detalle de sección y anuncios están declaradas con validación de entrada y respuestas Problem Details

#### Scenario: Navegación del docente hacia Nota del día y detalle de sección
- **GIVEN** un docente autenticado navega desde el menú lateral o móvil hacia `Nota del día` o selecciona una sección en `Mis cursos`
- **WHEN** la aplicación resuelve las rutas `/nota-del-dia` y `/cursos/:asignaturaId`
- **THEN** renderiza la ficha interactiva de captura rápida de criterios o el detalle completo con sus seis pestañas operativas sin pantallas en construcción
