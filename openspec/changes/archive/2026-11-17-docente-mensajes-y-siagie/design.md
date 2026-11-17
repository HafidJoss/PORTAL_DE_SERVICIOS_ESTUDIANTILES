# Design

## Context

Véase [proposal.md](proposal.md). Con `docente-base-y-seguimiento` y `docente-evaluacion-y-clases` completados:
- El backend cuenta con `33` rutas OpenAPI contractuales y solo faltan los contratos de envío docente en `evaluacion` (`mensajes`) y exportación trimestral por sección en `reportes` (`siagie`).
- En `frontend/src/app/aplicacion.tsx`, únicamente `/mensajes` y `/siagie` siguen apuntando al componente temporal `VistaPuenteDocente`.
- En `reportes/schemas.py` ya existe `UrlDescargaOut` (`url_firmada`, `expira_en_segundos`, `nombre_archivo`) para descargas con enlace temporal firmado (`RC05`).

## Goals / Non-Goals

**Goals:**
- Habilitar la mensajería saliente docente (`Tarea` y `Recordatorio` a sección completa o estudiante puntual + apoderado) manteniendo estricto cumplimiento de `RC08` (sin adjuntos ni chat libre).
- Habilitar el panel de exportación SIAGIE y Actas preliminares por trimestre (`I`, `II`, `III`) reutilizando `UrlDescargaOut` (`RC05`) y validando que la sección cuente con sus `4/4` competencias confirmadas.
- Mantener la independencia modular `ADR-008`: `evaluacion` y `reportes` sin importaciones cruzadas ni ciclos; navegación desde alertas de cierre de SIAGIE mediante rutas (`/cursos/:seccionId?tab=cierre`).

**Non-Goals / Bloqueos declarados:**
- Generación binaria real del formato oficial SIAGIE en Excel (`RC06`): bloqueada hasta recibir la plantilla oficial del colegio en Fase 5; en Fase 2 se entrega contrato stub + validación de completitud + enlace firmado `UrlDescargaOut`.
- Persistencia en PostgreSQL o encolado asíncrono de generación masiva de actas en `core/` (Fase 5).

## Decisions

### 1. Contratos OpenAPI en `evaluacion` y `reportes` (`backend/`)
- **`backend/app/modules/evaluacion/`**:
  - `GET /api/v1/evaluacion/docentes/{docente_id}/mensajes` → `BandejaEnviadosDocenteOut`: catálogo de secciones (`3A`, `3B`, `4A`, `4C`) con nómina mínima de destinatarios (`indice`, `nombre`) y lista inicial cronológica de mensajes enviados (`id`, `tipo`, `seccion_id`, `destinatario`, `asunto`, `cuerpo`, `fecha`).
  - `POST /api/v1/evaluacion/docentes/{docente_id}/mensajes` (`status_code=201`) → `MensajeEnviadoDocenteOut`: recibe `MensajeDocenteCreateIn` (`tipo: "Tarea" | "Recordatorio"`, `seccion_id`, `estudiante_idx: int | None`, `asunto` mín. 3 chars tras `.strip()`, `cuerpo` mín. 5 chars tras `.strip()`). Valida sección conocida (`404 ErrorAplicacion` si no existe) y formato (`422` Problem Details).
- **`backend/app/modules/reportes/`**:
  - `GET /api/v1/reportes/docentes/{docente_id}/siagie` → `ResumenSiagieDocenteOut`: `asignatura`, lista de trimestres (`1`, `2`, `3`) con estado por sección (`seccion_id`, `nombre`, `estudiantes_total`, `competencias_confirmadas`, `competencias_total`, `listo_para_exportar`). En `T1` y `T2` figuran cerradas (`4/4`); en `T3` reflejan el estado actual del piloto (`3A` = `4/4`, `4A` = `1/4`, `3B` y `4C` = `0/4`).
  - `POST /api/v1/reportes/docentes/{docente_id}/siagie/{seccion_id}/descarga` → `UrlDescargaOut`: recibe `SolicitudDescargaSiagieIn` (`trimestre_id: Literal[1, 2, 3]`, `formato: Literal["excel_siagie", "acta_preliminar"]`). Si `seccion_id` no existe responde `404 ErrorAplicacion`; si en el trimestre aún faltan competencias por confirmar (`< 4`), rechaza con `400 ErrorAplicacion`; si está lista (`4/4`), responde `UrlDescargaOut` con TTL `900` segundos (`RC05`).

