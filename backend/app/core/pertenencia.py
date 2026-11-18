"""Validación transversal de pertenencia apoderado-estudiante (DA05) en fase stub."""

from app.core.errores import ErrorAplicacion

_HIJOS_POR_APODERADO_DEMO: dict[str, set[str]] = {
    "apo-demo-1": {"est-demo-1", "est-demo-2"},
}


def validar_pertenencia_apoderado(
    apoderado_id: str | None,
    estudiante_id: str,
) -> None:
    """Verifica DA05 cuando la consulta estudiantil proviene de un apoderado."""
    if apoderado_id is None:
        return
    vinculados = _HIJOS_POR_APODERADO_DEMO.get(apoderado_id, set())
    if estudiante_id not in vinculados:
        raise ErrorAplicacion(
            title="Acceso no autorizado",
            detail="El estudiante solicitado no está vinculado a este apoderado.",
            status_code=403,
        )
