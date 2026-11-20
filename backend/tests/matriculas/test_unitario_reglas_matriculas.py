# Spec: matriculas · Requirement: Gestión del pool de estudiantes sin sección y movimiento por grado (RF21, HU13)
"""Pruebas unitarias puras para las reglas de matrícula y ubicación de estudiantes (RF21, HU13)."""

import pytest

from app.modules.matriculas.exceptions import (
    AsignacionGradoIncompatibleError,
    MovimientoSeccionInvalidoError,
)
from app.modules.matriculas.reglas import (
    validar_asignacion_desde_pool,
    validar_movimiento_seccion,
)


class TestReglasMatriculas:
    """Verifica consistencia de nivel y grado al asignar o mover estudiantes."""

    def test_permite_asignar_estudiante_cuando_coinciden_nivel_y_grado(self) -> None:
        validar_asignacion_desde_pool(
            nivel_estudiante="Secundaria",
            grado_estudiante=1,
            nivel_seccion="Secundaria",
            grado_seccion=1,
        )

    def test_rechaza_asignacion_cuando_grado_o_nivel_no_coinciden(self) -> None:
        with pytest.raises(AsignacionGradoIncompatibleError, match="grado"):
            validar_asignacion_desde_pool(
                nivel_estudiante="Secundaria",
                grado_estudiante=4,
                nivel_seccion="Secundaria",
                grado_seccion=1,
            )
        with pytest.raises(AsignacionGradoIncompatibleError, match="nivel"):
            validar_asignacion_desde_pool(
                nivel_estudiante="Secundaria",
                grado_estudiante=1,
                nivel_seccion="Primaria",
                grado_seccion=1,
            )

    def test_permite_mover_a_otra_seccion_del_mismo_grado(self) -> None:
        validar_movimiento_seccion(
            seccion_origen_id="S3B",
            seccion_destino_id="S3A",
            nivel_origen="Secundaria",
            grado_origen=3,
            nivel_destino="Secundaria",
            grado_destino=3,
        )

    def test_rechaza_mover_a_la_misma_seccion_o_a_otro_grado(self) -> None:
        with pytest.raises(MovimientoSeccionInvalidoError, match="misma sección"):
            validar_movimiento_seccion(
                seccion_origen_id="S3B",
                seccion_destino_id="S3B",
                nivel_origen="Secundaria",
                grado_origen=3,
                nivel_destino="Secundaria",
                grado_destino=3,
            )
        with pytest.raises(MovimientoSeccionInvalidoError, match="mismo nivel y grado"):
            validar_movimiento_seccion(
                seccion_origen_id="S3B",
                seccion_destino_id="S4A",
                nivel_origen="Secundaria",
                grado_origen=3,
                nivel_destino="Secundaria",
                grado_destino=4,
            )
