"""Endpoints contractuales (stub) del módulo de personas (RF04, RF14, RF18)."""

from copy import deepcopy
from typing import Any

from fastapi import APIRouter, Depends, Header, Query, Request

from app.core.errores import ErrorAplicacion
from app.modules.auditoria.registro_stub import registrar_evento_auditoria

from .exceptions import (
    CuentaDuplicadaError,
    DatosCuentaInvalidosError,
    OperacionCuentaProtegidaError,
)
from .reglas import (
    generar_codigo_activacion,
    validar_cuenta_modificable,
    validar_datos_cuenta,
)
from .schemas import (
    CambiarEstadoCuentaIn,
    CuentaCodigoGeneradoOut,
    CuentaPersonaCreateIn,
    CuentaPersonaOut,
    CuentaPersonaUpdateIn,
    FiltroEstadoCuenta,
    ListaCuentasPersonasOut,
)

router = APIRouter(prefix="/personas", tags=["personas"])

_ETIQUETA_ESTADO = {
    "activa": "Activa",
    "pendiente": "Pendiente de activación",
    "bloqueada": "Bloqueada",
}

_CUENTAS_BASE: list[dict[str, Any]] = [
    {"id": "u1", "nombre": "Marco Ayala Sulca", "dni": "10456723", "rol": "Administrador", "estado": "activa", "ultimo_acceso": "Hoy, 07:58", "extra": ""},
    {"id": "u2", "nombre": "Gloria Mendoza Yupanqui", "dni": "09871245", "rol": "Dirección", "estado": "activa", "ultimo_acceso": "Hoy, 07:40", "extra": ""},
    {"id": "u3", "nombre": "Patricia Vílchez Sulca", "dni": "40128833", "rol": "Secretaría Académica", "estado": "activa", "ultimo_acceso": "Ayer, 16:12", "extra": ""},
    {"id": "u4", "nombre": "Julio Gamboa Rojas", "dni": "41257836", "rol": "Docente", "estado": "activa", "ultimo_acceso": "Hoy, 06:51", "extra": ""},
    {"id": "u5", "nombre": "Rosa Cárdenas Palomino", "dni": "41980021", "rol": "Docente", "estado": "activa", "ultimo_acceso": "Hoy, 07:15", "extra": ""},
    {"id": "u6", "nombre": "Miriam Huamaní Torres", "dni": "42210987", "rol": "Docente", "estado": "activa", "ultimo_acceso": "6 nov", "extra": ""},
    {"id": "u7", "nombre": "Lucía Tineo Prado", "dni": "45876102", "rol": "Docente", "estado": "pendiente", "ultimo_acceso": "—", "extra": ""},
    {"id": "u8", "nombre": "Héctor Palomino Ayala", "dni": "20045671", "rol": "Auxiliar", "estado": "activa", "ultimo_acceso": "Hoy, 07:52", "extra": ""},
    {"id": "u9", "nombre": "Luis Ángel Quispe Huamán", "dni": "72458193", "rol": "Estudiante", "estado": "activa", "ultimo_acceso": "Ayer, 18:40", "extra": " · 3.° B"},
    {"id": "u10", "nombre": "Diego Cárdenas Rojas", "dni": "73011254", "rol": "Estudiante", "estado": "activa", "ultimo_acceso": "Hoy, 06:50", "extra": " · 3.° B"},
    {"id": "u11", "nombre": "Sofía Quispe Huamán", "dni": "78120046", "rol": "Estudiante", "estado": "pendiente", "ultimo_acceso": "—", "extra": " · 1.° A"},
    {"id": "u12", "nombre": "Rosa Huamán Ccori", "dni": "40871256", "rol": "Apoderado", "estado": "activa", "ultimo_acceso": "Hoy, 07:05", "extra": " · 2 menores"},
    {"id": "u13", "nombre": "Juana Ccori Flores", "dni": "41522870", "rol": "Apoderado", "estado": "bloqueada", "ultimo_acceso": "3 nov", "extra": " · 1 menor"},
    {"id": "u14", "nombre": "Fermín Ayala Bautista", "dni": "23891045", "rol": "Apoderado", "estado": "pendiente", "ultimo_acceso": "—", "extra": " · 1 menor"},
    {"id": "u15", "nombre": "Teresa Llactahuamán Soto", "dni": "44017659", "rol": "Apoderado", "estado": "pendiente", "ultimo_acceso": "—", "extra": " · 2 menores"},
]

