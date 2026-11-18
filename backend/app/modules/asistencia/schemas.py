"""Esquemas Pydantic de salida para el módulo de asistencia."""

from typing import Literal

from pydantic import BaseModel, Field

CodigoAsistencia = Literal["P", "T", "F", "FJ", "TJ", "FE", ""]


class DiaAsistenciaOut(BaseModel):
    """Celda del calendario laboral de asistencia."""

    dia: int | None = None
    codigo: CodigoAsistencia
    nombre_estado: str


class IncidenciaAsistenciaOut(BaseModel):
    """Detalle de tardanza, falta o justificación del mes."""

    id: str = ""
    fecha: str
    codigo: Literal["T", "F", "FJ", "TJ", "FE"]
    nombre_estado: str
    detalle: str
    puede_justificar: bool = False
    justificacion_enviada: bool = False


class JustificacionCreateIn(BaseModel):
    """Solicitud escrita de justificación enviada por el apoderado (RF20, RC08)."""

    incidencia_id: str = Field(..., min_length=1, max_length=60)
    motivo: str = Field(..., min_length=2, max_length=80)
    detalle: str = Field(..., min_length=5, max_length=500)


class JustificacionOut(BaseModel):
    """Respuesta al registrar una justificación de asistencia."""

    id: str
    incidencia_id: str
    estudiante_id: str
    estado: Literal["en_revision", "aprobada", "rechazada"]
    motivo: str
    detalle: str
    mensaje: str


class KpisAsistenciaOut(BaseModel):
    """Resumen numérico mensual de asistencia."""

    porcentaje: str
    presentes: int
    tardanzas: int
    faltas: int
    justificadas: int


class AsistenciaMesOut(BaseModel):
    """Respuesta mensual de asistencia para un estudiante."""

    estudiante_id: str
    mes: int
    anio: int
    seccion: str
    kpis: KpisAsistenciaOut
    dias: list[DiaAsistenciaOut]
    incidencias: list[IncidenciaAsistenciaOut]
