"""Endpoints contractuales (stub) del módulo de institución (RF05, RF18, RF27, RF30, RF31)."""

from copy import deepcopy
from typing import Any

from fastapi import APIRouter, Depends, Header, Query, Request

from app.core.errores import ErrorAplicacion
from app.modules.auditoria.registro_stub import registrar_evento_auditoria
from app.modules.matriculas.nomina_stub import contar_estudiantes_en_seccion

from .catalogo_stub import (
    ASIGNATURAS_CNEB,
    AUXILIARES_DISPONIBLES,
    DOCENTES_DISPONIBLES,
    alerta_asignacion,
    guardar_asignacion_docente,
    obtener_asignacion_docente,
    obtener_seccion_por_id,
    obtener_secciones_memoria,
)
from .exceptions import (
    DatosCatalogoInvalidosError,
    DatosReaperturaInvalidosError,
    SeccionConEstudiantesError,
    SeccionDuplicadaError,
    TransicionTrimestreInvalidaError,
)
from .reglas import (
    LETRAS_SECCION_PERMITIDAS,
    validar_eliminacion_seccion,
    validar_nueva_seccion,
    validar_publicacion_libreta,
    validar_transicion_trimestre,
)
from .schemas import (
    AsignacionDocenteOut,
    AsignacionDocenteUpdateIn,
    AsignaturaCatalogoOut,
    AvanceSeccionOut,
    CatalogoAsignaturasOut,
    CompetenciaAreaCnebOut,
    EliminacionSeccionOut,
    KpisTableroAdminOut,
    ListaAsignacionesOut,
    ListaSeccionesOut,
    ListaTrimestresOut,
    NivelAsignaturas,
    NivelCatalogo,
    ResumenCuentasAdminOut,
    SeccionAdminOut,
    SeccionCreateIn,
    SeccionUpdateIn,
    SolicitudAdminOut,
    TableroAdminOut,
    TransicionTrimestreIn,
    TrimestreAdminOut,
)

router = APIRouter(prefix="/institucion", tags=["institucion"])

_SOLICITUDES_BASE: list[dict[str, Any]] = [
    {
        "id": "r1",
        "tipo": "Cuenta",
        "remitente": "Secretaría Académica",
        "fecha": "Hoy, 07:45",
        "asunto": "Restablecer contraseña: Juana Ccori Flores (apoderada)",
        "detalle": (
            "La apoderada se acercó a Secretaría con su DNI 41522870. "
            "Su cuenta se bloqueó por intentos fallidos el 10 de noviembre. "
            "Solicita una nueva contraseña."
        ),
        "etiqueta_accion": "Ir a la cuenta",
        "ruta_destino": "/cuentas",
        "atendida": False,
        "no_leida": True,
    },
    {
        "id": "r2",
        "tipo": "Asignación",
        "remitente": "Dirección",
        "fecha": "Hoy, 07:20",
        "asunto": "Licencia de Prof. Miriam Huamaní (16–27 nov): asignar suplente",
        "detalle": (
            "La docente presentó licencia por salud. Se requiere asignar un suplente "
            "en Ciencias Sociales para 2.° A y 2.° B mientras dure la licencia."
        ),
        "etiqueta_accion": "Ir a asignaciones",
        "ruta_destino": "/catalogo",
        "atendida": False,
        "no_leida": True,
    },
    {
        "id": "r3",
        "tipo": "Reapertura",
        "remitente": "Dirección",
        "fecha": "Ayer, 17:02",
        "asunto": "Reabrir II Trimestre: corrección en 4.° C, Matemática",
        "detalle": (
            "El Prof. Raúl Ccahuana reporta un error en el nivel de C3 de 2 estudiantes "
            "de 4.° C en el II Trimestre. El Acta Oficial aún no se emitió. "
            "Se solicita reabrir para corregir y publicar una nueva versión de la libreta."
        ),
        "etiqueta_accion": "Ir a trimestres",
        "ruta_destino": "/trimestres",
        "atendida": False,
        "no_leida": True,
    },
    {
        "id": "r4",
        "tipo": "Catálogo",
        "remitente": "Secretaría Académica",
        "fecha": "Ayer, 11:30",
        "asunto": "Nómina SIAGIE cargada: 6 estudiantes sin sección y 1.° P sin tutor",
        "detalle": (
            "Secretaría cargó la nómina actualizada. Hay 6 estudiantes trasladados "
            "sin sección asignada. Además, la sección 1.° P de Secundaria se creó "
            "sin tutor(a) ni auxiliar."
        ),
        "etiqueta_accion": "Ir a secciones",
        "ruta_destino": "/catalogo",
        "atendida": False,
        "no_leida": True,
    },
    {
        "id": "r5",
        "tipo": "Cuenta",
        "remitente": "Sistema",
        "fecha": "10 nov",
        "asunto": "4 cuentas pendientes de activación hace más de 7 días",
        "detalle": (
            "Hay cuentas de apoderados, estudiantes y docentes que aún no usaron "
            "su código de activación. Puedes generar un nuevo código y entregarlo por Secretaría."
        ),
        "etiqueta_accion": "Ver pendientes",
        "ruta_destino": "/cuentas",
        "atendida": False,
        "no_leida": True,
    },
]

