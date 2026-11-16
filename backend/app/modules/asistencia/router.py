"""Endpoints contractuales (stub) del módulo de asistencia."""

from fastapi import APIRouter, Query

from .schemas import (
    AsistenciaMesOut,
    DiaAsistenciaOut,
    IncidenciaAsistenciaOut,
    KpisAsistenciaOut,
)

router = APIRouter(prefix="/asistencia", tags=["asistencia"])


@router.get("/estudiantes/{estudiante_id}", response_model=AsistenciaMesOut)
def obtener_asistencia_mensual(
    estudiante_id: str,
    mes: int = Query(default=11, ge=1, le=12),
    anio: int = Query(default=2026, ge=2020, le=2100),
) -> AsistenciaMesOut:
    """Devuelve KPIs, calendario mensual e incidencias de asistencia (stub)."""
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
        incidencias=[
            IncidenciaAsistenciaOut(
                fecha="Mié 4 nov",
                codigo="T",
                nombre_estado="Tardanza",
                detalle="Ingreso 08:09.",
            ),
            IncidenciaAsistenciaOut(
                fecha="Vie 6 nov",
                codigo="FJ",
                nombre_estado="Falta justificada",
                detalle="Cita médica justificada por el apoderado.",
            ),
        ],
    )
