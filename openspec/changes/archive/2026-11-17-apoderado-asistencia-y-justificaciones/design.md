# Design

## Context

Con los Bloques 1 y 2 concluidos, `Portal de Familias` cuenta con todas sus rutas activas salvo `/asistencia`, que aún utiliza `VistaPuenteApoderado` en `frontend/src/app/aplicacion.tsx`. En paralelo, `backend/app/modules/asistencia/` y `frontend/src/features/asistencia/vistas/asistenciaVista.tsx` atienden únicamente a `Estudiante` mediante `resolverEstudianteId(usuario)` sin soporte multi-hijo ni envío de justificaciones.

## Goals / Non-Goals

**Goals:**
- Habilitar la consulta mensual de asistencia multi-hijo (`est-demo-1` y `est-demo-2`) con guardia `DA05` (`403 Problem Details`).
- Habilitar el flujo completo de justificación escrita del apoderado (`RF20`, `RC08`: chips de motivo + texto `>= 5` caracteres, sin `<input type="file">`) con persistencia optimista en caché y estado `Justificación enviada · en revisión`.
- Preservar íntegramente el comportamiento solo lectura para `Estudiante` (`testIntegracionAsistenciaVista.test.tsx`).
- Retirar `VistaPuenteApoderado` de `aplicacion.tsx` al activar `/asistencia`.

**Non-Goals:**
- Aprobación/rechazo de justificaciones ni registro diario del Auxiliar (fase posterior).
- Subida o adjunto de certificados médicos digitales (`RC08`).

## Decisions

### 1. Extensión contractual de `backend/app/modules/asistencia/`
- **`schemas.py`**:
  - Ampliar `IncidenciaAsistenciaOut` con campos con valor por defecto para no romper el contrato previo: `id: str = ""`, `puede_justificar: bool = False` y `justificacion_enviada: bool = False`.
  - Añadir `JustificacionCreateIn(incidencia_id: str, motivo: str, detalle: str = Field(..., min_length=5, max_length=500))` y `JustificacionOut(id: str, incidencia_id: str, estudiante_id: str, estado: Literal["en_revision", "aprobada", "rechazada"], motivo: str, detalle: str, mensaje: str)`.
- **`router.py`**:
  - `GET /api/v1/asistencia/estudiantes/{estudiante_id}` acepta `apoderado_id: str | None = None`, valida `validar_pertenencia_apoderado(apoderado_id, estudiante_id)` (`app.core.pertenencia`, respetando `ADR-008`) y devuelve datos diferenciados por estudiante (`est-demo-1` en `3.° B` con incidencias `inc-t1` `T` justificable y `inc-fj1` `FJ`; `est-demo-2` en `1.° A` con incidencia `inc-sof-t1` `T` justificable y porcentaje `98%`).
  - `POST /api/v1/asistencia/apoderados/{apoderado_id}/hijos/{estudiante_id}/justificaciones` (`status_code=201`, `response_model=JustificacionOut`) valida `validar_pertenencia_apoderado(apoderado_id, estudiante_id)` (`403 DA05`), comprueba existencia de `incidencia_id` (`404 ErrorAplicacion` si no existe), verifica que sea justificable (`400 ErrorAplicacion` si ya fue justificada) y devuelve `JustificacionOut(estado="en_revision", mensaje="Justificación enviada al auxiliar de educación.", ...)`.
  - Se actualiza `backend/tests/core/test_integracion_salud_y_errores.py` añadiendo la nueva ruta (`39` rutas totales).

### 2. Lógica pura en `frontend/src/features/asistencia/utilidades/justificacionesAsistencia.ts`
- Centraliza sin dependencias de React ni de DOM:
  - `MOTIVOS_JUSTIFICACION`: catálogo acotado (`Salud / Cita médica`, `Motivo familiar`, `Transporte`, `Otro motivo`).
  - `puedeJustificarIncidencia(incidencia, esApoderado)`: verdadero únicamente cuando `esApoderado === true`, `codigo === "T" || codigo === "F"`, `!incidencia.justificacion_enviada` y `(incidencia.puede_justificar ?? true)` (asegurando que `Estudiante` nunca pueda justificar).
  - `validarJustificacionTexto(motivo, detalle)`: exige motivo seleccionado y `detalle.trim().length >= 5 && detalle.trim().length <= 500`.