_TRIMESTRES_BASE: list[dict[str, Any]] = [
    {
        "id": 1,
        "nombre": "I Trimestre",
        "nombre_corto": "I",
        "fechas": "9 de marzo – 29 de mayo de 2026",
        "estado": "Cerrado",
        "libreta_publicada": True,
        "reabierto": False,
    },
    {
        "id": 2,
        "nombre": "II Trimestre",
        "nombre_corto": "II",
        "fechas": "1 de junio – 28 de agosto de 2026 · libreta publicada el 11 sep",
        "estado": "Cerrado",
        "libreta_publicada": True,
        "reabierto": False,
    },
    {
        "id": 3,
        "nombre": "III Trimestre",
        "nombre_corto": "III",
        "fechas": "14 de septiembre – 18 de diciembre de 2026 · cierre preliminar el 4 dic",
        "estado": "En Evaluación",
        "libreta_publicada": False,
        "reabierto": False,
    },
]

_AVANCE_BASE: list[tuple[str, int]] = [
    ("1.° A", 85),
    ("1.° B", 100),
    ("2.° A", 64),
    ("2.° B", 72),
    ("3.° A", 100),
    ("3.° B", 88),
    ("4.° A", 58),
    ("4.° C", 92),
]

_solicitudes_memoria: list[dict[str, Any]] = deepcopy(_SOLICITUDES_BASE)
_trimestres_memoria: list[dict[str, Any]] = deepcopy(_TRIMESTRES_BASE)


def reiniciar_estado_institucion() -> None:
    """Restaura el estado contractual en memoria para pruebas deterministas."""
    global _solicitudes_memoria, _trimestres_memoria
    _solicitudes_memoria = deepcopy(_SOLICITUDES_BASE)
    _trimestres_memoria = deepcopy(_TRIMESTRES_BASE)


def _exigir_rol_administrador(
    x_rol_usuario: str | None = Header(default="Administrador", alias="X-Rol-Usuario"),
) -> str:
    """Guardia contractual de rol Administrador (AC04, RF05)."""
    rol = (x_rol_usuario or "Administrador").strip()
    if rol != "Administrador":
        raise ErrorAplicacion(
            title="Acceso denegado",
            detail="Solo el rol Administrador puede ejecutar operaciones institucionales.",
            status_code=403,
            error_type="https://portal.mariscal.edu.pe/problemas/acceso-denegado",
        )
    return rol


def _ip_cliente(request: Request) -> str:
    reenviada = request.headers.get("x-forwarded-for")
    if reenviada:
        return reenviada.split(",")[0].strip()
    return request.client.host if request.client else "181.65.22.14"


def _siguiente_hito(estado: str, libreta_publicada: bool) -> str:
    if estado == "Aperturado":
        return "Siguiente: En Evaluación"
    if estado == "En Evaluación":
        return "Cierre preliminar el 4 dic"
    if estado == "Cierre Preliminar":
        return "Cierre el 18 dic"
    return "Libreta publicada" if libreta_publicada else "Libreta por publicar"


