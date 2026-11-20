"""Excepciones de dominio puras para el módulo de institución (sin dependencia de FastAPI)."""


class InstitucionError(Exception):
    """Error base de dominio del módulo institución."""


class TransicionTrimestreInvalidaError(InstitucionError):
    """Se lanza cuando la transición o publicación no es válida para el estado actual (HTTP 409)."""


class DatosReaperturaInvalidosError(InstitucionError):
    """Se lanza cuando faltan el motivo mínimo o la autorización UGEL en reapertura (HTTP 422)."""


class SeccionDuplicadaError(InstitucionError):
    """Se lanza al intentar crear una sección con una letra ya ocupada en el grado (HTTP 409)."""


class SeccionConEstudiantesError(InstitucionError):
    """Se lanza al intentar eliminar una sección que aún tiene estudiantes asignados (HTTP 409)."""


class DatosCatalogoInvalidosError(InstitucionError):
    """Se lanza cuando nivel, grado o letra están fuera de los límites permitidos (HTTP 422)."""
