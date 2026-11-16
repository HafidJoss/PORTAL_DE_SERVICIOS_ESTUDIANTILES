"""Esquemas Pydantic de entrada y salida para el módulo de evaluación."""

from typing import Literal

from pydantic import BaseModel, Field

NivelLogro = Literal["AD", "A", "B", "C", "—"]


class CompetenciaNivelOut(BaseModel):
    """Niveles trimestrales de una competencia."""

    nombre: str
    trimestres: list[NivelLogro]
    en_evaluacion_t3: bool = True


class ConclusionOut(BaseModel):
    """Conclusión descriptiva publicada en un trimestre cerrado."""

    trimestre: str
    competencia: str
    nivel: Literal["AD", "A", "B", "C"]
    texto: str


class CalificativoPublicadoOut(BaseModel):
    """Evidencia calificada (trabajo o sesión de clase) publicada."""

    id: str
    tipo: Literal["trabajo", "sesion_clase"]
    titulo: str
    fecha: str
    competencia: str
    nivel: Literal["AD", "A", "B", "C"]
    comentario: str = ""


class CursoCalificacionesOut(BaseModel):
    """Calificaciones, conclusiones y evidencias de una asignatura."""

    asignatura_id: str
    nombre: str
    docente: str
    competencias: list[CompetenciaNivelOut]
    conclusiones: list[ConclusionOut]
    calificativos_publicados: list[CalificativoPublicadoOut]


class CalificacionesEstudianteOut(BaseModel):
    """Respuesta completa de la vista Calificaciones."""

    trimestre_actual: int
    estado_trimestre: str
    criterio_sugerencia: Literal["mediana_capacidades"] = "mediana_capacidades"
    cursos: list[CursoCalificacionesOut]


class ActividadOut(BaseModel):
    """Trabajo o sesión de clase visible en Trabajos y pendientes."""

    id: str
    tipo: Literal["trabajo", "sesion_clase"]
    titulo: str
    curso: str
    asignada: str
    fecha_entrega: str | None = None
    estado: Literal["pendiente", "vencido", "entregado", "calificado"]
    urgente: bool = False
    competencia: str
    capacidad: str
    descripcion: str = ""
    nivel: NivelLogro | None = None
    comentario: str = ""


class ListaActividadesOut(BaseModel):
    """Listado de trabajos y sesiones de clase del estudiante."""

    pendientes: int
    vencen_pronto: int
    actividades: list[ActividadOut]


class RespuestaHiloOut(BaseModel):
    """Respuesta dentro del hilo de un mensaje."""

    id: str
    mensaje_id: str
    autor: str
    rol_autor: str
    contenido: str
    fecha: str


class MensajeOut(BaseModel):
    """Mensaje, recordatorio u observación con soporte de lectura e hilo."""

    id: str
    tipo: Literal["Tarea", "Recordatorio", "ObsPos", "ObsMej"]
    remitente: str
    curso: str
    asunto: str
    fecha: str
    fecha_larga: str
    destinatarios: str
    cuerpo: str
    actividad_id: str | None = None
    no_leido: bool
    lectura_confirmada: bool
    respuestas: list[RespuestaHiloOut]


class ListaMensajesOut(BaseModel):
    """Bandeja de mensajes del estudiante."""

    sin_leer: int
    mensajes: list[MensajeOut]


class LecturaConfirmadaOut(BaseModel):
    """Confirmación de lectura de un mensaje."""

    mensaje_id: str
    lectura_confirmada: bool


class RespuestaMensajeIn(BaseModel):
    """Payload para responder dentro de un hilo de mensaje."""

    contenido: str = Field(..., min_length=1, max_length=2000)