def _avance_actual(estado_actual: str) -> list[AvanceSeccionOut]:
    salida: list[AvanceSeccionOut] = []
    for seccion, pct in _AVANCE_BASE:
        if estado_actual == "Cerrado":
            valor = 100
        elif estado_actual == "Cierre Preliminar":
            valor = min(100, pct + 10)
        else:
            valor = pct
        salida.append(AvanceSeccionOut(seccion=seccion, porcentaje=valor))
    return salida


def _trimestre_actual_dict() -> dict[str, Any]:
    for t in _trimestres_memoria:
        if t["estado"] != "Cerrado":
            return t
    return _trimestres_memoria[-1]


def _serializar_trimestre(t: dict[str, Any], pendientes_cierre: int) -> TrimestreAdminOut:
    return TrimestreAdminOut(
        id=t["id"],
        nombre=t["nombre"],
        nombre_corto=t["nombre_corto"],
        fechas=t["fechas"],
        estado=t["estado"],
        libreta_publicada=t["libreta_publicada"],
        reabierto=t["reabierto"],
        siguiente_hito=_siguiente_hito(t["estado"], t["libreta_publicada"]),
        secciones_pendientes_cierre=pendientes_cierre if t["estado"] != "Cerrado" else 0,
    )


@router.get("/tablero-admin", response_model=TableroAdminOut)
def obtener_tablero_admin(
    _: str = Depends(_exigir_rol_administrador),
) -> TableroAdminOut:
    """Devuelve KPIs, bandeja de solicitudes, trimestre actual y avance por sección."""
    actual = _trimestre_actual_dict()
    avance = _avance_actual(actual["estado"])
    completas = sum(1 for a in avance if a.porcentaje == 100)
    pendientes_cierre = len(avance) - completas
    solicitudes_pendientes = sum(1 for s in _solicitudes_memoria if not s["atendida"])

    return TableroAdminOut(
        anio_lectivo=2026,
        fecha_actual_texto="Jueves 12 de noviembre · Año escolar 2026",
        saludo="Buenos días, Lic. Marco",
        periodo_texto=f"{actual['nombre']} · {actual['estado']}",
        kpis=KpisTableroAdminOut(
            solicitudes_pendientes=solicitudes_pendientes,
            cuentas_sin_activar=4,
            secciones_con_cierre=completas,
            total_secciones_seguimiento=len(avance),
        ),
        solicitudes=[SolicitudAdminOut(**s) for s in _solicitudes_memoria],
        trimestre_actual=_serializar_trimestre(actual, pendientes_cierre),
        avance_secciones=avance,
        resumen_cuentas=ResumenCuentasAdminOut(activas=10, pendientes=4, bloqueadas=1),
    )


@router.patch("/solicitudes/{solicitud_id}/atender", response_model=SolicitudAdminOut)
def atender_solicitud_admin(
    solicitud_id: str,
    _: str = Depends(_exigir_rol_administrador),
) -> SolicitudAdminOut:
    """Marca una solicitud operativa como atendida."""
    for solicitud in _solicitudes_memoria:
        if solicitud["id"] == solicitud_id:
            solicitud["atendida"] = True
            solicitud["no_leida"] = False
            return SolicitudAdminOut(**solicitud)
    raise ErrorAplicacion(
        title="Solicitud no encontrada",
        detail=f"No existe una solicitud operativa con identificador '{solicitud_id}'.",
        status_code=404,
        error_type="https://portal.mariscal.edu.pe/problemas/no-encontrado",
    )


@router.get("/trimestres", response_model=ListaTrimestresOut)
def listar_trimestres_admin(
    _: str = Depends(_exigir_rol_administrador),
) -> ListaTrimestresOut:
    """Lista los trimestres del año escolar 2026 y su estado vigente."""
    actual = _trimestre_actual_dict()
    avance = _avance_actual(actual["estado"])
    pendientes_cierre = sum(1 for a in avance if a.porcentaje < 100)
    return ListaTrimestresOut(
        anio_lectivo=2026,
        trimestre_actual_corto=actual["nombre_corto"],
        trimestres=[_serializar_trimestre(t, pendientes_cierre) for t in _trimestres_memoria],
    )


