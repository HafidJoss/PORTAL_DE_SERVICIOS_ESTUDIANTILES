# Proposal

## Why

El Punto 1 (`bootstrap-frontend`) dejó listos el cliente Orval, el shell responsivo y los contratos API de identidad, pero `/ingresar` y `/configuracion` son todavía marcadores sin interacción y la navegación usa datos fijos en lugar de la sesión autenticada. Este cambio implementa la feature completa de **identidad para Estudiante v2** (`frontend/src/features/identidad/`), conectada a los endpoints ya generados de `identidad` (`login`, `activar`, `logout`, `sesion`, `cambiar-contrasena` y `aviso-privacidad`).

## What Changes

- **Acceso y activación (`/ingresar`):** Pantalla responsiva con pestañas `Ingresar` (DNI de 8 dígitos, contraseña con mostrar/ocultar, opción `Recordarme` para el DNI en navegador, ayuda `¿Olvidaste tu contraseña?` indicando que solo el Administrador restablece claves) y `Activar cuenta` (DNI, código de un solo uso de 6 caracteres, nueva contraseña de mínimo 8 caracteres, confirmación y aceptación del Aviso de privacidad con lectura real desde la API en modal accesible).
- **Gestión de sesión y cierre de sesión:** Proveedor/guardia de ruta que consulta la sesión vigente (`GET /api/v1/identidad/sesion`), protege las rutas internas redirigiendo a `/ingresar` si no hay sesión válida, alimenta el nombre, iniciales y grado/sección reales en `PortalLayout` y añade el botón `Cerrar sesión` (`POST /api/v1/identidad/logout`) tanto en escritorio como en móvil.
- **Configuración del estudiante (`/configuracion`):** Vista con 5 bloques alineados al prototipo `Estudiante v2` y al MVP:
  - *Avatar institucional:* iniciales calculadas del usuario (sin carga ni subida de fotografías, `RC07`/`RC08`).
  - *Datos personales:* nombres, apellidos, DNI, código de estudiante, grado/sección y tutor en solo lectura, con aviso de acudir a Secretaría para correcciones.
  - *Apariencia:* selector visual `Claro` / `Oscuro` conectado a `ThemeProvider`.
  - *Avisos en el portal:* preferencias locales (`localStorage`) para resaltar novedades de calificativos, tareas, asistencia y observaciones.
  - *Cambiar contraseña:* formulario conectado a `POST /api/v1/identidad/cambiar-contrasena` con validación de campos y manejo de errores RFC 9457.

## Capabilities

### New Capabilities
- `identidad`: Flujos web de ingreso por DNI, activación con código de un solo uso, consulta del aviso de privacidad, guarda de sesión activa, cierre de sesión, visualización de perfil en solo lectura y cambio de contraseña propia para el estudiante.

### Modified Capabilities
<!-- Ninguna: aún no existe openspec/specs/identidad/spec.md. -->

## Trazabilidad y Alcance

- **Requisitos e historias atendidos:** `RF14` (autenticación por DNI, activación con código de un solo uso, restablecimiento exclusivo por Administrador, cambio de contraseña y cierre de sesión), `RF29` (exhibición y aceptación del Aviso de privacidad conforme a Ley N.º 29733 y D. S. N.º 016-2024-JUS), `AC04` (protección de rutas privadas y control de sesión), `AC07` / `RC01` (usabilidad móvil `360x640` y escritorio), `RC07` / `RC08` (sin subida de archivos). Prepara la sesión para `HU06`, `HU10`, `HU12` y `HU16`.
- **Módulo propietario:** `identidad` (`frontend/src/features/identidad/`), usando el cliente Orval de `frontend/src/api/generated/identidad/`.
- **Decisiones arquitectónicas aplicadas:** `ADR-004`, `ADR-008`.
- **Fuera de alcance (`RC08`):** Subida de foto de perfil (`RC07`), gestión administrativa de cuentas/roles y restablecimiento de contraseñas a terceros (van en el portal de Administrador/Secretaría), pantallas de `Inicio`, `Cursos`, `Trabajos`, `Asistencia`, `Calificaciones`, `Mensajes` y `Libreta` (Puntos 3 y 4), y lógica real de hashing `argon2` / PostgreSQL en el backend.

## Impact

- **Código nuevo en `frontend/src/features/identidad/`:** páginas y componentes (`IngresoPage.tsx`, `FormLogin.tsx`, `FormActivarCuenta.tsx`, `ModalPrivacidad.tsx`, `ConfiguracionPage.tsx`, hooks/helpers de preferencias de avisos) y sus pruebas en `__tests__/`.
- **Código modificado en `frontend/`:** `src/app/App.tsx` (rutas protegidas y sesión real) y `src/shared/components/PortalLayout.tsx` (botón `Cerrar sesión` en escritorio/móvil).
- **Contratos API consumidos:** los 6 endpoints de `identidad` ya generados en `frontend/src/api/generated/identidad/identidad.ts` (no requiere cambios en `backend/`).
