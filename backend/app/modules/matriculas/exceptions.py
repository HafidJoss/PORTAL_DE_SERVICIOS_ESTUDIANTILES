"""Excepciones de dominio puras para el módulo de matrículas."""


class MatriculasError(Exception):
    """Error base de dominio del módulo matrículas."""


class AsignacionGradoIncompatibleError(MatriculasError):
    """Se lanza cuando el nivel o grado del estudiante no coincide con la sección (HTTP 422)."""


class MovimientoSeccionInvalidoError(MatriculasError):
    """Se lanza cuando se intenta mover a la misma sección o a otro grado/nivel (HTTP 422)."""
