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



class SeccionSiagieEstadoOut(BaseModel):
    """Estado de preparación de una sección para exportación SIAGIE."""

    seccion_id: str
    nombre: str
    estudiantes_total: int
    competencias_confirmadas: int
    competencias_total: int
    listo_para_exportar: bool


class TrimestreSiagieOut(BaseModel):
    """Trimestre académico con estado de exportación por sección."""

    trimestre_id: Literal[1, 2, 3]
    nombre: str
    cerrado: bool
    secciones: list[SeccionSiagieEstadoOut]


class ResumenSiagieDocenteOut(BaseModel):
    """Resumen completo de trimestres y secciones para Exportar SIAGIE."""

    asignatura: str
    trimestres: list[TrimestreSiagieOut]


class SolicitudDescargaSiagieIn(BaseModel):
    """Solicitud de descarga temporal firmada de Excel SIAGIE o Acta preliminar."""

    trimestre_id: Literal[1, 2, 3]
    formato: Literal["excel_siagie", "acta_preliminar"]
