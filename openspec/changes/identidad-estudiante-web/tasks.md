# Tasks

## 1. Reglas de validación y preferencias locales (`features/identidad/`)

- [x] 1.1 [Rojo] Escribir pruebas unitarias puras en `frontend/src/features/identidad/__tests__/validaciones.test.ts` para `validarLogin` (DNI 8 dígitos, contraseña no vacía), `validarActivacion` (DNI, código de 6 caracteres, contraseña >= 8, coincidencia, aceptación de privacidad) y `validarCambioContrasena` (actual no vacía, nueva >= 8, coincidencia).
- [x] 1.2 [Verde] Implementar `frontend/src/features/identidad/validaciones.ts` y verificar que las pruebas pasan.
- [x] 1.3 [Rojo] Escribir pruebas unitarias en `frontend/src/features/identidad/__tests__/preferenciasAvisos.test.ts` para carga/guardado de los 4 interruptores de avisos (`calif`, `tareas`, `asist`, `obs`) y persistencia opcional del DNI recordado en `localStorage`.
- [x] 1.4 [Verde] Implementar `frontend/src/features/identidad/preferenciasAvisos.ts` y verificar que las pruebas pasan.

## 2. Pantalla de Ingreso, Activación y Aviso de Privacidad (`/ingresar`)

- [x] 2.1 [Rojo] Escribir pruebas en `frontend/src/features/identidad/__tests__/IngresoPage.test.tsx` (Vitest + RTL + MSW) para los escenarios de login exitoso con redirección a `/inicio`, error de validación local, error `401` Problem Details desde la API, mostrar/ocultar contraseña y ayuda "¿Olvidaste tu contraseña?".
- [x] 2.2 [Verde] Implementar `FormLogin.tsx` e `IngresoPage.tsx` (conectados a `useIniciarSesionApiV1IdentidadLoginPost`), verificando que las pruebas de login pasan.
- [x] 2.3 [Rojo] Ampliar `IngresoPage.test.tsx` con los escenarios de la pestaña `Activar cuenta`: apertura del diálogo "Aviso de privacidad" leyendo `GET /api/v1/identidad/aviso-privacidad`, validaciones de bloqueo, activación exitosa (`POST /api/v1/identidad/activar`) mostrando "Cuenta activada" y paso a `Ir a ingresar`.
- [x] 2.4 [Verde] Implementar `ModalPrivacidad.tsx` y `FormActivarCuenta.tsx` dentro de `IngresoPage.tsx`, verificando que todas las pruebas de ingreso y activación pasan.

## 3. Guarda de sesión, datos reales y cierre de sesión (`App.tsx`, `PortalLayout.tsx`)

- [x] 3.1 [Rojo] Escribir pruebas de integración en `frontend/src/features/identidad/__tests__/SesionYLogout.test.tsx` (Vitest + RTL + MSW) para: redirección a `/ingresar` cuando `GET /api/v1/identidad/sesion` responde `401`, renderizado de nombre/iniciales/detalle reales del estudiante autenticado en `PortalLayout`, y acción "Cerrar sesión" (`POST /api/v1/identidad/logout`) limpiando caché y redirigiendo a `/ingresar`.
- [x] 3.2 [Verde] Agregar soporte opcional `onLogout` en `PortalLayout.tsx` (escritorio y móvil) e implementar `RequiereSesion` en `frontend/src/app/App.tsx` (conectado a `useObtenerSesionApiV1IdentidadSesionGet` y `useCerrarSesionApiV1IdentidadLogoutPost`), verificando que las pruebas pasan.

## 4. Pantalla de Configuración del Estudiante (`/configuracion`)

- [x] 4.1 [Rojo] Escribir pruebas en `frontend/src/features/identidad/__tests__/ConfiguracionPage.test.tsx` (Vitest + RTL + MSW) para: avatar de iniciales sin subida de foto (`input[type="file"]` ausente), datos personales en solo lectura con aviso de Secretaría, cambio de tema claro/oscuro, persistencia de interruptores de avisos, cambio exitoso de contraseña y manejo de error Problem Details desde `POST /api/v1/identidad/cambiar-contrasena`.
- [x] 4.2 [Verde] Implementar `frontend/src/features/identidad/pages/ConfiguracionPage.tsx` y conectarla en `frontend/src/app/App.tsx`, verificando que las pruebas pasan.

## 5. Verificación integral

- [x] 5.1 [Refactor] Revisar accesibilidad, manejo de errores en `/ingresar` (sin bucle de redirección ante `401` en login) y ausencia de acoplamientos fuera de `identidad`, `shared/` y `api/`.
- [x] 5.2 [Verificación] Ejecutar `npm test` (`vitest run`), `npm run build` (`tsc -b && vite build`) en `frontend/`, `pytest` en `backend/` y `openspec validate identidad-estudiante-web --strict` para confirmar todo en verde.
