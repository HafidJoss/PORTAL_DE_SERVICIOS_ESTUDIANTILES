"""Esquemas Pydantic de entrada y salida para el módulo de personas (RF04, RF14)."""

from typing import Literal

from pydantic import BaseModel, Field

from app.modules.identidad.schemas import RolUsuario

EstadoCuentaPersona = Literal["activa", "pendiente", "bloqueada"]
FiltroEstadoCuenta = Literal["todas", "activa", "pendiente", "bloqueada"]


class CuentaPersonaOut(BaseModel):
    """Resumen público de una cuenta del directorio administrativo."""

    id: str
    nombre: str
    dni: str
    rol: RolUsuario
    estado: EstadoCuentaPersona
    ultimo_acceso: str
    extra: str = ""
    codigo_activacion: str | None = None


class ListaCuentasPersonasOut(BaseModel):
    """Listado filtrable de cuentas con contadores por estado."""

    total: int
    activas: int
    pendientes: int
    bloqueadas: int
    cuentas: list[CuentaPersonaOut]


class CuentaPersonaCreateIn(BaseModel):
    """Solicitud de alta de nueva cuenta por DNI."""

    nombre: str = Field(..., min_length=3, max_length=160)
    dni: str = Field(..., min_length=1, max_length=12)
    rol: RolUsuario


class CuentaPersonaUpdateIn(BaseModel):
    """Solicitud de edición de datos básicos de una cuenta."""

    nombre: str = Field(..., min_length=3, max_length=160)
    dni: str = Field(..., min_length=1, max_length=12)
    rol: RolUsuario


class CuentaCodigoGeneradoOut(BaseModel):
    """Respuesta al crear cuenta o restablecer contraseña con código de un solo uso."""

    cuenta: CuentaPersonaOut
    codigo_activacion: str
    mensaje: str


class CambiarEstadoCuentaIn(BaseModel):
    """Solicitud para bloquear o desbloquear una cuenta."""

    estado: Literal["activa", "bloqueada"]
