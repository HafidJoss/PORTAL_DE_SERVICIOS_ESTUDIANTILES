"""Esquemas Pydantic de entrada y salida para el módulo de evaluación."""

from typing import Literal

from pydantic import BaseModel, Field, field_validator

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



CodigoCompetencia = Literal["C1", "C2", "C3", "C4"]
NivelCalificativo = Literal["AD", "A", "B", "C"]
NivelEducativoDocente = Literal["Primaria", "Secundaria"]


class CompetenciaCatalogoOut(BaseModel):
    """Catálogo de competencia y sus cuatro capacidades del CNEB."""

    codigo: CodigoCompetencia
    nombre: str
    capacidades: list[str]


class EstudianteSeccionOut(BaseModel):
    """Estudiante matriculado en una sección asignada al docente."""

    indice: int
    codigo: str
    nombre: str
    iniciales: str
    observaciones_total: int = 0


class SesionClaseOut(BaseModel):
    """Sesión de clase continua con cuatro criterios y notas del día."""

    id: str
    competencia: CodigoCompetencia
    capacidad_idx: int
    tema: str
    evidencia: str
    fecha: str
    criterios: list[str]
    notas_por_estudiante: dict[str, list[str]]
    ajustes_manuales: dict[str, str]
    estado: Literal["pendiente", "registrada"]


class ActividadDocenteOut(BaseModel):
    """Actividad académica creada o gestionada por el docente sin archivos adjuntos."""

    id: str
    titulo: str
    fecha_entrega: str
    competencia: CodigoCompetencia
    descripcion: str
    estado: Literal["borrador", "publicada"]


class NivelGuardadoDocenteOut(BaseModel):
    """Estado guardado o confirmado de cierre por competencia."""

    competencia: CodigoCompetencia
    confirmada: bool
    niveles_por_estudiante: dict[str, str]
    conclusiones_por_estudiante: dict[str, str]


class ObservacionDocenteOut(BaseModel):
    """Observación registrada para un estudiante y su apoderado."""

    id: str
    estudiante_idx: int
    tipo: Literal["Positiva", "Por mejorar"]
    texto: str
    fecha: str


class PanelEvaluacionSeccionOut(BaseModel):
    """Datos iniciales completos de evaluación continua y cierre para una sección."""

    seccion_id: str
    seccion_nombre: str
    asignatura_nombre: str
    nivel_educativo: NivelEducativoDocente
    competencias: list[CompetenciaCatalogoOut]
    estudiantes: list[EstudianteSeccionOut]
    sesiones: list[SesionClaseOut]
    actividades: list[ActividadDocenteOut]
    cierres: list[NivelGuardadoDocenteOut]
    observaciones: list[ObservacionDocenteOut]


class SesionClaseCreateIn(BaseModel):
    """Payload para crear una nueva sesión de clase con 4 criterios evaluables."""

    competencia: CodigoCompetencia
    capacidad_idx: int = Field(..., ge=0, le=3)
    tema: str = Field(..., min_length=3, max_length=160)
    evidencia: str = Field(default="", max_length=240)
    fecha: str = Field(..., min_length=4, max_length=32)
    criterios: list[str] = Field(..., min_length=4, max_length=4)

    @field_validator("tema")
    @classmethod
    def _validar_tema(cls, valor: str) -> str:
        limpio = valor.strip()
        if len(limpio) < 3:
            raise ValueError("El tema de la clase debe tener al menos 3 caracteres.")
        return limpio

    @field_validator("criterios")
    @classmethod
    def _validar_criterios(cls, lista: list[str]) -> list[str]:
        limpios = [item.strip() for item in lista if item.strip()]
        if len(limpios) != 4:
            raise ValueError("Debes definir los cuatro criterios de evaluación (K1..K4).")
        return limpios


class NotasSesionPutIn(BaseModel):
    """Payload para guardar o publicar criterios K1..K4 de una sesión."""

    notas_por_estudiante: dict[str, list[str]]
    ajustes_manuales: dict[str, NivelCalificativo] = {}
    publicar: bool = False


