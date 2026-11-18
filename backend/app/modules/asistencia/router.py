"""Endpoints contractuales (stub) del módulo de asistencia."""

from fastapi import APIRouter, Query, status

from app.core.errores import ErrorAplicacion
from app.core.pertenencia import validar_pertenencia_apoderado

from .schemas import (
    AsistenciaMesOut,
    DiaAsistenciaOut,
    IncidenciaAsistenciaOut,
    JustificacionCreateIn,
    JustificacionOut,
    KpisAsistenciaOut,
)

router = APIRouter(prefix="/asistencia", tags=["asistencia"])


def _incidencias_demo(estudiante_id: str) -> list[IncidenciaAsistenciaOut]:
    if estudiante_id == "est-demo-2":
        return [
            IncidenciaAsistenciaOut(
                id="inc-sof-t1",
                fecha="Mar 10 nov",
                codigo="T",
                nombre_estado="Tardanza",
                detalle="Ingreso 07:54 a primera hora.",
                puede_justificar=True,
                justificacion_enviada=False,
            ),
        ]
    return [
        IncidenciaAsistenciaOut(
            id="inc-t1",
            fecha="Mié 4 nov",
            codigo="T",
            nombre_estado="Tardanza",
            detalle="Ingreso 08:09.",
            puede_justificar=True,
            justificacion_enviada=False,
        ),
        IncidenciaAsistenciaOut(
            id="inc-fj1",
            fecha="Vie 6 nov",
            codigo="FJ",
            nombre_estado="Falta justificada",
            detalle="Cita médica justificada por el apoderado.",
            puede_justificar=False,
            justificacion_enviada=True,
        ),
    ]


@router.get("/estudiantes/{estudiante_id}", response_model=AsistenciaMesOut)
def obtener_asistencia_mensual(
    estudiante_id: str,
    mes: int = Query(default=11, ge=1, le=12),
    anio: int = Query(default=2026, ge=2020, le=2100),
    apoderado_id: str | None = None,
) -> AsistenciaMesOut:
    """Devuelve KPIs, calendario mensual e incidencias de asistencia (RF20, DA05)."""
    validar_pertenencia_apoderado(apoderado_id, estudiante_id)
    if estudiante_id == "est-demo-2":
        return AsistenciaMesOut(
            estudiante_id=estudiante_id,
            mes=mes,
            anio=anio,
            seccion="1.° A",
            kpis=KpisAsistenciaOut(
                porcentaje="98%",
                presentes=10,
                tardanzas=1,
                faltas=0,
                justificadas=0,
            ),
            dias=[
                DiaAsistenciaOut(dia=2, codigo="P", nombre_estado="Presente"),
                DiaAsistenciaOut(dia=10, codigo="T", nombre_estado="Tardanza"),
            ],
            incidencias=_incidencias_demo(estudiante_id),
        )
    return AsistenciaMesOut(
        estudiante_id=estudiante_id,
        mes=mes,
        anio=anio,
        seccion="3.° B",
        kpis=KpisAsistenciaOut(
            porcentaje="96%",
            presentes=8,
            tardanzas=1,
            faltas=0,
            justificadas=1,
        ),
        dias=[
            DiaAsistenciaOut(dia=2, codigo="P", nombre_estado="Presente"),
            DiaAsistenciaOut(dia=4, codigo="T", nombre_estado="Tardanza"),
            DiaAsistenciaOut(dia=6, codigo="FJ", nombre_estado="Falta justificada"),
        ],
        incidencias=_incidencias_demo(estudiante_id),
    )


@router.post(
    "/apoderados/{apoderado_id}/hijos/{estudiante_id}/justificaciones",
    response_model=JustificacionOut,
    status_code=status.HTTP_201_CREATED,
)
def enviar_justificacion_asistencia(
    apoderado_id: str,
    estudiante_id: str,
    datos: JustificacionCreateIn,
) -> JustificacionOut:
    """Registra una justificación escrita enviada por el apoderado al auxiliar (RF20, RC08, DA05)."""
    validar_pertenencia_apoderado(apoderado_id, estudiante_id)
    incidencias = {inc.id: inc for inc in _incidencias_demo(estudiante_id)}
    incidencia = incidencias.get(datos.incidencia_id)
    if incidencia is None:
        raise ErrorAplicacion(
            title="Incidencia no encontrada",
            detail=f"No existe la incidencia '{datos.incidencia_id}' para este estudiante.",
            status_code=404,
        )
    if not incidencia.puede_justificar or incidencia.justificacion_enviada:
        raise ErrorAplicacion(
            title="Incidencia no justificable",
            detail="Esta incidencia ya cuenta con justificación o no requiere envío.",
            status_code=400,
        )
    return JustificacionOut(
        id=f"just-{datos.incidencia_id}",
        incidencia_id=datos.incidencia_id,
        estudiante_id=estudiante_id,
        estado="en_revision",
        motivo=datos.motivo.strip(),
        detalle=datos.detalle.strip(),
        mensaje="Justificación enviada al auxiliar de educación.",
    )