_cuentas_memoria: list[dict[str, Any]] = deepcopy(_CUENTAS_BASE)
_codigos_memoria: dict[str, str] = {}
_correlativo_cuenta: int = 16


def reiniciar_cuentas_personas() -> None:
    """Restaura las cuentas iniciales en memoria para pruebas deterministas."""
    global _cuentas_memoria, _codigos_memoria, _correlativo_cuenta
    _cuentas_memoria = deepcopy(_CUENTAS_BASE)
    _codigos_memoria = {}
    _correlativo_cuenta = 16


def _exigir_rol_administrador(
    x_rol_usuario: str | None = Header(default="Administrador", alias="X-Rol-Usuario"),
) -> str:
    rol = (x_rol_usuario or "Administrador").strip()
    if rol != "Administrador":
        raise ErrorAplicacion(
            title="Acceso denegado",
            detail="Solo el rol Administrador puede gestionar cuentas y roles.",
            status_code=403,
            error_type="https://portal.mariscal.edu.pe/problemas/acceso-denegado",
        )
    return rol


def _ip_cliente(request: Request) -> str:
    reenviada = request.headers.get("x-forwarded-for")
    if reenviada:
        return reenviada.split(",")[0].strip()
    return request.client.host if request.client else "181.65.22.14"


def _serializar_cuenta(c: dict[str, Any]) -> CuentaPersonaOut:
    return CuentaPersonaOut(
        id=c["id"],
        nombre=c["nombre"],
        dni=c["dni"],
        rol=c["rol"],
        estado=c["estado"],
        ultimo_acceso=c["ultimo_acceso"],
        extra=c.get("extra", ""),
        codigo_activacion=_codigos_memoria.get(c["id"]),
    )


@router.get("/cuentas", response_model=ListaCuentasPersonasOut)
def listar_cuentas_personas(
    estado: FiltroEstadoCuenta = Query(default="todas"),
    rol: str = Query(default="Todos"),
    q: str = Query(default=""),
    _: str = Depends(_exigir_rol_administrador),
) -> ListaCuentasPersonasOut:
    """Lista las cuentas filtradas por estado, rol y búsqueda por nombre o DNI."""
    busqueda = q.strip().lower()
    filtradas = [
        c
        for c in _cuentas_memoria
        if (estado == "todas" or c["estado"] == estado)
        and (rol == "Todos" or c["rol"] == rol)
        and (not busqueda or busqueda in c["nombre"].lower() or busqueda in c["dni"])
    ]
    return ListaCuentasPersonasOut(
        total=len(_cuentas_memoria),
        activas=sum(1 for c in _cuentas_memoria if c["estado"] == "activa"),
        pendientes=sum(1 for c in _cuentas_memoria if c["estado"] == "pendiente"),
        bloqueadas=sum(1 for c in _cuentas_memoria if c["estado"] == "bloqueada"),
        cuentas=[_serializar_cuenta(c) for c in filtradas],
    )