class ActividadDocenteCreateIn(BaseModel):
    """Payload para registrar una actividad en borrador o publicada (RC08: sin adjuntos)."""

    titulo: str = Field(..., min_length=4, max_length=180)
    fecha_entrega: str = Field(..., min_length=4, max_length=32)
    competencia: CodigoCompetencia
    descripcion: str = Field(default="", max_length=1000)
    estado: Literal["borrador", "publicada"] = "publicada"

    @field_validator("titulo")
    @classmethod
    def _validar_titulo(cls, valor: str) -> str:
        limpio = valor.strip()
        if len(limpio) < 4:
            raise ValueError("El título de la actividad debe tener al menos 4 caracteres.")
        return limpio


class FilaCierreIn(BaseModel):
    """Nivel y conclusión descriptiva de un estudiante para confirmación trimestral."""

    estudiante_idx: int = Field(..., ge=0)
    nivel: Literal["AD", "A", "B", "C", ""]
    conclusion: str = Field(default="", max_length=1000)


class ConfirmarCierreIn(BaseModel):
    """Solicitud de confirmación de cierre de una competencia (RF22)."""

    competencia: CodigoCompetencia
    nivel_educativo: NivelEducativoDocente = "Secundaria"
    filas: list[FilaCierreIn]


class ConfirmacionCierreOut(BaseModel):
    """Confirmación exitosa de niveles y conclusiones de una competencia."""

    seccion_id: str
    competencia: CodigoCompetencia
    confirmada: bool
    total_confirmados: int


class ObservacionDocenteCreateIn(BaseModel):
    """Payload para publicar una observación dirigida a estudiante y apoderado (RF24)."""

    estudiante_idx: int = Field(..., ge=0)
    tipo: Literal["Positiva", "Por mejorar"]
    texto: str = Field(..., min_length=5, max_length=1000)

    @field_validator("texto")
    @classmethod
    def _validar_texto(cls, valor: str) -> str:
        limpio = valor.strip()
        if len(limpio) < 5:
            raise ValueError("La observación debe tener al menos 5 caracteres.")
        return limpio



class DestinatarioEstudianteOut(BaseModel):
    """Estudiante seleccionable como destinatario directo en mensajería docente."""

    indice: int
    nombre: str


class SeccionDestinatariosOut(BaseModel):
    """Sección asignada con sus posibles destinatarios individuales."""

    seccion_id: str
    nombre: str
    estudiantes_total: int
    estudiantes: list[DestinatarioEstudianteOut]


class MensajeEnviadoDocenteOut(BaseModel):
    """Registro cronológico de un mensaje o aviso enviado por el docente."""

    id: str
    tipo: Literal["Tarea", "Recordatorio", "Observación · Positiva", "Observación · Por mejorar", "Aviso"]
    seccion_id: str
    destinatario: str
    asunto: str
    cuerpo: str
    fecha: str


class BandejaEnviadosDocenteOut(BaseModel):
    """Catálogo de destinatarios e historial de enviados para Mensajes del docente."""

    secciones: list[SeccionDestinatariosOut]
    enviados: list[MensajeEnviadoDocenteOut]


class MensajeDocenteCreateIn(BaseModel):
    """Payload de envío saliente docente sin adjuntos (RF25, RC08)."""

    tipo: Literal["Tarea", "Recordatorio"]
    seccion_id: str = Field(..., min_length=1, max_length=16)
    estudiante_idx: int | None = Field(default=None, ge=0)
    asunto: str = Field(..., min_length=3, max_length=160)
    cuerpo: str = Field(..., min_length=5, max_length=2000)

    @field_validator("asunto")
    @classmethod
    def _validar_asunto(cls, valor: str) -> str:
        limpio = valor.strip()
        if len(limpio) < 3:
            raise ValueError("El asunto debe tener al menos 3 caracteres.")
        return limpio

    @field_validator("cuerpo")
    @classmethod
    def _validar_cuerpo(cls, valor: str) -> str:
        limpio = valor.strip()
        if len(limpio) < 5:
            raise ValueError("El mensaje debe tener al menos 5 caracteres.")
        return limpio
