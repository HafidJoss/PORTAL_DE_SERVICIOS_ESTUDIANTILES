"""Endpoints contractuales (stub) del módulo de matrículas (RF18, RF21, HU13)."""

from typing import Any

from fastapi import APIRouter, Depends, Header, Request

from app.core.errores import ErrorAplicacion
from app.modules.auditoria.registro_stub import registrar_evento_auditoria
from app.modules.institucion.catalogo_stub import (
    listar_secciones_mismo_grado,
    obtener_seccion_por_id,
)

from .exceptions import (
    AsignacionGradoIncompatibleError,
    MovimientoSeccionInvalidoError,
)
from .nomina_stub import obtener_estudiantes_de_seccion, obtener_pool_memoria
from .reglas import validar_asignacion_desde_pool, validar_movimiento_seccion
from .schemas import (
    AsignarDesdePoolIn,
    CambiarEstadoEstudianteIn,
    EstudianteNominaSeccionOut,
    EstudianteSinSeccionOut,
    MoverEstudianteIn,
    MoverEstudianteOut,
    NivelAreaResumenOut,
    NominaSeccionOut,
    OpcionSeccionDestinoOut,
    PoolSinSeccionOut,
    ResumenEstudianteSeccionOut,
)

router = APIRouter(prefix="/matriculas", tags=["matriculas"])

_AREAS_RESUMEN = [
    "Matemática",
    "Comunicación",
    "Ciencia y Tecnología",
    "Ciencias Sociales",
    "Inglés",
]
_NIVELES_CICLO: tuple[str, ...] = ("A", "AD", "A", "B", "A")


def _exigir_rol_administrador(
    x_rol_usuario: str | None = Header(default="Administrador", alias="X-Rol-Usuario"),
) -> str:
    rol = (x_rol_usuario or "Administrador").strip()
    if rol != "Administrador":
        raise ErrorAplicacion(
            title="Acceso denegado",
            detail="Solo el rol Administrador puede gestionar la nómina de matrículas.",
            status_code=403,
            error_type="https://portal.mariscal.edu.pe/problemas/acceso-denegado",
        )
    return rol


def _ip_cliente(request: Request) -> str:
    reenviada = request.headers.get("x-forwarded-for")
    if reenviada:
        return reenviada.split(",")[0].strip()
    return request.client.host if request.client else "181.65.22.14"


def _serializar_estudiante_seccion(est: dict[str, Any], tutor: str) -> EstudianteNominaSeccionOut:
    semilla = sum(ord(c) for c in est["id"])
    asistencia = 88 + (semilla % 12)
    pendientes = semilla % 3
    observaciones = semilla % 2
    areas = [
        NivelAreaResumenOut(
            area=area,
            nivel=_NIVELES_CICLO[(semilla + idx) % len(_NIVELES_CICLO)],  # type: ignore[arg-type]
        )
        for idx, area in enumerate(_AREAS_RESUMEN)
    ]
    return EstudianteNominaSeccionOut(
        id=est["id"],
        nombre=est["nombre"],
        codigo=est["codigo"],
        estado=est["estado"],
        resumen=ResumenEstudianteSeccionOut(
            codigo_siagie=est["codigo"],
            dni=est.get("dni", "70000001"),
            apoderado=est.get("apoderado", "Apoderado registrado"),
            tutor=tutor,
            asistencia_pct=asistencia,
            pendientes=pendientes,
            observaciones=observaciones,
            areas=areas,
        ),
    )


@router.get("/sin-seccion", response_model=PoolSinSeccionOut)
def listar_estudiantes_sin_seccion(
    _: str = Depends(_exigir_rol_administrador),
) -> PoolSinSeccionOut:
    """Devuelve los estudiantes de la nómina SIAGIE pendientes de asignación."""
    pool = obtener_pool_memoria()
    return PoolSinSeccionOut(
        total=len(pool),
        estudiantes=[
            EstudianteSinSeccionOut(
                id=p["id"],
                nombre=p["nombre"],
                codigo=p["codigo"],
                nivel=p["nivel"],
                grado=p["grado"],
                nota=p["nota"],
            )
            for p in pool
        ],
    )


