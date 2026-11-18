# Design

## Context

Véase [proposal.md](proposal.md). En el estado actual del repositorio (tras el cierre de la Fase 2):
- `backend/app/modules/identidad/` modela `Estudiante` y `Docente` en `UsuarioSesionOut`; el literal `RolUsuario` ya incluye `"Apoderado"`.
- `backend/app/modules/seguimiento/` atiende `estudiantes/{id}` y `docentes/{id}` en `36` rutas totales de `backend/openapi.json`.
- `frontend/src/shared/componentes/marcoPortal.tsx` acepta `subtituloPortal`, `navItems` y `navMovilItems`; `app/aplicacion.tsx` enruta por `usuario.rol`.

## Goals / Non-Goals

**Goals:**
- Modelar la relación N:M (`hijos_vinculados`) de forma aditiva sin romper ningún contrato o prueba existente de `Estudiante` o `Docente`.
- Implementar el selector de menor en `MarcoPortal` mediante props opcionales (`selectorHijos` o `bannerContextual`) reutilizables y accesibles tanto en `<aside>`/`<header>` móvil.
- Garantizar el aislamiento modular `ADR-008`: `identidad` y `seguimiento` siguen desacoplados; `app/aplicacion.tsx` mantiene el estado `hijoActivoId` por sesión.

**Non-Goals:**
- Vistas reutilizadas `/cursos`, `/calificaciones`, `/trabajos`, `/mensajes`, `/libreta` para Apoderado (`Bloque 2`).
- Formulario de justificaciones de asistencia (`Bloque 3`).
- Subida de foto de perfil o archivos (`RC08`), y persistencia real en PostgreSQL (Fase 5).

## Decisions

### 1. Extensión de contratos en `identidad` y `seguimiento` (`backend/`)
- **`backend/app/modules/identidad/`**:
  - Añadir `HijoVinculadoOut(estudiante_id, codigo, nombres, apellidos, grado_seccion, iniciales, tutor)` y campos opcionales `apoderado_id: str | None = None` e `hijos_vinculados: list[HijoVinculadoOut] = []` en `UsuarioSesionOut`.
  - En `_usuario_demo(dni)`: si `dni == "40871256"`, devolver perfil `"Apoderado"` (`apoderado_id="apo-demo-1"`, `nombres="Rosa"`, `apellidos="Huamán Ccori"`) con `est-demo-1` (`Luis Ángel Quispe Huamán · 3.° de Secundaria B`) y `est-demo-2` (`Sofía Quispe Huamán · 1.° de Secundaria A`).
- **`backend/app/modules/seguimiento/`**:
  - `GET /api/v1/seguimiento/apoderados/{apoderado_id}/hijos/{estudiante_id}/inicio` → `InicioApoderadoOut` (`apoderado_id`, `estudiante_id`, `estudiante_nombre`, `grado_seccion`, `sin_leer`, `pendientes_total`, `asistencia_porcentaje`, `mensajes_bandeja`, `proximas_entregas`, `resumen_asistencia`). Si `(apoderado_id, estudiante_id)` no corresponde al vínculo permitido (`est-demo-1`, `est-demo-2` para `apo-demo-1`), responder `403 ErrorAplicacion` (`DA05`).
  - `POST /api/v1/seguimiento/apoderados/{apoderado_id}/comunicados/{comunicado_id}/confirmar-lectura` → `OperacionBandejaOut` (`404 ErrorAplicacion` si el comunicado no existe).

### 2. Selector multi-hijo y estado de sesión en frontend (`shared/`, `identidad/`, `seguimiento/`, `app/`)
- **`shared/utilidades/sesion.ts`**:
  - Añadir `resolverApoderadoId(usuario)` y `resolverHijoActivo(usuario, hijoActivoId?)` devolviendo el `HijoVinculadoOut` seleccionado (o el primero si no hay coincidencia).