@router.post("/cuentas", response_model=CuentaCodigoGeneradoOut, status_code=201)
def crear_cuenta_persona(
    datos: CuentaPersonaCreateIn,
    request: Request,
    _: str = Depends(_exigir_rol_administrador),
) -> CuentaCodigoGeneradoOut:
    """Crea una cuenta en estado pendiente con código de activación de 6 caracteres."""
    global _correlativo_cuenta
    dnis_existentes = [c["dni"] for c in _cuentas_memoria]
    try:
        nombre, dni, rol = validar_datos_cuenta(
            nombre=datos.nombre,
            dni=datos.dni,
            rol=datos.rol,
            dnis_existentes=dnis_existentes,
        )
    except CuentaDuplicadaError as exc:
        raise ErrorAplicacion(
            title="DNI duplicado",
            detail=str(exc),
            status_code=409,
            error_type="https://portal.mariscal.edu.pe/problemas/conflicto-estado",
        ) from exc
    except DatosCuentaInvalidosError as exc:
        raise ErrorAplicacion(
            title="Datos de cuenta inválidos",
            detail=str(exc),
            status_code=422,
            error_type="https://portal.mariscal.edu.pe/problemas/validacion",
        ) from exc

    cuenta_id = f"u{_correlativo_cuenta}"
    _correlativo_cuenta += 1
    codigo = generar_codigo_activacion()
    nueva = {
        "id": cuenta_id,
        "nombre": nombre,
        "dni": dni,
        "rol": rol,
        "estado": "pendiente",
        "ultimo_acceso": "—",
        "extra": "",
    }
    _cuentas_memoria.insert(0, nueva)
    _codigos_memoria[cuenta_id] = codigo

    registrar_evento_auditoria(
        tipo="Cuenta",
        entidad=f"Cuenta de {nombre} ({rol})",
        antes="—",
        despues="Creada",
        ip=_ip_cliente(request),
    )
    return CuentaCodigoGeneradoOut(
        cuenta=_serializar_cuenta(nueva),
        codigo_activacion=codigo,
        mensaje=f"Cuenta creada. Código de activación: {codigo}",
    )


@router.patch("/cuentas/{cuenta_id}", response_model=CuentaPersonaOut)
def editar_cuenta_persona(
    cuenta_id: str,
    datos: CuentaPersonaUpdateIn,
    request: Request,
    _: str = Depends(_exigir_rol_administrador),
) -> CuentaPersonaOut:
    """Edita nombre, DNI o rol de una cuenta no administradora registrando auditoría."""
    cuenta = next((c for c in _cuentas_memoria if c["id"] == cuenta_id), None)
    if cuenta is None:
        raise ErrorAplicacion(
            title="Cuenta no encontrada",
            detail=f"No existe la cuenta '{cuenta_id}'.",
            status_code=404,
            error_type="https://portal.mariscal.edu.pe/problemas/no-encontrado",
        )

    try:
        validar_cuenta_modificable(cuenta["rol"])
        dnis_otros = [c["dni"] for c in _cuentas_memoria if c["id"] != cuenta_id]
        nombre, dni, rol = validar_datos_cuenta(
            nombre=datos.nombre,
            dni=datos.dni,
            rol=datos.rol,
            dnis_existentes=dnis_otros,
        )
    except OperacionCuentaProtegidaError as exc:
        raise ErrorAplicacion(
            title="Cuenta protegida",
            detail=str(exc),
            status_code=403,
            error_type="https://portal.mariscal.edu.pe/problemas/acceso-denegado",
        ) from exc
    except CuentaDuplicadaError as exc:
        raise ErrorAplicacion(
            title="DNI duplicado",
            detail=str(exc),
            status_code=409,
            error_type="https://portal.mariscal.edu.pe/problemas/conflicto-estado",
        ) from exc
    except DatosCuentaInvalidosError as exc:
        raise ErrorAplicacion(
            title="Datos de cuenta inválidos",
            detail=str(exc),
            status_code=422,
            error_type="https://portal.mariscal.edu.pe/problemas/validacion",
        ) from exc

    ip = _ip_cliente(request)
    if cuenta["nombre"] != nombre:
        registrar_evento_auditoria(
            tipo="Cuenta",
            entidad=f"Cuenta de {nombre} · Nombre",
            antes=cuenta["nombre"],
            despues=nombre,
            ip=ip,
        )
        cuenta["nombre"] = nombre
    if cuenta["dni"] != dni:
        registrar_evento_auditoria(
            tipo="Cuenta",
            entidad=f"Cuenta de {nombre} · DNI",
            antes=cuenta["dni"],
            despues=dni,
            ip=ip,
        )
        cuenta["dni"] = dni
    if cuenta["rol"] != rol:
        registrar_evento_auditoria(
            tipo="Cuenta",
            entidad=f"Cuenta de {nombre} · Rol",
            antes=cuenta["rol"],
            despues=rol,
            ip=ip,
        )
        cuenta["rol"] = rol

    return _serializar_cuenta(cuenta)


