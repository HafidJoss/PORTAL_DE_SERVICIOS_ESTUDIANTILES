# Spec: institucion · Requirement: Gestión de secciones del catálogo escolar por nivel y grado (RF03, HU08)
"""Pruebas unitarias puras para las reglas de catálogo escolar (RF03, HU08)."""

import pytest

from app.modules.institucion.exceptions import (
    DatosCatalogoInvalidosError,
    SeccionConEstudiantesError,
    SeccionDuplicadaError,
)
from app.modules.institucion.reglas import (
    validar_eliminacion_seccion,
    validar_nueva_seccion,
)


class TestReglasSeccionesCatalogo:
    """Verifica creación segura en letras A–P y eliminación de secciones vacías."""

    def test_valida_creacion_en_letra_libre(self) -> None:
        letra = validar_nueva_seccion(
            nivel="Secundaria",
            grado=1,
            letra="p",
            letras_existentes=["A", "B", "C"],
        )
        assert letra == "P"

    def test_rechaza_letra_duplicada_en_el_mismo_grado(self) -> None:
        with pytest.raises(SeccionDuplicadaError, match="ya existe"):
            validar_nueva_seccion(
                nivel="Secundaria",
                grado=3,
                letra="B",
                letras_existentes=["A", "B"],
            )

    def test_rechaza_letra_fuera_del_rango_a_p(self) -> None:
        with pytest.raises(DatosCatalogoInvalidosError, match="A–P"):
            validar_nueva_seccion(
                nivel="Secundaria",
                grado=1,
                letra="Z",
                letras_existentes=[],
            )

    def test_rechaza_grado_fuera_de_rango_por_nivel(self) -> None:
        with pytest.raises(DatosCatalogoInvalidosError, match="grado"):
            validar_nueva_seccion(
                nivel="Secundaria",
                grado=6,
                letra="A",
                letras_existentes=[],
            )
        with pytest.raises(DatosCatalogoInvalidosError, match="grado"):
            validar_nueva_seccion(
                nivel="Primaria",
                grado=7,
                letra="A",
                letras_existentes=[],
            )

    def test_permite_eliminar_seccion_vacia(self) -> None:
        validar_eliminacion_seccion(cantidad_estudiantes=0)

    def test_bloquea_eliminacion_de_seccion_con_estudiantes(self) -> None:
        with pytest.raises(SeccionConEstudiantesError, match="estudiantes"):
            validar_eliminacion_seccion(cantidad_estudiantes=5)
