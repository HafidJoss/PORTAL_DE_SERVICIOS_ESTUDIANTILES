# Spec: personas · Requirement: Consulta filtrable, alta, edición y protección de cuentas por DNI (RF04, RF14, AC04)
"""Pruebas unitarias puras para las reglas de cuentas y roles (RF04, RF14, AC04)."""

import pytest

from app.modules.personas.exceptions import (
    CuentaDuplicadaError,
    DatosCuentaInvalidosError,
    OperacionCuentaProtegidaError,
)
from app.modules.personas.reglas import (
    generar_codigo_activacion,
    validar_cuenta_modificable,
    validar_datos_cuenta,
)


class TestReglasCuentas:
    """Verifica validaciones de nombres, DNI único, rol y protección de Administrador."""

    def test_valida_datos_correctos_y_normaliza_espacios(self) -> None:
        nombre, dni, rol = validar_datos_cuenta(
            nombre="  Juana   Ccori Flores ",
            dni="41522870",
            rol="Apoderado",
            dnis_existentes=["10456723"],
        )
        assert nombre == "Juana Ccori Flores"
        assert dni == "41522870"
        assert rol == "Apoderado"

    def test_rechaza_nombre_con_menos_de_dos_palabras(self) -> None:
        with pytest.raises(DatosCuentaInvalidosError, match="nombres y apellidos"):
            validar_datos_cuenta(
                nombre="Juana",
                dni="41522870",
                rol="Apoderado",
                dnis_existentes=[],
            )

    def test_rechaza_dni_invalido_o_duplicado(self) -> None:
        with pytest.raises(DatosCuentaInvalidosError, match="8 dígitos"):
            validar_datos_cuenta(
                nombre="Juana Ccori",
                dni="1234",
                rol="Apoderado",
                dnis_existentes=[],
            )
        with pytest.raises(CuentaDuplicadaError, match="Ya existe"):
            validar_datos_cuenta(
                nombre="Juana Ccori",
                dni="41522870",
                rol="Apoderado",
                dnis_existentes=["41522870"],
            )

    def test_rechaza_crear_rol_administrador_desde_alta_estandar(self) -> None:
        with pytest.raises(DatosCuentaInvalidosError, match="Administrador"):
            validar_datos_cuenta(
                nombre="Otro Admin",
                dni="44556677",
                rol="Administrador",
                dnis_existentes=[],
            )

    def test_protege_cuenta_administrador_contra_modificaciones(self) -> None:
        validar_cuenta_modificable("Docente")
        with pytest.raises(OperacionCuentaProtegidaError, match="Administrador"):
            validar_cuenta_modificable("Administrador")

    def test_genera_codigo_activacion_de_6_caracteres_sin_ambiguos(self) -> None:
        codigo = generar_codigo_activacion()
        assert len(codigo) == 6
        assert all(c not in "0O1I" for c in codigo)