@router.post("/trimestres/{trimestre_id}/transicion", response_model=TrimestreAdminOut)
def ejecutar_transicion_trimestre(
    trimestre_id: int,
    datos: TransicionTrimestreIn,
    request: Request,
    _: str = Depends(_exigir_rol_administrador),
) -> TrimestreAdminOut:
    """Avanza o reabre un trimestre aplicando reglas puras y registrando auditoría (RF05, RF18, RF30)."""
    trimestre = next((t for t in _trimestres_memoria if t["id"] == trimestre_id), None)
    if trimestre is None:
        raise ErrorAplicacion(
            title="Trimestre no encontrado",
            detail=f"No existe un trimestre con identificador {trimestre_id}.",
            status_code=404,
            error_type="https://portal.mariscal.edu.pe/problemas/no-encontrado",
        )

    estado_anterior = trimestre["estado"]
    try:
        nuevo_estado, es_reapertura = validar_transicion_trimestre(
            estado_actual=estado_anterior,
            accion=datos.accion,
            motivo=datos.motivo,
            acta_emitida_siagie=datos.acta_emitida_siagie,
            documento_ugel=datos.documento_ugel,
        )
    except TransicionTrimestreInvalidaError as exc:
        raise ErrorAplicacion(
            title="Transición de trimestre no permitida",
            detail=str(exc),
            status_code=409,
            error_type="https://portal.mariscal.edu.pe/problemas/conflicto-estado",
        ) from exc
    except DatosReaperturaInvalidosError as exc:
        raise ErrorAplicacion(
            title="Datos de reapertura incompletos",
            detail=str(exc),
            status_code=422,
            error_type="https://portal.mariscal.edu.pe/problemas/validacion",
        ) from exc

    trimestre["estado"] = nuevo_estado
    if es_reapertura:
        trimestre["reabierto"] = True
        trimestre["libreta_publicada"] = False
        motivo_txt = (datos.motivo or "").strip()
        sufijo_ugel = (
            f" · {(datos.documento_ugel or '').strip()}" if datos.acta_emitida_siagie else ""
        )
        registrar_evento_auditoria(
            tipo="Reapertura",
            entidad=f"{trimestre['nombre']} · {motivo_txt}{sufijo_ugel}",
            antes=estado_anterior,
            despues=nuevo_estado,
            ip=_ip_cliente(request),
        )
    else:
        registrar_evento_auditoria(
            tipo="Estado",
            entidad=trimestre["nombre"],
            antes=estado_anterior,
            despues=nuevo_estado,
            ip=_ip_cliente(request),
        )

    avance = _avance_actual(nuevo_estado)
    pendientes_cierre = sum(1 for a in avance if a.porcentaje < 100)
    return _serializar_trimestre(trimestre, pendientes_cierre)


@router.post("/trimestres/{trimestre_id}/publicar-libreta", response_model=TrimestreAdminOut)
def publicar_libreta_trimestre(
    trimestre_id: int,
    request: Request,
    _: str = Depends(_exigir_rol_administrador),
) -> TrimestreAdminOut:
    """Publica la libreta de un trimestre cerrado y registra auditoría (RF27, RF18)."""
    trimestre = next((t for t in _trimestres_memoria if t["id"] == trimestre_id), None)
    if trimestre is None:
        raise ErrorAplicacion(
            title="Trimestre no encontrado",
            detail=f"No existe un trimestre con identificador {trimestre_id}.",
            status_code=404,
            error_type="https://portal.mariscal.edu.pe/problemas/no-encontrado",
        )

    try:
        validar_publicacion_libreta(
            estado_actual=trimestre["estado"],
            libreta_publicada=trimestre["libreta_publicada"],
        )
    except TransicionTrimestreInvalidaError as exc:
        raise ErrorAplicacion(
            title="Publicación de libreta no permitida",
            detail=str(exc),
            status_code=409,
            error_type="https://portal.mariscal.edu.pe/problemas/conflicto-estado",
        ) from exc

    trimestre["libreta_publicada"] = True
    registrar_evento_auditoria(
        tipo="Libreta",
        entidad=f"Libreta del {trimestre['nombre']}",
        antes="No publicada",
        despues="Publicada",
        ip=_ip_cliente(request),
    )
    return _serializar_trimestre(trimestre, 0)