- **`shared/componentes/marcoPortal.tsx`**:
  - Añadir props opcionales `selectorContexto?: { etiqueta: string; opciones: readonly { id: string; titulo: string; subtitulo: string; iniciales: string }[]; activoId: string; onCambiar: (id: string) => void }`. Si existe, renderiza un menú accesible `Cambiar de menor` (`aria-label`) tanto en la barra lateral/superior de escritorio como en la cabecera móvil sin desbordar `360x640 px` (`AC07`).
- **`features/identidad/vistas/configuracionVista.tsx`**:
  - Cuando `usuario.rol === "Apoderado"`, muestra sus datos personales, lista de `hijos_vinculados` en solo lectura y los avisos configurables de familias (sin `<input type="file">`, `RC08`).
- **`features/seguimiento/`**:
  - `utilidades/filtrosBandejaApoderado.ts` (puro): `filtrarBandejaApoderado(mensajes, filtro)` (`todos | no_leidos | institucion | docentes`) y `contarNoLeidosApoderado(mensajes)`.
  - `componentes/bandejaApoderado.tsx` y `vistas/inicioApoderadoVista.tsx`: banner con saludo `"Hola, Rosa"`, resumen KPI, bandeja filtrable con `Marcar todo como leído` y botón `Confirmar lectura` en comunicados que lo soliciten (`i1`), más tarjetas laterales de resumen (`Asistencia`, `Libreta`).
- **`app/aplicacion.tsx`**:
  - Estado `hijoActivoId` sincronizado con `resolverHijoActivo(usuario, hijoActivoId)`. Al cambiar de hijo desde una ruta de detalle (`/cursos/:id`), navega a `/cursos` (patrón `Portal Apoderado.dc.html`). Rutas puente temporales para `/cursos`, `/calificaciones`, `/trabajos`, `/asistencia`, `/mensajes`, `/libreta` hasta bloques 2 y 3.

### 3. Plan de pruebas por capa (`tdd.md`)
- **Backend (`backend/tests/`):**
  - `test_integracion_salud_y_errores.py`: actualizar conteo OpenAPI (`36 + 2 = 38` rutas).
  - `test_integracion_contrato_identidad.py`: login apoderado (`40871256`) devuelve `rol="Apoderado"` y 2 `hijos_vinculados`.
  - `test_integracion_contrato_seguimiento.py`: `GET .../apoderados/apo-demo-1/hijos/{id}/inicio` (`200` para `est-demo-1` y `est-demo-2`, `403` para `est-ajeno`), `POST .../confirmar-lectura` (`200` y `404`).
- **Frontend (`frontend/src/**/pruebas/`):**
  - `shared/pruebas/testUnitarioSesion.test.ts` + `testComponenteMarcoPortal.test.tsx`: `resolverApoderadoId`, `resolverHijoActivo` y alternancia de menor en `MarcoPortal`.
  - `identidad/pruebas/testIntegracionConfiguracionVista.test.tsx`: ficha de apoderado con hijos vinculados sin foto (`RC08`).
  - `seguimiento/pruebas/testUnitarioFiltrosBandejaApoderado.test.ts` + `testIntegracionInicioApoderadoVista.test.tsx`: filtros de bandeja, `Confirmar lectura`, cambio de hijo y error/reintento.
  - `app/pruebas/testE2eRecorridoApoderadoBase.test.tsx`: login como apoderado, cambio entre hijos en `MarcoPortal`, vista de inicio, configuración y cierre de sesión.

## Risks / Trade-offs

- **[Vistas puente temporales en rutas académicas del apoderado]** → Mitigado dejando rutas explícitas con vista informativa hasta implementar Bloque 2 (`apoderado-vistas-academicas-multi-hijo`) y Bloque 3 (`apoderado-asistencia-y-justificaciones`).
- **[Cambios de menor desde subrutas]** → Centralizar `onCambiarHijo` en `app/aplicacion.tsx` garantiza que cualquier cambio de hijo limpie rutas de detalle (`/cursos/:id` → `/cursos`) sin dejar vistas inconsistentes con el hijo anterior.
