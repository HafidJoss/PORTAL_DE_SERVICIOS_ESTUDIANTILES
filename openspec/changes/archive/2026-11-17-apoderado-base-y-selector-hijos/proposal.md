# Proposal

## Why

Con los portales de `Estudiante v2` (Fase 1) y `Docente` (Fase 2) completados, el siguiente rol operativo definido en [Portal Apoderado.dc.html](../../../prototipos/Portal%20Apoderado.dc.html) corresponde a **Apoderado (`Portal de Familias`)**, cuya necesidad central es seguir de forma continua a uno o más hijos vinculados (`RF01`, `HU01`, `DA05`) desde un único acceso por DNI. Este primer bloque establece la sesión familiar multi-hijo, el selector persistente de menor en la navegación y la bandeja de entrada familiar con confirmación de lectura.

## What Changes

- **Identidad y vínculo multi-hijo (`identidad`)**:
  - Ampliar `UsuarioSesionOut` en `backend/app/modules/identidad/schemas.py` con `apoderado_id` y `hijos_vinculados: list[HijoVinculadoOut]` (`estudiante_id`, `codigo`, `nombres`, `apellidos`, `grado_seccion`, `iniciales`, `tutor`), incorporando la credencial de prueba para `Apoderado` (`40871256`) en `POST /api/v1/identidad/login`.
  - Extender `shared/utilidades/sesion.ts` (`resolverApoderadoId`, `resolverHijoActivo`) y adaptar `ConfiguracionVista` (`features/identidad/`) para mostrar al apoderado su ficha en solo lectura junto a la nómina de menores vinculados, manteniendo excluida la carga de foto de perfil (`RC08`).
- **Selector de menor en navegación y tablero familiar (`seguimiento`, `plataforma-web`)**:
  - Ampliar `MarcoPortal` (`shared/componentes/marcoPortal.tsx`) con un bloque opcional de contexto superior/lateral para alternar el hijo seleccionado (`Viendo a: <Nombre> · <Sección>` → `Cambiar de menor`) en escritorio y móvil sin alterar los portales `Estudiante` y `Docente`.
  - Exponer en `backend/app/modules/seguimiento/` los endpoints contractuales `GET /api/v1/seguimiento/apoderados/{apoderado_id}/hijos/{estudiante_id}/inicio` (bandeja familiar combinada `Institución` + `Asistencia` + `Docentes`, KPIs, próximas entregas y validación `403` si el menor no pertenece al apoderado `DA05`) y `POST /api/v1/seguimiento/apoderados/{apoderado_id}/comunicados/{comunicado_id}/confirmar-lectura`.
  - Implementar `filtrosBandejaApoderado.ts` y `InicioApoderadoVista` (`features/seguimiento/`) con filtros (`Todos`, `No leídos`, `Institución`, `Docentes`), `Marcar todo como leído`, `Confirmar lectura` en comunicados de Dirección y accesos a próximas entregas, asistencia y libreta del menor activo.
  - Configurar las rutas protegidas de `Apoderado` en `app/aplicacion.tsx` (`/inicio`, `/configuracion` y vistas puente temporales para `/cursos`, `/calificaciones`, `/trabajos`, `/asistencia`, `/mensajes` y `/libreta` hasta los bloques 2 y 3).
- **Fuera de alcance en este bloque (`Bloque 2`, `Bloque 3`, `RC08`)**:
  - Vistas académicas multi-hijo reutilizadas (`/cursos`, `/calificaciones`, `/trabajos`, `/mensajes`, `/libreta`), que pertenecen a `apoderado-vistas-academicas-multi-hijo` (Bloque 2).
  - Envío de justificaciones de asistencia en texto (`/asistencia`), que pertenece a `apoderado-asistencia-y-justificaciones` (Bloque 3).
  - Subida de foto de perfil o archivos adjuntos (`RC08`) y persistencia real PostgreSQL/Alembic (Fase 5).

## Capabilities

### New Capabilities

*(Ninguna: amplía las capacidades vigentes `identidad`, `seguimiento` y `plataforma-web` en `openspec/specs/`.)*

### Modified Capabilities

- `identidad`: ingreso por DNI para `Apoderado`, exposición de `apoderado_id` y `hijos_vinculados` (N:M), y visualización de configuración familiar con menores vinculados sin subida de foto (`RF01`, `RF14`, `RC08`, `AC04`, `DA05`).
- `seguimiento`: tablero inicial y bandeja familiar por hijo seleccionado con filtros, confirmación de lectura de comunicados institucionales y validación de pertenencia apoderado-hijo (`RF01`, `RF25`, `RF26`, `HU01`, `AC01`, `DA05`).
- `plataforma-web`: selector persistente de menor en `MarcoPortal` para escritorio/móvil, rutas protegidas del rol `Apoderado` y ampliación del contrato OpenAPI bajo `/api/v1` (`RC01`, `RC03`, `AC06`, `AC07`).

## Impact

- **IDs atendidos:** `RF01`, `RF14`, `RF25`, `RF26`, `HU01`, `AC01`, `AC04`, `AC06`, `AC07`, `RC01`, `RC03`, `RC08`, `DA05`, `ADR-008`.
- **Backend (`backend/`):** `app/modules/identidad/{schemas.py,router.py}`, `app/modules/seguimiento/{schemas.py,router.py}`, `openapi.json`, `tests/core/test_integracion_salud_y_errores.py`, `tests/identidad/test_integracion_contrato_identidad.py` y `tests/seguimiento/test_integracion_contrato_seguimiento.py`.
- **Frontend (`frontend/src/`):** regeneración Orval en `api/generated/`, extensiones en `shared/{componentes/marcoPortal.tsx,utilidades/sesion.ts}`, actualización de `features/identidad/`, nuevas utilidades/componentes/vistas en `features/seguimiento/`, y enrutamiento de `Apoderado` en `app/aplicacion.tsx` + `app/pruebas/`.
- **Frontera `ADR-008`:** `identidad` y `seguimiento` mantienen cero dependencias cruzadas o ciclos; el estado del menor seleccionado se coordina en `app/aplicacion.tsx` y se inyecta por props hacia `MarcoPortal` y `InicioApoderadoVista`.
