"""Esquemas Pydantic de salida para el módulo de seguimiento."""

from typing import Literal

from pydantic import BaseModel

NivelLogro = Literal["AD", "A", "B", "C", "—"]


class NovedadItemOut(BaseModel):
    """Elemento de novedad desde la última visita."""

    id: str
    grupo: str
    tipo: Literal["calificativo", "observacion", "asistencia", "recordatorio", "mensaje"]
    etiqueta: str
    curso: str
    titulo: str
    detalle: str
    nivel: NivelLogro | None = None
    hora: str
    ruta_destino: str


class KpiInicioOut(BaseModel):
    """Tarjeta KPI para la variante B del inicio."""

    clave: str
    etiqueta: str
    valor: str
    subtitulo: str


class DistribucionNivelItemOut(BaseModel):
    """Conteo por nivel de logro en el trimestre actual."""

    nivel: Literal["AD", "A", "B", "C"]
    nombre: str
    cantidad: int
    porcentaje: float


class EventoAgendaOut(BaseModel):
    """Evento puntual en la agenda semanal (variante C)."""

    titulo: str
    tipo: str
    ruta_destino: str


class DiaAgendaOut(BaseModel):
    """Día dentro de la vista de agenda semanal."""

    etiqueta: str
    numero: int
    es_hoy: bool
    asistencia: str | None = None
    eventos: list[EventoAgendaOut]


class EntregaProximaOut(BaseModel):
    """Actividad pendiente próxima a vencer."""

    id: str
    titulo: str
    curso: str
    fecha_entrega: str
    estado_etiqueta: str
    urgente: bool = False


class InicioEstudianteOut(BaseModel):
    """Respuesta agregada de la pantalla Inicio (soporta variantes A, B y C)."""

    estudiante_id: str
    ultima_visita: str
    novedades_sin_ver: int
    novedades: list[NovedadItemOut]
    kpis: list[KpiInicioOut]
    distribucion_niveles: list[DistribucionNivelItemOut]
    agenda_semanal: list[DiaAgendaOut]
    proximas_entregas: list[EntregaProximaOut]


class NovedadesVistoOut(BaseModel):
    """Confirmación de actualización de marca de última visita."""

    visto: bool
    ultima_visita: str


class CursoResumenOut(BaseModel):
    """Tarjeta resumen de una asignatura en la vista Cursos."""

    asignatura_id: str
    nombre: str
    docente: str
    rol_docente: str
    horario: str
    horas_semanales: int
    pendientes: int
    proximo_vencimiento: str | None = None
    mini_niveles: list[NivelLogro]


class ListaCursosOut(BaseModel):
    """Listado de cursos del estudiante en el año lectivo."""

    grado_seccion: str
    total_pendientes: int
    cursos: list[CursoResumenOut]


class IntegranteEquipoOut(BaseModel):
    """Docente, tutor o auxiliar vinculado al curso o sección."""

    nombre: str
    rol: str
    grupo: Literal["docente", "equipo_seccion"]


class CompetenciaCursoResumenOut(BaseModel):
    """Competencia y sus niveles sugeridos/confirmados por trimestre."""

    nombre: str
    trimestres: list[NivelLogro]


class StreamCursoOut(BaseModel):
    """Elemento cronológico en la pestaña Novedades del curso."""

    titulo: str
    subtitulo: str
    fecha: str
    tipo: str
    nivel: NivelLogro | None = None
    cuerpo: str = ""


class CursoDetalleOut(BaseModel):
    """Detalle completo de un curso para las 4 pestañas de Estudiante v2."""

    asignatura_id: str
    nombre: str
    docente: str
    rol_docente: str
    horario: str
    horas_semanales: int
    stream: list[StreamCursoOut]
    competencias: list[CompetenciaCursoResumenOut]
    equipo: list[IntegranteEquipoOut]