@router.get("/secciones/{seccion_id}/estudiantes", response_model=NominaSeccionOut)
def listar_estudiantes_seccion(
    seccion_id: str,
    _: str = Depends(_exigir_rol_administrador),
) -> NominaSeccionOut:
    """Devuelve la nómina ordenada de estudiantes de una sección con su resumen."""
    seccion = obtener_seccion_por_id(seccion_id)
    if seccion is None:
        raise ErrorAplicacion(
            title="Sección no encontrada",
            detail=f"No existe una sección con identificador '{seccion_id}'.",
            status_code=404,
            error_type="https://portal.mariscal.edu.pe/problemas/no-encontrado",
        )

    estudiantes = sorted(
        obtener_estudiantes_de_seccion(seccion_id),
        key=lambda e: e["nombre"].lower(),
    )
    hermanas = listar_secciones_mismo_grado(
        nivel=seccion["nivel"],
        grado=seccion["grado"],
        excluir_id=seccion_id,
    )
    return NominaSeccionOut(
        seccion_id=seccion_id,
        seccion_nombre=f"{seccion['grado']}.° {seccion['letra']}",
        nivel=seccion["nivel"],
        grado=seccion["grado"],
        total=len(estudiantes),
        opciones_movimiento=[
            OpcionSeccionDestinoOut(
                id=h["id"],
                etiqueta=f"Mover a {h['grado']}.° {h['letra']}",
            )
            for h in hermanas
        ],
        estudiantes=[_serializar_estudiante_seccion(e, seccion["tutor"]) for e in estudiantes],
    )


@router.post("/asignar", response_model=EstudianteNominaSeccionOut)
def asignar_estudiante_desde_pool(
    datos: AsignarDesdePoolIn,
    request: Request,
    _: str = Depends(_exigir_rol_administrador),
) -> EstudianteNominaSeccionOut:
    """Asigna un estudiante del pool Sin sección a una sección del grado correspondiente."""
    pool = obtener_pool_memoria()
    est = next((p for p in pool if p["id"] == datos.estudiante_id), None)
    if est is None:
        raise ErrorAplicacion(
            title="Estudiante no encontrado en nómina sin sección",
            detail=f"No se encontró al estudiante '{datos.estudiante_id}' en el pool sin sección.",
            status_code=404,
            error_type="https://portal.mariscal.edu.pe/problemas/no-encontrado",
        )

    seccion = obtener_seccion_por_id(datos.seccion_id)
    if seccion is None:
        raise ErrorAplicacion(
            title="Sección no encontrada",
            detail=f"No existe una sección con identificador '{datos.seccion_id}'.",
            status_code=404,
            error_type="https://portal.mariscal.edu.pe/problemas/no-encontrado",
        )

    try:
        validar_asignacion_desde_pool(
            nivel_estudiante=est["nivel"],
            grado_estudiante=est["grado"],
            nivel_seccion=seccion["nivel"],
            grado_seccion=seccion["grado"],
        )
    except AsignacionGradoIncompatibleError as exc:
        raise ErrorAplicacion(
            title="Grado o nivel incompatible",
            detail=str(exc),
            status_code=422,
            error_type="https://portal.mariscal.edu.pe/problemas/validacion",
        ) from exc

    pool.remove(est)
    nuevo = {
        "id": est["id"],
        "nombre": est["nombre"],
        "codigo": est["codigo"],
        "dni": est.get("dni", "74500123"),
        "apoderado": est.get("apoderado", "Apoderado registrado"),
        "estado": "Activo",
    }
    destino_lista = obtener_estudiantes_de_seccion(datos.seccion_id)
    destino_lista.append(nuevo)
    destino_lista.sort(key=lambda e: e["nombre"].lower())

    registrar_evento_auditoria(
        tipo="Asignación",
        entidad=nuevo["nombre"],
        antes="Sin sección",
        despues=f"{seccion['grado']}.° {seccion['letra']}",
        ip=_ip_cliente(request),
    )
    return _serializar_estudiante_seccion(nuevo, seccion["tutor"])


