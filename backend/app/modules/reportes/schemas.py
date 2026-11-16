"""Esquemas Pydantic de salida para el módulo de reportes."""

from typing import Literal

from pydantic import BaseModel

SituacionFinalCodigo = Literal["PRO", "PER", "RR"]


class FilaLibretaCompetenciaOut(BaseModel):
    """Fila de competencia dentro de la libreta trimestral."""

    competencia: str
    nivel: Literal["AD", "A", "B", "C", "—"]
    conclusion: str = ""
    es_transversal: bool = False


class AreaLibretaOut(BaseModel):
    """Área curricular agrupada en el Informe de progreso."""

    nombre: str
    competencias: list[FilaLibretaCompetenciaOut]


class TrimestreLibretaOut(BaseModel):
    """Estado y contenido de la libreta de un trimestre."""

    trimestre_id: int
    nombre: str
    rango_fechas: str
    publicada: bool
    fecha_publicacion: str | None = None
    areas: list[AreaLibretaOut]


class SituacionFinalOut(BaseModel):
    """Resultado anual de promoción, permanencia o recuperación (RF28)."""

    calculada: bool
    codigo: SituacionFinalCodigo | None = None
    etiqueta: str | None = None


class LibretasOut(BaseModel):
    """Listado de libretas por trimestre del estudiante."""

    estudiante_id: str
    anio_escolar: int
    grado_seccion: str
    trimestres: list[TrimestreLibretaOut]
    situacion_final: SituacionFinalOut


class UrlDescargaOut(BaseModel):
    """Enlace temporal firmado para descargar una libreta en PDF (RC05)."""

    url_firmada: str
    expira_en_segundos: int
    nombre_archivo: str
