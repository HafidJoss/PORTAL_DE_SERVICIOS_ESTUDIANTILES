# Spec Delta: plataforma-web

## ADDED Requirements

### Requirement: Navegación institucional parametrizada según rol autenticado (RC01, AC07)
El shell responsivo del portal SHALL adaptar sus enlaces de barra lateral en escritorio y de navegación inferior en dispositivo móvil según el rol de la sesión activa (`Estudiante` o `Docente`), mostrando insignias de mensajes sin leer y notas pendientes para el docente sin alterar la navegación del estudiante ni producir desbordamiento horizontal en pantallas de 360x640 px.

#### Scenario: Menú lateral e insignias para sesión con rol Docente en escritorio
- **GIVEN** una pantalla de ancho igual o superior a 1024 px con sesión activa de rol `Docente`
- **WHEN** se renderiza el marco principal del portal
- **THEN** la navegación muestra los accesos docentes (`Inicio`, `Mis cursos`, `Nota del día`, `Mensajes`, `Exportar SIAGIE` y `Configuración`), el avatar con iniciales del docente y los contadores de pendientes cuando correspondan

#### Scenario: Barra inferior compacta para sesión Docente en móvil
- **GIVEN** una pantalla con resolución móvil de 360x640 px y sesión activa de rol `Docente`
- **WHEN** se renderiza una ruta autenticada del portal docente
- **THEN** el sistema oculta la barra lateral de escritorio y muestra la navegación inferior docente con accesos compactos sin desbordamiento horizontal

### Requirement: Contratos OpenAPI para tablero de inicio, bandeja y secciones docentes (RC03, AC06)
La API del portal SHALL exponer bajo `/api/v1` los endpoints contractuales de `seguimiento` para docentes (`inicio`, `bandeja/{mensaje_id}/leer`, `bandeja/leer-todo`, `bandeja/{mensaje_id}/responder` y `cursos`) junto con los campos opcionales de perfil docente en `identidad`, con sus esquemas tipados en OpenAPI para generar el cliente del frontend.

#### Scenario: Esquema OpenAPI incluye endpoints contractuales docentes bajo seguimiento
- **GIVEN** la API expone su esquema OpenAPI vigente
- **WHEN** se inspeccionan las rutas registradas bajo `/api/v1/seguimiento/docentes/{docente_id}/`
- **THEN** el contrato expone los endpoints `inicio`, `bandeja/{mensaje_id}/leer`, `bandeja/leer-todo`, `bandeja/{mensaje_id}/responder` y `cursos` con validación de entrada y respuestas Problem Details ante errores
