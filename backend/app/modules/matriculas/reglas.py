"""Reglas de negocio puras para asignación y movimiento de nómina escolar (RF21, HU13)."""

from .exceptions import (
    AsignacionGradoIncompatibleError,
    MovimientoSeccionInvalidoError,
)


def validar_asignacion_desde_pool(
    *,
    nivel_estudiante: str,
    grado_estudiante: int,
    nivel_seccion: str,
    grado_seccion: int,
) -> None:
    """Verifica que el estudiante sin sección corresponda al mismo nivel y grado de la sección."""
    if nivel_estudiante != nivel_seccion:
        raise AsignacionGradoIncompatibleError(
            f"El estudiante pertenece al nivel {nivel_estudiante}, no a {nivel_seccion}."
        )
    if grado_estudiante != grado_seccion:
        raise AsignacionGradoIncompatibleError(
            f"El estudiante corresponde a {grado_estudiante}.° grado y no puede asignarse a {grado_seccion}.° grado."
        )


def validar_movimiento_seccion(
    *,
    seccion_origen_id: str,
    seccion_destino_id: str,
    nivel_origen: str,
    grado_origen: int,
    nivel_destino: str,
    grado_destino: int,
) -> None:
    """Verifica que el traslado interno sea a una sección distinta del mismo nivel y grado."""
    if seccion_origen_id == seccion_destino_id:
        raise MovimientoSeccionInvalidoError(
            "El estudiante ya pertenece a la misma sección de destino."
        )
    if nivel_origen != nivel_destino or grado_origen != grado_destino:
        raise MovimientoSeccionInvalidoError(
            "Solo se puede mover a un estudiante a otra sección del mismo nivel y grado."
        )
