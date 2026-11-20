"""Esquemas Pydantic de entrada y salida para el módulo de matrículas (RF21)."""

from typing import Literal

from pydantic import BaseModel, Field

EstadoEstudianteSeccion = Literal["Activo", "Retirado", "Trasladado"]
NivelLogroResumen = Literal["AD", "A", "B", "C"]


class EstudianteSinSeccionOut(BaseModel):
    """Estudiante de la nómina SIAGIE pendiente de asignación a sección."""

    id: str
    nombre: str
    codigo: str
    nivel: str
    grado: int
    nota: str


class PoolSinSeccionOut(BaseModel):
    """Listado de estudiantes sin sección asignada."""

    total: int
    estudiantes: list[EstudianteSinSeccionOut]


class NivelAreaResumenOut(BaseModel):
    """Último nivel registrado por área en el resumen del estudiante."""

    area: str
    nivel: NivelLogroResumen


class ResumenEstudianteSeccionOut(BaseModel):
    """Ficha resumida desplegable de un estudiante dentro de una sección."""

    codigo_siagie: str
    dni: str
    apoderado: str
    tutor: str
    asistencia_pct: int
    pendientes: int
    observaciones: int
    areas: list[NivelAreaResumenOut]


class EstudianteNominaSeccionOut(BaseModel):
    """Fila de estudiante dentro de la nómina de una sección."""

    id: str
    nombre: str
    codigo: str
    estado: EstadoEstudianteSeccion
    resumen: ResumenEstudianteSeccionOut


class OpcionSeccionDestinoOut(BaseModel):
    """Sección del mismo grado disponible para mover a un estudiante."""

    id: str
    etiqueta: str


class NominaSeccionOut(BaseModel):
    """Nómina completa de estudiantes de una sección y destinos de movimiento."""

    seccion_id: str
    seccion_nombre: str
    nivel: str
    grado: int
    total: int
    opciones_movimiento: list[OpcionSeccionDestinoOut]
    estudiantes: list[EstudianteNominaSeccionOut]


class AsignarDesdePoolIn(BaseModel):
    """Solicitud para asignar un estudiante del pool a una sección."""

    estudiante_id: str = Field(..., min_length=1)
    seccion_id: str = Field(..., min_length=1)


class MoverEstudianteIn(BaseModel):
    """Solicitud para mover un estudiante a otra sección o retirarlo al pool ('__pool')."""

    seccion_origen_id: str = Field(..., min_length=1)
    seccion_destino_id: str = Field(..., min_length=1)


class MoverEstudianteOut(BaseModel):
    """Confirmación de traslado interno o retiro al pool."""

    estudiante_id: str
    seccion_origen_id: str
    seccion_destino_id: str
    mensaje: str


class CambiarEstadoEstudianteIn(BaseModel):
    """Solicitud para cambiar el estado escolar en la sección."""

    seccion_id: str = Field(..., min_length=1)
    estado: EstadoEstudianteSeccion
