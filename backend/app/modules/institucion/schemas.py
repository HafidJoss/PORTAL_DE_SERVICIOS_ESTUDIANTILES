"""Esquemas Pydantic de entrada y salida para el módulo de institución."""

from typing import Literal

from pydantic import BaseModel, Field

EstadoTrimestre = Literal[
    "Aperturado",
    "En Evaluación",
    "Cierre Preliminar",
    "Cerrado",
]

AccionTrimestre = Literal[
    "iniciar_evaluacion",
    "cierre_preliminar",
    "cerrar",
    "reabrir",
]

TipoSolicitudAdmin = Literal["Cuenta", "Asignación", "Reapertura", "Catálogo"]


class KpisTableroAdminOut(BaseModel):
    """Indicadores principales en la portada del Administrador."""

    solicitudes_pendientes: int
    cuentas_sin_activar: int
    secciones_con_cierre: int
    total_secciones_seguimiento: int


class SolicitudAdminOut(BaseModel):
    """Elemento de la bandeja operativa de solicitudes del Administrador."""

    id: str
    tipo: TipoSolicitudAdmin
    remitente: str
    fecha: str
    asunto: str
    detalle: str
    etiqueta_accion: str
    ruta_destino: str
    atendida: bool
    no_leida: bool


class TrimestreAdminOut(BaseModel):
    """Estado de un trimestre del año lectivo (RF05, RF27, RF30)."""

    id: int
    nombre: str
    nombre_corto: str
    fechas: str
    estado: EstadoTrimestre
    libreta_publicada: bool
    reabierto: bool = False
    siguiente_hito: str
    secciones_pendientes_cierre: int = 0


class AvanceSeccionOut(BaseModel):
    """Porcentaje de competencias confirmadas en una sección (RF31)."""

    seccion: str
    porcentaje: int = Field(..., ge=0, le=100)


class ResumenCuentasAdminOut(BaseModel):
    """Resumen por estado de cuentas del portal."""

    activas: int
    pendientes: int
    bloqueadas: int


class TableroAdminOut(BaseModel):
    """Respuesta agregada del tablero operativo de Inicio del Administrador."""

    anio_lectivo: int
    fecha_actual_texto: str
    saludo: str
    periodo_texto: str
    kpis: KpisTableroAdminOut
    solicitudes: list[SolicitudAdminOut]
    trimestre_actual: TrimestreAdminOut
    avance_secciones: list[AvanceSeccionOut]
    resumen_cuentas: ResumenCuentasAdminOut


class ListaTrimestresOut(BaseModel):
    """Listado de trimestres del año escolar."""

    anio_lectivo: int
    trimestre_actual_corto: str
    trimestres: list[TrimestreAdminOut]


class TransicionTrimestreIn(BaseModel):
    """Solicitud para avanzar o reabrir un trimestre (RF05, RF30)."""

    accion: AccionTrimestre
    motivo: str | None = Field(default=None, max_length=500)
    acta_emitida_siagie: bool = False
    documento_ugel: str | None = Field(default=None, max_length=120)


NivelCatalogo = Literal["Primaria", "Secundaria"]
NivelAsignaturas = Literal["Primaria", "Secundaria", "Transversales"]


class SeccionAdminOut(BaseModel):
    """Resumen de una sección escolar con su tutor, auxiliar y cantidad de estudiantes."""

    id: str
    nivel: NivelCatalogo
    grado: int
    letra: str
    nombre: str
    tutor: str
    auxiliar: str
    cantidad_estudiantes: int


class ListaSeccionesOut(BaseModel):
    """Respuesta del listado de secciones filtrado por nivel y grado."""

    nivel: NivelCatalogo
    grado: int
    total_en_nivel: int
    secciones: list[SeccionAdminOut]
    letras_disponibles: list[str]
    docentes_disponibles: list[str]
    auxiliares_disponibles: list[str]


class SeccionCreateIn(BaseModel):
    """Solicitud para crear una nueva sección en una letra disponible A–P."""

    nivel: NivelCatalogo
    grado: int = Field(..., ge=1, le=6)
    letra: str = Field(..., min_length=1, max_length=1)
    tutor: str = Field(..., min_length=2, max_length=120)
    auxiliar: str = Field(..., min_length=2, max_length=120)


class SeccionUpdateIn(BaseModel):
    """Actualización del tutor y/o auxiliar de una sección."""

    tutor: str | None = Field(default=None, min_length=2, max_length=120)
    auxiliar: str | None = Field(default=None, min_length=2, max_length=120)


class EliminacionSeccionOut(BaseModel):
    """Confirmación de eliminación de una sección vacía."""

    seccion_id: str
    eliminada: bool
    mensaje: str


class CompetenciaAreaCnebOut(BaseModel):
    """Competencia oficial CNEB perteneciente a una asignatura o transversal."""

    codigo: str
    descripcion: str


class AsignaturaCatalogoOut(BaseModel):
    """Área curricular con sus competencias oficiales CNEB."""

    nombre: str
    nivel: NivelAsignaturas
    competencias: list[CompetenciaAreaCnebOut]


class CatalogoAsignaturasOut(BaseModel):
    """Listado de asignaturas y competencias filtrado por nivel."""

    nivel: NivelAsignaturas
    total_asignaturas: int
    total_competencias: int
    asignaturas: list[AsignaturaCatalogoOut]


class AsignacionDocenteOut(BaseModel):
    """Asignación de docente titular y suplente para una asignatura en una sección."""

    seccion_id: str
    asignatura: str
    titular: str
    suplente: str
    alerta: str | None = None


class ListaAsignacionesOut(BaseModel):
    """Plana docente de una sección seleccionada."""

    seccion_id: str
    seccion_nombre: str
    nivel: NivelCatalogo
    grado: int
    tutor: str
    auxiliar: str
    alertas_pendientes: int
    asignaciones: list[AsignacionDocenteOut]
    docentes_disponibles: list[str]


class AsignacionDocenteUpdateIn(BaseModel):
    """Actualización de docente titular y/o suplente de una asignatura en una sección."""

    seccion_id: str = Field(..., min_length=1)
    asignatura: str = Field(..., min_length=2)
    titular: str | None = None
    suplente: str | None = None
