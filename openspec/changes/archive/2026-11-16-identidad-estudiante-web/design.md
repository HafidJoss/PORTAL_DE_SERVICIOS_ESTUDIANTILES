# Design

## Context

`bootstrap-frontend` dejó configurados el mutator HTTP (`frontend/src/api/http.ts`), `ThemeProvider` (`frontend/src/app/ThemeProvider.tsx`), los componentes compartidos (`PortalLayout`, `AvatarIniciales`, `BannerHero`, `Card`, `Button`), el enrutador base en `frontend/src/app/App.tsx` y los 6 hooks de identidad generados por Orval en `frontend/src/api/generated/identidad/identidad.ts`. Actualmente `/ingresar` y `/configuracion` son marcadores sin lógica y `PortalLayout` muestra datos estáticos.

## Goals / Non-Goals

**Goals:**
- Implementar la feature `identidad` bajo `frontend/src/features/identidad/` consumiendo exclusivamente los hooks generados en `frontend/src/api/generated/identidad/identidad.ts` (`ADR-008`).
- Construir la pantalla `/ingresar` con pestañas `Ingresar` y `Activar cuenta`, validaciones puras de formulario, modal real de `Aviso de privacidad` (`RF29`) y estética fiel al login de [Portal Estudiante v2.dc.html](file:///c:/Users/PC/Desktop/PORTAL_DE_SERVICIOS_ESTUDIANTILES/prototipos/Portal%20Estudiante%20v2.dc.html).
- Integrar la guarda de sesión (`ProtegidoPorSesion`) y el cierre de sesión (`POST /api/v1/identidad/logout`) en `App.tsx` y `PortalLayout.tsx`, propagando los datos reales del usuario autenticado (`ADR-004`).
- Implementar `/configuracion` con avatar de iniciales (sin subida de archivo, `RC07`/`RC08`), datos personales en solo lectura, selector de tema claro/oscuro (`ThemeProvider`), switches de `Avisos en el portal` en `localStorage` y formulario `Cambiar contraseña`.

**Non-Goals:**
- Modificar archivos en `backend/` (los 6 endpoints contractuales ya existen desde `bootstrap-frontend`; si durante las pruebas se detectara que `POST /identidad/login` con stub devuelve sesión fija sin validar, las pruebas de frontend simulan respuestas de éxito y error vía MSW como dicta `tdd.md`).
- Implementar vistas de `Inicio`, `Cursos`, `Trabajos`, `Asistencia`, `Calificaciones`, `Mensajes` o `Libreta`.
- Implementar subida de foto de perfil (`RC07`) o flujos administrativos de cuentas (`RF14` para Admin/Secretaría).

## Decisions

### 1. Estructura interna de `frontend/src/features/identidad/` (`ADR-008`)
- `validaciones.ts`: funciones puras para validar login (`validarLogin`), activación (`validarActivacion`) y cambio de contraseña (`validarCambioContrasena`), 100 % probables sin DOM ni red (`tdd.md`).
- `preferenciasAvisos.ts`: helper puro + hook/persistencia en `localStorage` (`portal-est-avisos`) para los 4 switches (`calif`, `tareas`, `asist`, `obs`) y `portal-est-dni` para recordar el DNI cuando `Recordarme` está activo.
- `components/FormLogin.tsx`: formulario con DNI numérico (`maxLength=8`), contraseña con toggle de visibilidad (`eye`/`eye-off`), checkbox `Recordarme`, bloque colapsable `¿Olvidaste tu contraseña?` y manejo de errores `ProblemDetailError` (sin disparar redirección `401` redundante estando ya en `/ingresar`).
- `components/FormActivarCuenta.tsx`: formulario de activación con conversión a mayúsculas del código, validaciones locales, enlace al modal de privacidad y vista de confirmación `Cuenta activada` $\rightarrow$ `Ir a ingresar` precargando el DNI activado.
- `components/ModalPrivacidad.tsx`: diálogo accesible (`role="dialog"`, `aria-modal="true"`, cierre por botón o Escape) que consume `useObtenerAvisoPrivacidadApiV1IdentidadAvisoPrivacidadGet`.
- `pages/IngresoPage.tsx`: contenedor responsivo (escritorio y móvil `360x640`) con cabecera institucional (`/escudo.png`), selector de pestañas `Ingresar` / `Activar cuenta` y pie institucional.
- `pages/ConfiguracionPage.tsx`: grilla de tarjetas con `AvatarIniciales`, `Datos personales`, `Apariencia` (tarjetas visuales Claro/Oscuro), `Avisos en el portal` (switches `role="switch"`) y `Cambiar contraseña` (`useCambiarContrasenaApiV1IdentidadCambiarContrasenaPost`).

### 2. Gestión de sesión y redirección (`ADR-004`, `http.ts`)
- **Consulta de sesión:** Un componente `RequiereSesion` envuelve las rutas privadas en `App.tsx` y llama a `useObtenerSesionApiV1IdentidadSesionGet({ query: { retry: false } })`.
- **Estado 401 en `/ingresar` vs rutas privadas:** En `http.ts`, el `onUnauthorized` global redirige a `/ingresar` cuando una ruta privada recibe `401`, mientras que estando ya en `/ingresar` el formulario de login maneja el `ProblemDetailError` de credenciales inválidas directamente en pantalla.
- **Al iniciar sesión o cerrar sesión:**
  - `login` exitoso actualiza la caché de TanStack Query con `queryClient.setQueryData(getObtenerSesionApiV1IdentidadSesionGetQueryKey(), response)` y navega a `/inicio`.
  - `logout` exitoso limpia la caché (`queryClient.clear()`), invoca `POST /api/v1/identidad/logout` y navega a `/ingresar`.

### 3. Botón de `Cerrar sesión` en `PortalLayout`
- `PortalLayout.tsx` recibe opcionalmente `onLogout?: () => void` y `cerrandoSesion?: boolean` para mantener compatibilidad con los tests existentes de `bootstrap-frontend` y mostrar el botón `Cerrar sesión` tanto en la barra lateral de escritorio como en la barra superior móvil (`aria-label="Cerrar sesión"`).

### 4. Dependencias y fronteras (`arquitectura-inicial.md`)
- `features/identidad/` solo importa de `src/api/generated/identidad/`, `src/api/http.ts`, `src/shared/components/` y `src/app/ThemeProvider.tsx`. No importa de otras `features/`.

## Plan de Pruebas por Capa (`tdd.md`)

| Capa | Qué se prueba | Herramienta | Tipo |
| :--- | :--- | :--- | :--- |
| **Reglas de formulario** (`validaciones.ts`, `preferenciasAvisos.ts`) | Validación de DNI 8 dígitos, código 6 chars, contraseña >= 8, coincidencia, privacidad aceptada y persistencia de avisos/DNI en `localStorage` | `Vitest` | Unitaria pura |
| **Flujos de acceso** (`IngresoPage`, `FormLogin`, `FormActivarCuenta`, `ModalPrivacidad`) | Login exitoso, errores locales y `401` desde API, ayuda de clave olvidada, apertura de modal de privacidad, activación exitosa y errores de activación | `Vitest` + `RTL` + `MSW` | Componentes + red simulada |
| **Guarda de sesión y logout** (`App` / `RequiereSesion`, `PortalLayout`) | Redirección a `/ingresar` sin sesión, renderizado con usuario real de `sesion` y cierre de sesión limpiando caché | `Vitest` + `RTL` + `MSW` | Integración UI |
| **Configuración** (`ConfiguracionPage`) | Datos personales en solo lectura sin `input[type="file"]`, cambio de tema, toggles de avisos persistentes y cambio de contraseña (éxito y error API) | `Vitest` + `RTL` + `MSW` | Componentes + red simulada |

## Risks / Trade-offs

- **Sesión en memoria de pruebas:** En el entorno actual con backend stub (`GET /identidad/sesion` siempre devuelve `autenticado: true`), cuando se ejecute contra el stub en desarrollo sin cookie real siempre entrará como autenticado hasta que `identidad` del backend implemente el JWT en `__session`. Mitigación: las pruebas automatizadas con MSW cubren explícitamente tanto el estado autenticado (`200`) como el no autenticado (`401`).
