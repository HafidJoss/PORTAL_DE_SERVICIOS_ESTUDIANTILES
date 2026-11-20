"""Excepciones de dominio puras para el módulo de personas."""


class PersonasError(Exception):
    """Error base de dominio del módulo personas."""


class DatosCuentaInvalidosError(PersonasError):
    """Se lanza cuando nombre, DNI o rol no cumplen el formato o política vigente (HTTP 422)."""


class CuentaDuplicadaError(PersonasError):
    """Se lanza cuando el DNI ya está registrado en otra cuenta (HTTP 409)."""


class OperacionCuentaProtegidaError(PersonasError):
    """Se lanza al intentar editar, bloquear o restablecer una cuenta Administrador (HTTP 403)."""