@router.patch("/estudiantes/{estudiante_id}/mover", response_model=MoverEstudianteOut)
def mover_estudiante_seccion(
    estudiante_id: str,
    datos: MoverEstudianteIn,
    request: Request,
    _: str = Depends(_exigir_rol_administrador),
) -> MoverEstudianteOut:
    """Mueve a un estudiante a otra sección del mismo grado o lo retira al pool ('__pool')."""
    origen = obtener_seccion_por_id(datos.seccion_origen_id)
    if origen is None:
        raise ErrorAplicacion(
            title="Sección de origen no encontrada",
            detail=f"No existe la sección '{datos.seccion_origen_id}'.",
            status_code=404,
            error_type="https://portal.mariscal.edu.pe/problemas/no-encontrado",
        )

    lista_origen = obtener_estudiantes_de_seccion(datos.seccion_origen_id)
    est = next((e for e in lista_origen if e["id"] == estudiante_id), None)
    if est is None:
        raise ErrorAplicacion(
            title="Estudiante no encontrado en la sección",
            detail=f"El estudiante '{estudiante_id}' no pertenece a la sección '{datos.seccion_origen_id}'.",
            status_code=404,
            error_type="https://portal.mariscal.edu.pe/problemas/no-encontrado",
        )

    etiqueta_origen = f"{origen['grado']}.° {origen['letra']}"

    if datos.seccion_destino_id == "__pool":
        lista_origen.remove(est)
        obtener_pool_memoria().append(
            {
                "id": est["id"],
                "nombre": est["nombre"],
                "codigo": est["codigo"],
                "nivel": origen["nivel"],
                "grado": origen["grado"],
                "nota": f"Va a {origen['grado']}.° de {origen['nivel']} · retirado de {etiqueta_origen}",
                "estado": "Activo",
            }
        )
        registrar_evento_auditoria(
            tipo="Asignación",
            entidad=est["nombre"],
            antes=etiqueta_origen,
            despues="Sin sección",
            ip=_ip_cliente(request),
        )
        return MoverEstudianteOut(
            estudiante_id=estudiante_id,
            seccion_origen_id=datos.seccion_origen_id,
            seccion_destino_id="__pool",
            mensaje=f"{est['nombre']} quedó sin sección.",
        )

    destino = obtener_seccion_por_id(datos.seccion_destino_id)
    if destino is None:
        raise ErrorAplicacion(
            title="Sección de destino no encontrada",
            detail=f"No existe la sección '{datos.seccion_destino_id}'.",
            status_code=404,
            error_type="https://portal.mariscal.edu.pe/problemas/no-encontrado",
        )

    try:
        validar_movimiento_seccion(
            seccion_origen_id=datos.seccion_origen_id,
            seccion_destino_id=datos.seccion_destino_id,
            nivel_origen=origen["nivel"],
            grado_origen=origen["grado"],
            nivel_destino=destino["nivel"],
            grado_destino=destino["grado"],
        )
    except MovimientoSeccionInvalidoError as exc:
        raise ErrorAplicacion(
            title="Movimiento de sección inválido",
            detail=str(exc),
            status_code=422,
            error_type="https://portal.mariscal.edu.pe/problemas/validacion",
        ) from exc

    lista_origen.remove(est)
    lista_destino = obtener_estudiantes_de_seccion(datos.seccion_destino_id)
    lista_destino.append(est)
    lista_destino.sort(key=lambda e: e["nombre"].lower())

    etiqueta_destino = f"{destino['grado']}.° {destino['letra']}"
    registrar_evento_auditoria(
        tipo="Asignación",
        entidad=est["nombre"],
        antes=etiqueta_origen,
        despues=etiqueta_destino,
        ip=_ip_cliente(request),
    )
    return MoverEstudianteOut(
        estudiante_id=estudiante_id,
        seccion_origen_id=datos.seccion_origen_id,
        seccion_destino_id=datos.seccion_destino_id,
        mensaje=f"{est['nombre']} movido a {etiqueta_destino}.",
    )


@router.patch("/estudiantes/{estudiante_id}/estado", response_model=EstudianteNominaSeccionOut)
def cambiar_estado_estudiante(
    estudiante_id: str,
    datos: CambiarEstadoEstudianteIn,
    request: Request,
    _: str = Depends(_exigir_rol_administrador),
) -> EstudianteNominaSeccionOut:
    """Actualiza el estado (Activo, Retirado, Trasladado) de un estudiante en su sección."""
    seccion = obtener_seccion_por_id(datos.seccion_id)
    if seccion is None:
        raise ErrorAplicacion(
            title="Sección no encontrada",
            detail=f"No existe la sección '{datos.seccion_id}'.",
            status_code=404,
            error_type="https://portal.mariscal.edu.pe/problemas/no-encontrado",
        )

    lista = obtener_estudiantes_de_seccion(datos.seccion_id)
    est = next((e for e in lista if e["id"] == estudiante_id), None)
    if est is None:
        raise ErrorAplicacion(
            title="Estudiante no encontrado",
            detail=f"El estudiante '{estudiante_id}' no pertenece a la sección '{datos.seccion_id}'.",
            status_code=404,
            error_type="https://portal.mariscal.edu.pe/problemas/no-encontrado",
        )

    estado_anterior = est["estado"]
    est["estado"] = datos.estado
    registrar_evento_auditoria(
        tipo="Asignación",
        entidad=f"{est['nombre']} · {seccion['grado']}.° {seccion['letra']}",
        antes=estado_anterior,
        despues=datos.estado,
        ip=_ip_cliente(request),
    )
    return _serializar_estudiante_seccion(est, seccion["tutor"])
