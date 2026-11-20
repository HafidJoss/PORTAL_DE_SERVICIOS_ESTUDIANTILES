"""Reglas de negocio puras para cuentas y roles por DNI (RF04, RF14, AC04)."""

import re
import secrets

from .exceptions import (
    CuentaDuplicadaError,
    DatosCuentaInvalidosError,
    OperacionCuentaProtegidaError,
)

ROLES_PERMITIDOS: tuple[str, ...] = (
    "Administrador",
    "Dirección",
    "Secretaría Académica",
    "Docente",
    "Auxiliar",
    "Apoderado",
    "Estudiante",
)

_ALFABETO_CODIGO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
_PATRON_DNI = re.compile(r"^\d{8}$")


def validar_datos_cuenta(
    *,
    nombre: str,
    dni: str,
    rol: str,
    dnis_existentes: list[str],
    permitir_admin: bool = False,
) -> tuple[str, str, str]:
    """Valida nombre completo, DNI de 8 dígitos único y rol permitido."""
    nombre_limpio = " ".join(nombre.strip().split())
    if len(nombre_limpio.split(" ")) < 2:
        raise DatosCuentaInvalidosError("Escribe nombres y apellidos completos.")

    dni_limpio = dni.strip()
    if not _PATRON_DNI.match(dni_limpio):
        raise DatosCuentaInvalidosError("El DNI debe tener exactamente 8 dígitos numéricos.")

    if rol not in ROLES_PERMITIDOS:
        raise DatosCuentaInvalidosError(f"El rol '{rol}' no es válido.")

    if rol == "Administrador" and not permitir_admin:
        raise DatosCuentaInvalidosError(
            "No se permite crear o escalar cuentas al rol Administrador desde este formulario."
        )

    if dni_limpio in set(dnis_existentes):
        raise CuentaDuplicadaError(f"Ya existe una cuenta registrada con el DNI {dni_limpio}.")

    return nombre_limpio, dni_limpio, rol


def validar_cuenta_modificable(rol_objetivo: str) -> None:
    """Protege cuentas de rol Administrador frente a edición, bloqueo o restablecimiento."""
    if rol_objetivo == "Administrador":
        raise OperacionCuentaProtegidaError(
            "No se puede editar, bloquear ni restablecer una cuenta con rol Administrador."
        )


def generar_codigo_activacion() -> str:
    """Genera un código de activación alfanumérico de 6 caracteres sin caracteres ambiguos."""
    return "".join(secrets.choice(_ALFABETO_CODIGO) for _ in range(6))