def _serializar_seccion(sec: dict[str, Any]) -> SeccionAdminOut:
    return SeccionAdminOut(
        id=sec["id"],
        nivel=sec["nivel"],
        grado=sec["grado"],
        letra=sec["letra"],
        nombre=f"{sec['grado']}.° {sec['letra']}",
        tutor=sec["tutor"],
        auxiliar=sec["auxiliar"],
        cantidad_estudiantes=contar_estudiantes_en_seccion(sec["id"]),
    )


@router.get("/secciones", response_model=ListaSeccionesOut)
def listar_secciones_admin(
    nivel: NivelCatalogo = Query(default="Secundaria"),
    grado: int = Query(default=1, ge=1, le=6),
    _: str = Depends(_exigir_rol_administrador),
) -> ListaSeccionesOut:
    """Lista secciones de un nivel y grado, letras libres A–P y opciones de personal."""
    secciones = obtener_secciones_memoria()
    del_nivel = [s for s in secciones if s["nivel"] == nivel]
    del_grado = sorted(
        [s for s in del_nivel if s["grado"] == grado],
        key=lambda x: x["letra"],
    )
    ocupadas = {s["letra"] for s in del_grado}
    libres = [letra for letra in LETRAS_SECCION_PERMITIDAS if letra not in ocupadas]
    auxiliares = (
        ["Tutor(a) de la sección", *AUXILIARES_DISPONIBLES]
        if nivel == "Primaria"
        else list(AUXILIARES_DISPONIBLES)
    )
    return ListaSeccionesOut(
        nivel=nivel,
        grado=grado,
        total_en_nivel=len(del_nivel),
        secciones=[_serializar_seccion(s) for s in del_grado],
        letras_disponibles=libres,
        docentes_disponibles=list(DOCENTES_DISPONIBLES),
        auxiliares_disponibles=auxiliares,
    )


@router.post("/secciones", response_model=SeccionAdminOut, status_code=201)
def crear_seccion_admin(
    datos: SeccionCreateIn,
    request: Request,
    _: str = Depends(_exigir_rol_administrador),
) -> SeccionAdminOut:
    """Crea una nueva sección escolar validando letra disponible A–P (RF03, RF18)."""
    secciones = obtener_secciones_memoria()
    existentes = [
        s["letra"]
        for s in secciones
        if s["nivel"] == datos.nivel and s["grado"] == datos.grado
    ]
    try:
        letra_norm = validar_nueva_seccion(
            nivel=datos.nivel,
            grado=datos.grado,
            letra=datos.letra,
            letras_existentes=existentes,
        )
    except SeccionDuplicadaError as exc:
        raise ErrorAplicacion(
            title="Sección duplicada",
            detail=str(exc),
            status_code=409,
            error_type="https://portal.mariscal.edu.pe/problemas/conflicto-estado",
        ) from exc
    except DatosCatalogoInvalidosError as exc:
        raise ErrorAplicacion(
            title="Datos de sección inválidos",
            detail=str(exc),
            status_code=422,
            error_type="https://portal.mariscal.edu.pe/problemas/validacion",
        ) from exc

    nueva = {
        "id": f"{datos.nivel[0]}{datos.grado}{letra_norm}",
        "nivel": datos.nivel,
        "grado": datos.grado,
        "letra": letra_norm,
        "tutor": datos.tutor.strip(),
        "auxiliar": datos.auxiliar.strip(),
    }
    secciones.append(nueva)
    registrar_evento_auditoria(
        tipo="Asignación",
        entidad=f"Sección {datos.grado}.° {letra_norm} · {datos.nivel}",
        antes="—",
        despues=f"Creada · tutor(a) {nueva['tutor']}",
        ip=_ip_cliente(request),
    )
    return _serializar_seccion(nueva)