### 3. Generalización de `AsistenciaVista` y retiro del último puente en `aplicacion.tsx`
- `AsistenciaVista` acepta `{ usuario, hijoActivoId?: string | null }`:
  - Resuelve `{ estudianteId, apoderadoId } = resolverContextoEstudiante(usuario, hijoActivoId)` y `esApoderado = usuario.rol === "Apoderado"`.
  - Pasa `apoderadoId ? { mes: mesActivo, anio: 2026, apoderado_id: apoderadoId } : { mes: mesActivo, anio: 2026 }` al hook Orval generado y usa el mismo parámetro al actualizar/invalidar caché tras enviar una justificación.
  - Cuando `esApoderado` es `true`, las incidencias elegibles renderizan el botón `Justificar`, que despliega inline los chips de motivo y el `<textarea>` (`RC08`, sin `<input type="file">`) más `Cancelar` / `Enviar al auxiliar`. Tras confirmar `201`, la caché actualiza la incidencia con `justificacion_enviada: true, puede_justificar: false` mostrando la etiqueta `Justificación enviada · en revisión`.
- En `frontend/src/app/aplicacion.tsx`, se elimina `VistaPuenteApoderado` y `/asistencia` en la rama `Apoderado` renderiza `<AsistenciaVista usuario={usuario} hijoActivoId={hijoActivo?.estudiante_id} />`.

### 4. Plan de pruebas por capa (`ADR-008`, `tdd.md`)
- **Backend (integración API)**: ampliación de `backend/tests/asistencia/test_integracion_contrato_asistencia.py` cubriendo consulta diferenciada `est-demo-1` vs `est-demo-2`, envío válido (`201`), validación Pydantic `< 5` chars (`422`), incidencia inexistente (`404`), ya justificada (`400`) y pertenencia `DA05` (`403`) en `GET` y `POST`, más `test_integracion_salud_y_errores.py` (`39` rutas).
- **Frontend unitario**: nuevo `frontend/src/features/asistencia/pruebas/testUnitarioJustificacionesAsistencia.test.ts` probando `MOTIVOS_JUSTIFICACION`, `puedeJustificarIncidencia` (por rol y estado) y `validarJustificacionTexto`.
- **Frontend integración**: ampliación de `frontend/src/features/asistencia/pruebas/testIntegracionAsistenciaVista.test.tsx` probando consulta multi-hijo de `Apoderado`, cambio de `hijoActivoId`, validación `< 5` caracteres, envío `201` con transición a `"Justificación enviada · en revisión"`, error recuperable de servidor y cero `<input type="file">` (`RC08`).
- **Frontend E2E (`MemoryRouter` + MSW)**: ampliación o nuevo `frontend/src/app/pruebas/testE2eRecorridoApoderadoAsistencia.test.tsx` y actualización de `testE2eRecorridoApoderadoBase.test.tsx` / `testE2eRecorridoApoderadoAcademico.test.tsx` confirmando que `/asistencia` ya renderiza `AsistenciaVista` real para `Apoderado`, soporta cambio de menor y justificación sin vistas puente restantes.

## Risks / Trade-offs

- **Consistencia de `testE2eRecorridoApoderadoBase.test.tsx` y `testE2eRecorridoApoderadoAcademico.test.tsx`**: ambos verificaban `Módulo en preparación` al visitar `/asistencia` como puente pendiente del Bloque 3; al activarse la vista real, dichas pruebas deben actualizarse para comprobar `Asistencia` real (con su mock MSW mensual) y verificar la eliminación definitiva de puentes en Fase 3.
- **Compatibilidad hacia atrás en `IncidenciaAsistenciaOut`**: agregar `id`, `puede_justificar` y `justificacion_enviada` con valores por defecto evita romper las pruebas o fixtures de Fase 1 en `testIntegracionAsistenciaVista.test.tsx`.
