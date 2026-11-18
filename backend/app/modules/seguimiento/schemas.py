"""Esquemas Pydantic de salida para el módulo de seguimiento."""

from typing import Literal

from pydantic import BaseModel, Field, field_validator

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


class RespuestaHiloDocenteOut(BaseModel):
    """Respuesta publicada dentro de un hilo de bandeja docente."""

    texto: str
    fecha: str


class MensajeBandejaDocenteOut(BaseModel):
    """Mensaje en la bandeja de entrada del docente."""

    id: str
    origen: Literal["institucion", "asistencia", "estudiante"]
    remitente: str
    nombre_corto: str = ""
    seccion_id: str | None = None
    seccion_nombre: str | None = None
    asunto: str
    cuerpo: str
    fecha: str
    leido: bool
    puede_responder: bool
    destino_tab: str | None = None
    respuestas: list[RespuestaHiloDocenteOut] = []


class ClaseHoyDocenteOut(BaseModel):
    """Clase programada del día en el horario del docente."""

    seccion_id: str
    seccion_nombre: str
    aula: str
    estudiantes_total: int
    hora_inicio: str
    hora_fin: str
    estado: Literal["Terminada", "En curso", "Siguiente"]
    sesion_id: str | None = None


class NotaPendienteDocenteOut(BaseModel):
    """Sesión con notas pendientes de completar por sección."""

    seccion_id: str
    seccion_nombre: str
    sesion_id: str
    titulo: str
    registrados: int
    total: int
    porcentaje: int


class AlertaDocenteOut(BaseModel):
    """Alerta prioritaria de atención para el docente."""

    id: str
    texto: str
    severidad: Literal["danger", "warning", "neutral"]
    seccion_id: str
    destino_tab: str


class EtapaTrimestreOut(BaseModel):
    """Etapa del trimestre actual en la línea de tiempo."""

    nombre: str
    fecha: str
    estado: Literal["completada", "actual", "pendiente"]


class InicioDocenteOut(BaseModel):
    """Respuesta agregada del tablero inicial del docente."""

    docente_id: str
    trimestre_actual: str
    fecha_etiqueta: str
    sin_leer: int
    por_calificar_total: int
    mensajes_bandeja: list[MensajeBandejaDocenteOut]
    clases_hoy: list[ClaseHoyDocenteOut]
    notas_pendientes: list[NotaPendienteDocenteOut]
    alertas: list[AlertaDocenteOut]
    etapas_trimestre: list[EtapaTrimestreOut]


class OperacionBandejaOut(BaseModel):
    """Confirmación simple de marcado de lectura en bandeja docente."""

    ok: bool
    mensaje: str


class RespuestaBandejaIn(BaseModel):
    """Cuerpo de respuesta en hilo desde la bandeja docente."""

    texto: str = Field(..., min_length=2)


class RespuestaBandejaOut(BaseModel):
    """Respuesta registrada para un mensaje de estudiante en bandeja."""

    mensaje_id: str
    texto: str
    fecha: str


class PendienteSeccionOut(BaseModel):
    """Resumen breve de una sesión pendiente dentro de la tarjeta de sección."""

    sesion_id: str
    titulo: str
    registrados: int
    total: int
    porcentaje: int


class SeccionDocenteOut(BaseModel):
    """Tarjeta resumen de una sección asignada al docente."""

    seccion_id: str
    nombre: str
    horario: str
    aula: str
    tutor: str
    estudiantes_total: int
    competencias_confirmadas: int
    competencias_total: int
    notas_pendientes: list[PendienteSeccionOut]


class ListaSeccionesDocenteOut(BaseModel):
    """Listado de secciones a cargo del docente en Mis cursos."""

    asignatura_nombre: str
    nivel_educativo: str
    anio_escolar: int
    total_estudiantes: int
    secciones: list[SeccionDocenteOut]


class ElementoStreamSeccionOut(BaseModel):
    """Publicación en el flujo cronológico de Novedades de la sección docente."""

    id: str
    tipo: Literal["Aviso", "Recordatorio", "Tarea", "Actividad", "Clase"]
    titulo: str
    subtitulo: str = ""
    fecha: str
    cuerpo: str = ""


class DetalleSeccionDocenteOut(BaseModel):
    """Cabecera, distribución cualitativa y novedades de una sección docente."""

    seccion_id: str
    nombre: str
    asignatura: str
    nivel_educativo: Literal["Primaria", "Secundaria"]
    horario: str
    aula: str
    tutor: str
    estudiantes_total: int
    clases_registradas: int
    competencias_confirmadas: int
    competencias_total: int
    distribucion_niveles: list[DistribucionNivelItemOut]
    pendientes: list[PendienteSeccionOut]
    stream: list[ElementoStreamSeccionOut]


class AnuncioSeccionCreateIn(BaseModel):
    """Payload para publicar un anuncio unidireccional en la sección (RF25, RC08)."""

    tipo: Literal["Aviso", "Recordatorio", "Tarea"]
    texto: str = Field(..., min_length=3, max_length=1500)

    @field_validator("texto")
    @classmethod
    def _validar_texto(cls, valor: str) -> str:
        limpio = valor.strip()
        if len(limpio) < 3:
            raise ValueError("El anuncio debe tener al menos 3 caracteres.")
        return limpio



class MensajeBandejaApoderadoOut(BaseModel):
    """Mensaje o comunicado en la bandeja familiar del apoderado."""

    id: str
    origen: Literal["institucion", "asistencia", "docente"]
    remitente: str
    iniciales: str = ""
    curso: str = ""
    asunto: str
    cuerpo: str
    fecha: str
    leido: bool
    requiere_confirmacion: bool = False
    lectura_confirmada: bool = False
    etiqueta: str
    ruta_destino: str = ""


class ResumenAsistenciaApoderadoOut(BaseModel):
    """Indicadores rápidos de asistencia del mes para el hijo seleccionado."""

    porcentaje: str
    presentes: int
    tardanzas: int
    faltas: int


class InicioApoderadoOut(BaseModel):
    """Tablero inicial del apoderado filtrado para un hijo vinculado (RF01, DA05)."""

    apoderado_id: str
    estudiante_id: str
    estudiante_nombre: str
    grado_seccion: str
    sin_leer: int
    pendientes_total: int
    asistencia_porcentaje: str
    mensajes_bandeja: list[MensajeBandejaApoderadoOut]
    proximas_entregas: list[EntregaProximaOut]
    resumen_asistencia: ResumenAsistenciaApoderadoOut