@router.patch("/secciones/{seccion_id}", response_model=SeccionAdminOut)
def actualizar_personal_seccion(
    seccion_id: str,
    datos: SeccionUpdateIn,
    request: Request,
    _: str = Depends(_exigir_rol_administrador),
) -> SeccionAdminOut:
    """Actualiza el tutor(a) y/o auxiliar de una sección registrando auditoría."""
    sec = obtener_seccion_por_id(seccion_id)
    if sec is None:
        raise ErrorAplicacion(
            title="Sección no encontrada",
            detail=f"No existe la sección '{seccion_id}'.",
            status_code=404,
            error_type="https://portal.mariscal.edu.pe/problemas/no-encontrado",
        )

    etiqueta = f"{sec['grado']}.° {sec['letra']}"
    if datos.tutor is not None and datos.tutor.strip() != sec["tutor"]:
        anterior = sec["tutor"]
        sec["tutor"] = datos.tutor.strip()
        registrar_evento_auditoria(
            tipo="Asignación",
            entidad=f"Tutor(a) · {etiqueta}",
            antes=anterior,
            despues=sec["tutor"],
            ip=_ip_cliente(request),
        )
    if datos.auxiliar is not None and datos.auxiliar.strip() != sec["auxiliar"]:
        anterior = sec["auxiliar"]
        sec["auxiliar"] = datos.auxiliar.strip()
        registrar_evento_auditoria(
            tipo="Asignación",
            entidad=f"Auxiliar · {etiqueta}",
            antes=anterior,
            despues=sec["auxiliar"],
            ip=_ip_cliente(request),
        )
    return _serializar_seccion(sec)


@router.delete("/secciones/{seccion_id}", response_model=EliminacionSeccionOut)
def eliminar_seccion_admin(
    seccion_id: str,
    request: Request,
    _: str = Depends(_exigir_rol_administrador),
) -> EliminacionSeccionOut:
    """Elimina una sección solo si no tiene estudiantes asignados (RF03, RF18)."""
    sec = obtener_seccion_por_id(seccion_id)
    if sec is None:
        raise ErrorAplicacion(
            title="Sección no encontrada",
            detail=f"No existe la sección '{seccion_id}'.",
            status_code=404,
            error_type="https://portal.mariscal.edu.pe/problemas/no-encontrado",
        )

    cantidad = contar_estudiantes_en_seccion(seccion_id)
    try:
        validar_eliminacion_seccion(cantidad)
    except SeccionConEstudiantesError as exc:
        raise ErrorAplicacion(
            title="Sección con estudiantes",
            detail=str(exc),
            status_code=409,
            error_type="https://portal.mariscal.edu.pe/problemas/conflicto-estado",
        ) from exc

    obtener_secciones_memoria().remove(sec)
    etiqueta = f"{sec['grado']}.° {sec['letra']}"
    registrar_evento_auditoria(
        tipo="Asignación",
        entidad=f"Sección {etiqueta} · {sec['nivel']}",
        antes="Existente",
        despues="Eliminada",
        ip=_ip_cliente(request),
    )
    return EliminacionSeccionOut(
        seccion_id=seccion_id,
        eliminada=True,
        mensaje=f"Sección {etiqueta} eliminada.",
    )


@router.get("/asignaturas", response_model=CatalogoAsignaturasOut)
def listar_asignaturas_cneb(
    nivel: NivelAsignaturas = Query(default="Secundaria"),
    _: str = Depends(_exigir_rol_administrador),
) -> CatalogoAsignaturasOut:
    """Devuelve las asignaturas oficiales y sus competencias CNEB por nivel (RF03)."""
    crudo = ASIGNATURAS_CNEB.get(nivel, [])
    asignaturas = [
        AsignaturaCatalogoOut(
            nombre=nombre,
            nivel=nivel,
            competencias=[
                CompetenciaAreaCnebOut(codigo=f"C{idx + 1}", descripcion=desc)
                for idx, desc in enumerate(comps)
            ],
        )
        for nombre, comps in crudo
    ]
    return CatalogoAsignaturasOut(
        nivel=nivel,
        total_asignaturas=len(asignaturas),
        total_competencias=sum(len(a.competencias) for a in asignaturas),
        asignaturas=asignaturas,
    )


