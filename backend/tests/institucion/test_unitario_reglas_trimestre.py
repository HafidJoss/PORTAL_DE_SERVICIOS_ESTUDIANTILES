# Spec: institucion · Requirement: Gestión del ciclo de vida de trimestres, publicación de libreta y reapertura excepcional (RF05, RF27, RF30)
"""Pruebas unitarias puras para las reglas del ciclo de vida de trimestres (RF05, RF27, RF30)."""

import pytest

from app.modules.institucion.exceptions import (
    DatosReaperturaInvalidosError,
    TransicionTrimestreInvalidaError,
)
from app.modules.institucion.reglas import (
    validar_publicacion_libreta,
    validar_transicion_trimestre,
)


class TestTransicionesTrimestre:
    """Verifica el flujo secuencial Aperturado -> En Evaluación -> Cierre Preliminar -> Cerrado."""

    def test_iniciar_evaluacion_desde_aperturado(self) -> None:
        nuevo_estado, es_reapertura = validar_transicion_trimestre(
            estado_actual="Aperturado",
            accion="iniciar_evaluacion",
        )
        assert nuevo_estado == "En Evaluación"
        assert es_reapertura is False

    def test_pasar_a_cierre_preliminar_desde_en_evaluacion(self) -> None:
        nuevo_estado, es_reapertura = validar_transicion_trimestre(
            estado_actual="En Evaluación",
            accion="cierre_preliminar",
        )
        assert nuevo_estado == "Cierre Preliminar"
        assert es_reapertura is False

    def test_cerrar_trimestre_desde_cierre_preliminar(self) -> None:
        nuevo_estado, es_reapertura = validar_transicion_trimestre(
            estado_actual="Cierre Preliminar",
            accion="cerrar",
        )
        assert nuevo_estado == "Cerrado"
        assert es_reapertura is False

    def test_rechaza_salto_directo_en_evaluacion_a_cerrado(self) -> None:
        with pytest.raises(TransicionTrimestreInvalidaError):
            validar_transicion_trimestre(
                estado_actual="En Evaluación",
                accion="cerrar",
            )

    def test_rechaza_reabrir_trimestre_que_no_esta_cerrado(self) -> None:
        with pytest.raises(TransicionTrimestreInvalidaError):
            validar_transicion_trimestre(
                estado_actual="En Evaluación",
                accion="reabrir",
                motivo="Corrección solicitada por docente de 4.° C",
            )


class TestReaperturaTrimestre:
    """Verifica las reglas excepcionales de reapertura (RF30)."""

    def test_reabrir_sin_acta_emitida_con_motivo_valido(self) -> None:
        nuevo_estado, es_reapertura = validar_transicion_trimestre(
            estado_actual="Cerrado",
            accion="reabrir",
            motivo="Corrección del nivel de 2 estudiantes de 4.° C en Matemática",
            acta_emitida_siagie=False,
        )
        assert nuevo_estado == "Cierre Preliminar"
        assert es_reapertura is True

    def test_reabrir_con_acta_emitida_y_oficio_ugel_valido(self) -> None:
        nuevo_estado, es_reapertura = validar_transicion_trimestre(
            estado_actual="Cerrado",
            accion="reabrir",
            motivo="Corrección por error de registro autorizado por Dirección",
            acta_emitida_siagie=True,
            documento_ugel="Oficio N.° 0345-2026-UGEL-HGA",
        )
        assert nuevo_estado == "Cierre Preliminar"
        assert es_reapertura is True

    def test_rechaza_reapertura_con_motivo_menor_a_15_caracteres(self) -> None:
        with pytest.raises(DatosReaperturaInvalidosError, match="15 caracteres"):
            validar_transicion_trimestre(
                estado_actual="Cerrado",
                accion="reabrir",
                motivo="Error breve",
            )

    def test_rechaza_reapertura_con_acta_emitida_sin_documento_ugel(self) -> None:
        with pytest.raises(DatosReaperturaInvalidosError, match="UGEL"):
            validar_transicion_trimestre(
                estado_actual="Cerrado",
                accion="reabrir",
                motivo="Corrección de nivel en 4.° C tras emisión de acta oficial",
                acta_emitida_siagie=True,
                documento_ugel="   ",
            )


class TestPublicacionLibreta:
    """Verifica las reglas de publicación oficial de libreta (RF27)."""

    def test_permite_publicar_libreta_cuando_trimestre_cerrado_y_no_publicada(self) -> None:
        validar_publicacion_libreta(estado_actual="Cerrado", libreta_publicada=False)

    def test_rechaza_publicar_libreta_si_trimestre_no_cerrado(self) -> None:
        with pytest.raises(TransicionTrimestreInvalidaError):
            validar_publicacion_libreta(estado_actual="En Evaluación", libreta_publicada=False)

    def test_rechaza_publicar_libreta_si_ya_fue_publicada(self) -> None:
        with pytest.raises(TransicionTrimestreInvalidaError):
            validar_publicacion_libreta(estado_actual="Cerrado", libreta_publicada=True)