### 2. Reglas puras y vistas frontend (`evaluacion/` y `reportes/`)
- **`frontend/src/features/evaluacion/utilidades/filtrosMensajesDocente.ts`** (puro, sin React):
  - `validarFormularioMensajeDocente({ asunto, cuerpo })`: exige asunto >= 3 caracteres y cuerpo >= 5 caracteres (`RF25`).
  - `describirAlcanceDestinatario(seccionNombre, totalEstudiantes, estudianteNombre?)`: construye el mensaje informativo exacto del prototipo (`"Llegará a N estudiantes y sus apoderados"` vs `"Llegará al estudiante y su apoderado"`).
- **`frontend/src/features/evaluacion/vistas/mensajesDocenteVista.tsx`**:
  - Layout en dos columnas responsivas: redactor (`Tarea`/`Recordatorio`, chips de sección, `<select>` de destinatario, asunto, mensaje, cero inputs `type="file"`) e historial cronológico `Enviados`.
- **`frontend/src/features/reportes/utilidades/estadoSiagie.ts`** (puro, sin React):
  - `esSeccionListaSiagie(sec)` y `obtenerMensajeEstadoSiagie(sec, trimestreId)`: calcula estado (`"Listo para exportar"` vs `"Faltan N competencias"`) y nota explicativa por trimestre (`RC06`).
- **`frontend/src/features/reportes/vistas/exportarSiagieVista.tsx`**:
  - Selector `I Trim. / II Trim. / III Trim.`, lista de secciones asignadas con acciones `Excel SIAGIE` y `Acta preliminar` (si `listo_para_exportar=true`, llama `POST .../descarga` y muestra enlace firmado con vigencia 15 min; si falta confirmar competencias, redirige a `/cursos/${sec.seccion_id}?tab=cierre`).

### 3. Plan de pruebas por capa (`tdd.md`)
- **Backend (`backend/tests/`):**
  - `test_integracion_salud_y_errores.py`: actualizar conteo de rutas OpenAPI (`33 + 4 = 37`).
  - `test_integracion_contrato_evaluacion.py`: `GET`/`POST /docentes/{id}/mensajes` (`200`, `201`, `422` y `404` por sección inválida).
  - `test_integracion_contrato_reportes.py`: `GET /docentes/{id}/siagie` (`200`), `POST .../descarga` listo (`200` `UrlDescargaOut`), incompleto (`400`) y sección desconocida (`404`).
- **Frontend (`frontend/src/**/pruebas/`):**
  - `evaluacion/pruebas/testUnitarioMensajesDocente.test.ts`: validaciones puras y textos de alcance.
  - `evaluacion/pruebas/testIntegracionMensajesDocenteVista.test.tsx`: selección de sección/estudiante, envío de mensaje y ausencia de `<input type="file">`.
  - `reportes/pruebas/testUnitarioEstadoSiagie.test.ts`: disponibilidad por trimestre y mensajes `Faltan N competencias`.
  - `reportes/pruebas/testIntegracionExportarSiagieVista.test.tsx`: cambio de trimestre, descarga firmada `Excel SIAGIE`/`Acta preliminar` y navegación a `/cursos/:id?tab=cierre` si falta confirmar.
  - `app/pruebas/testE2eRecorridoDocenteBase.test.tsx`: ampliar recorrido E2E verificando `/mensajes` y `/siagie` reales (retirando `VistaPuenteDocente`).

## Risks / Trade-offs

- **[Bloqueo externo RC06 sin plantilla `.xlsx` oficial en el repositorio]** → Mitigado manteniendo el contrato tipado `UrlDescargaOut` de Fase 2 alineado con `libretaVista.tsx`, documentando el bloqueo explícitamente para que la fase de persistencia/reportes (Fase 5) conecte el generador `openpyxl` sin romper el frontend ni OpenAPI.
- **[Duplicación mínima de catálogo piloto de secciones entre `evaluacion` y `reportes`]** → Se mantiene encapsulado como constante interna privada en cada router stub (`ADR-008`), evitando dependencias cruzadas entre módulos de dominio en esta fase sin BD.