@router.get("/asignaciones", response_model=ListaAsignacionesOut)
def listar_asignaciones_docentes(
    seccion_id: str = Query(default="S3B"),
    _: str = Depends(_exigir_rol_administrador),
) -> ListaAsignacionesOut:
    """Lista la plana docente titular y suplente por asignatura de una sección."""
    sec = obtener_seccion_por_id(seccion_id)
    if sec is None:
        raise ErrorAplicacion(
            title="Sección no encontrada",
            detail=f"No existe la sección '{seccion_id}'.",
            status_code=404,
            error_type="https://portal.mariscal.edu.pe/problemas/no-encontrado",
        )

    filas: list[AsignacionDocenteOut] = []
    for idx, (nombre_asig, _) in enumerate(ASIGNATURAS_CNEB[sec["nivel"]]):
        actual = obtener_asignacion_docente(sec, nombre_asig, idx)
        filas.append(
            AsignacionDocenteOut(
                seccion_id=seccion_id,
                asignatura=nombre_asig,
                titular=actual["titular"],
                suplente=actual["suplente"],
                alerta=alerta_asignacion(actual["titular"], actual["suplente"]),
            )
        )
    return ListaAsignacionesOut(
        seccion_id=seccion_id,
        seccion_nombre=f"{sec['grado']}.° {sec['letra']}",
        nivel=sec["nivel"],
        grado=sec["grado"],
        tutor=sec["tutor"],
        auxiliar=sec["auxiliar"],
        alertas_pendientes=sum(1 for f in filas if f.alerta),
        asignaciones=filas,
        docentes_disponibles=list(DOCENTES_DISPONIBLES),
    )


@router.patch("/asignaciones", response_model=AsignacionDocenteOut)
def actualizar_asignacion_docente(
    datos: AsignacionDocenteUpdateIn,
    request: Request,
    _: str = Depends(_exigir_rol_administrador),
) -> AsignacionDocenteOut:
    """Actualiza el docente titular y/o suplente de una asignatura y registra auditoría."""
    sec = obtener_seccion_por_id(datos.seccion_id)
    if sec is None:
        raise ErrorAplicacion(
            title="Sección no encontrada",
            detail=f"No existe la sección '{datos.seccion_id}'.",
            status_code=404,
            error_type="https://portal.mariscal.edu.pe/problemas/no-encontrado",
        )

    asignaturas_nivel = [a[0] for a in ASIGNATURAS_CNEB[sec["nivel"]]]
    if datos.asignatura not in asignaturas_nivel:
        raise ErrorAplicacion(
            title="Asignatura no encontrada",
            detail=f"La asignatura '{datos.asignatura}' no pertenece al nivel {sec['nivel']}.",
            status_code=404,
            error_type="https://portal.mariscal.edu.pe/problemas/no-encontrado",
        )

    idx = asignaturas_nivel.index(datos.asignatura)
    actual = obtener_asignacion_docente(sec, datos.asignatura, idx)
    nuevo_tit = actual["titular"] if datos.titular is None else datos.titular.strip()
    nuevo_sup = actual["suplente"] if datos.suplente is None else datos.suplente.strip()
    guardar_asignacion_docente(datos.seccion_id, datos.asignatura, nuevo_tit, nuevo_sup)

    etiqueta = f"{sec['grado']}.° {sec['letra']}"
    if datos.titular is not None and nuevo_tit != actual["titular"]:
        registrar_evento_auditoria(
            tipo="Asignación",
            entidad=f"{datos.asignatura} · {etiqueta} · titular",
            antes=actual["titular"] or "Sin asignar",
            despues=nuevo_tit or "Sin asignar",
            ip=_ip_cliente(request),
        )
    if datos.suplente is not None and nuevo_sup != actual["suplente"]:
        registrar_evento_auditoria(
            tipo="Asignación",
            entidad=f"{datos.asignatura} · {etiqueta} · suplente",
            antes=actual["suplente"] or "Sin suplente",
            despues=nuevo_sup or "Sin suplente",
            ip=_ip_cliente(request),
        )

    return AsignacionDocenteOut(
        seccion_id=datos.seccion_id,
        asignatura=datos.asignatura,
        titular=nuevo_tit,
        suplente=nuevo_sup,
        alerta=alerta_asignacion(nuevo_tit, nuevo_sup),
    )