@router.post("/cuentas/{cuenta_id}/restablecer-codigo", response_model=CuentaCodigoGeneradoOut)
def restablecer_codigo_cuenta(
    cuenta_id: str,
    request: Request,
    _: str = Depends(_exigir_rol_administrador),
) -> CuentaCodigoGeneradoOut:
    """Genera un nuevo código de activación / restablece contraseña (solo Administrador)."""
    cuenta = next((c for c in _cuentas_memoria if c["id"] == cuenta_id), None)
    if cuenta is None:
        raise ErrorAplicacion(
            title="Cuenta no encontrada",
            detail=f"No existe la cuenta '{cuenta_id}'.",
            status_code=404,
            error_type="https://portal.mariscal.edu.pe/problemas/no-encontrado",
        )

    try:
        validar_cuenta_modificable(cuenta["rol"])
    except OperacionCuentaProtegidaError as exc:
        raise ErrorAplicacion(
            title="Cuenta protegida",
            detail=str(exc),
            status_code=403,
            error_type="https://portal.mariscal.edu.pe/problemas/acceso-denegado",
        ) from exc

    estado_anterior = cuenta["estado"]
    codigo = generar_codigo_activacion()
    _codigos_memoria[cuenta_id] = codigo
    cuenta["estado"] = "pendiente"
    motivo = (
        "Nuevo código de activación"
        if estado_anterior == "pendiente"
        else "Contraseña restablecida"
    )
    registrar_evento_auditoria(
        tipo="Cuenta",
        entidad=f"Cuenta de {cuenta['nombre']} ({cuenta['rol']})",
        antes=_ETIQUETA_ESTADO[estado_anterior],
        despues=motivo,
        ip=_ip_cliente(request),
    )
    return CuentaCodigoGeneradoOut(
        cuenta=_serializar_cuenta(cuenta),
        codigo_activacion=codigo,
        mensaje=f"Código generado para {cuenta['nombre']}: {codigo}",
    )


@router.patch("/cuentas/{cuenta_id}/estado", response_model=CuentaPersonaOut)
def cambiar_estado_cuenta_persona(
    cuenta_id: str,
    datos: CambiarEstadoCuentaIn,
    request: Request,
    _: str = Depends(_exigir_rol_administrador),
) -> CuentaPersonaOut:
    """Bloquea o desbloquea una cuenta no administradora registrando auditoría."""
    cuenta = next((c for c in _cuentas_memoria if c["id"] == cuenta_id), None)
    if cuenta is None:
        raise ErrorAplicacion(
            title="Cuenta no encontrada",
            detail=f"No existe la cuenta '{cuenta_id}'.",
            status_code=404,
            error_type="https://portal.mariscal.edu.pe/problemas/no-encontrado",
        )

    try:
        validar_cuenta_modificable(cuenta["rol"])
    except OperacionCuentaProtegidaError as exc:
        raise ErrorAplicacion(
            title="Cuenta protegida",
            detail=str(exc),
            status_code=403,
            error_type="https://portal.mariscal.edu.pe/problemas/acceso-denegado",
        ) from exc

    anterior = cuenta["estado"]
    cuenta["estado"] = datos.estado
    registrar_evento_auditoria(
        tipo="Cuenta",
        entidad=f"Cuenta de {cuenta['nombre']}",
        antes=_ETIQUETA_ESTADO[anterior],
        despues=_ETIQUETA_ESTADO[datos.estado],
        ip=_ip_cliente(request),
    )
    return _serializar_cuenta(cuenta)
