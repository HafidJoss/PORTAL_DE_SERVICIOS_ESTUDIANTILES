"""Reglas de negocio puras para el ciclo de vida de trimestres (RF05, RF27, RF30)."""

from typing import Literal

from .exceptions import (
    DatosCatalogoInvalidosError,
    DatosReaperturaInvalidosError,
    SeccionConEstudiantesError,
    SeccionDuplicadaError,
    TransicionTrimestreInvalidaError,
)

EstadoTrimestreLiteral = Literal[
    "Aperturado",
    "En Evaluación",
    "Cierre Preliminar",
    "Cerrado",
]

AccionTrimestreLiteral = Literal[
    "iniciar_evaluacion",
    "cierre_preliminar",
    "cerrar",
    "reabrir",
]

TRANSICIONES_AVANCE: dict[tuple[EstadoTrimestreLiteral, AccionTrimestreLiteral], EstadoTrimestreLiteral] = {
    ("Aperturado", "iniciar_evaluacion"): "En Evaluación",
    ("En Evaluación", "cierre_preliminar"): "Cierre Preliminar",
    ("Cierre Preliminar", "cerrar"): "Cerrado",
}

MIN_LONGITUD_MOTIVO_REAPERTURA = 15
MIN_LONGITUD_DOCUMENTO_UGEL = 5


def validar_transicion_trimestre(
    estado_actual: EstadoTrimestreLiteral,
    accion: AccionTrimestreLiteral,
    motivo: str | None = None,
    acta_emitida_siagie: bool = False,
    documento_ugel: str | None = None,
) -> tuple[EstadoTrimestreLiteral, bool]:
    """Valida una transición de estado de trimestre y devuelve (nuevo_estado, es_reapertura)."""
    if accion == "reabrir":
        if estado_actual != "Cerrado":
            raise TransicionTrimestreInvalidaError(
                f"Solo se puede reabrir un trimestre Cerrado (estado actual: {estado_actual})."
            )
        motivo_limpio = (motivo or "").strip()
        if len(motivo_limpio) < MIN_LONGITUD_MOTIVO_REAPERTURA:
            raise DatosReaperturaInvalidosError(
                "Describe el motivo de reapertura (mínimo 15 caracteres)."
            )
        if acta_emitida_siagie:
            doc_limpio = (documento_ugel or "").strip()
            if len(doc_limpio) < MIN_LONGITUD_DOCUMENTO_UGEL:
                raise DatosReaperturaInvalidosError(
                    "Registra el número de documento de autorización de la UGEL (mínimo 5 caracteres)."
                )
        return "Cierre Preliminar", True

    destino = TRANSICIONES_AVANCE.get((estado_actual, accion))
    if destino is None:
        raise TransicionTrimestreInvalidaError(
            f"La acción '{accion}' no es válida para un trimestre en estado '{estado_actual}'."
        )
    return destino, False


def validar_publicacion_libreta(
    estado_actual: EstadoTrimestreLiteral,
    libreta_publicada: bool,
) -> None:
    """Valida que un trimestre esté Cerrado y sin libreta publicada aún (RF27)."""
    if estado_actual != "Cerrado":
        raise TransicionTrimestreInvalidaError(
            f"No se puede publicar la libreta porque el trimestre está '{estado_actual}'."
        )
    if libreta_publicada:
        raise TransicionTrimestreInvalidaError(
            "La libreta de este trimestre ya fue publicada."
        )


LETRAS_SECCION_PERMITIDAS: tuple[str, ...] = tuple("ABCDEFGHIJKLMNOP")
MAX_GRADO_POR_NIVEL: dict[str, int] = {"Primaria": 6, "Secundaria": 5}


def validar_nueva_seccion(
    nivel: str,
    grado: int,
    letra: str,
    letras_existentes: list[str],
) -> str:
    """Valida nivel, grado y letra disponible (A–P) para crear una nueva sección (RF03)."""
    max_grado = MAX_GRADO_POR_NIVEL.get(nivel)
    if max_grado is None:
        raise DatosCatalogoInvalidosError(f"Nivel educativo no válido: '{nivel}'.")
    if grado < 1 or grado > max_grado:
        raise DatosCatalogoInvalidosError(
            f"El grado {grado} está fuera de rango para {nivel} (1 a {max_grado})."
        )
    letra_norm = letra.strip().upper()
    if letra_norm not in LETRAS_SECCION_PERMITIDAS:
        raise DatosCatalogoInvalidosError(
            f"La letra '{letra}' debe estar en el rango permitido A–P."
        )
    existentes_norm = {item.strip().upper() for item in letras_existentes}
    if letra_norm in existentes_norm:
        raise SeccionDuplicadaError(
            f"La sección {grado}.° {letra_norm} de {nivel} ya existe."
        )
    return letra_norm


def validar_eliminacion_seccion(cantidad_estudiantes: int) -> None:
    """Impide eliminar una sección mientras tenga estudiantes asignados (RF03)."""
    if cantidad_estudiantes > 0:
        raise SeccionConEstudiantesError(
            f"No se puede eliminar la sección: tiene {cantidad_estudiantes} estudiantes asignados. "
            "Muévelos a otra sección o quítalos primero."
        )
