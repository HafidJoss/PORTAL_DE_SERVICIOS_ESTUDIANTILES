"""Esquemas Pydantic de salida para el módulo de asistencia."""

from typing import Literal

from pydantic import BaseModel

CodigoAsistencia = Literal["P", "T", "F", "FJ", "TJ", "FE", ""]


class DiaAsistenciaOut(BaseModel):
    """Celda del calendario laboral de asistencia."""

    dia: int | None = None
    codigo: CodigoAsistencia
    nombre_estado: str


class IncidenciaAsistenciaOut(BaseModel):
    """Detalle de tardanza, falta o justificación del mes."""

    fecha: str
    codigo: Literal["T", "F", "FJ", "TJ", "FE"]
    nombre_estado: str
    detalle: str


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
