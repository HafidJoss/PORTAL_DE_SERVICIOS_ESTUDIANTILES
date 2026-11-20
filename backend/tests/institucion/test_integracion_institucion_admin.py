# Spec: institucion · Requirement: Tablero operativo de inicio del Administrador y ciclo de vida de trimestres (RF05, RF18, RF27, RF30, RF31)
"""Pruebas de integración del contrato API de institución y auditoría base (RF05, RF18, RF27, RF30, RF31)."""

from app.main import crear_app
from app.modules.auditoria.registro_stub import (
    listar_eventos_auditoria,
    reiniciar_eventos_auditoria,
)
from app.modules.institucion.router import reiniciar_estado_institucion
from tests.conftest import crear_cliente


def _preparar_cliente():
    reiniciar_estado_institucion()
    reiniciar_eventos_auditoria()
    return crear_cliente(crear_app())


def test_tablero_admin_devuelve_kpis_solicitudes_avance_y_trimestre():
    client = _preparar_cliente()

    resp = client.get("/api/v1/institucion/tablero-admin")

    assert resp.status_code == 200
    body = resp.json()
    assert body["anio_lectivo"] == 2026
    assert body["kpis"]["solicitudes_pendientes"] == 5
    assert body["kpis"]["cuentas_sin_activar"] >= 1
    assert len(body["solicitudes"]) == 5
    assert len(body["avance_secciones"]) >= 4
    assert body["trimestre_actual"]["nombre"] == "III Trimestre"
    assert body["trimestre_actual"]["estado"] == "En Evaluación"
    assert body["resumen_cuentas"]["activas"] > 0


def test_atender_solicitud_actualiza_estado_y_reduce_pendientes():
    client = _preparar_cliente()

    resp = client.patch("/api/v1/institucion/solicitudes/r1/atender")

    assert resp.status_code == 200
    assert resp.json()["atendida"] is True

    tablero = client.get("/api/v1/institucion/tablero-admin").json()
    assert tablero["kpis"]["solicitudes_pendientes"] == 4


def test_atender_solicitud_inexistente_responde_404():
    client = _preparar_cliente()

    resp = client.patch("/api/v1/institucion/solicitudes/no-existe/atender")

    assert resp.status_code == 404
    assert resp.json()["status"] == 404


def test_transicion_trimestre_y_publicacion_libreta_registran_auditoria():
    client = _preparar_cliente()

    # III Trimestre (id=3) pasa En Evaluación -> Cierre Preliminar -> Cerrado -> Publicar libreta
    r1 = client.post(
        "/api/v1/institucion/trimestres/3/transicion",
        json={"accion": "cierre_preliminar"},
    )
    assert r1.status_code == 200
    assert r1.json()["estado"] == "Cierre Preliminar"

    r2 = client.post(
        "/api/v1/institucion/trimestres/3/transicion",
        json={"accion": "cerrar"},
    )
    assert r2.status_code == 200
    assert r2.json()["estado"] == "Cerrado"

    r3 = client.post("/api/v1/institucion/trimestres/3/publicar-libreta")
    assert r3.status_code == 200
    assert r3.json()["libreta_publicada"] is True

    eventos = listar_eventos_auditoria()
    assert eventos[0]["tipo"] == "Libreta"
    assert eventos[0]["antes"] == "No publicada"
    assert eventos[0]["despues"] == "Publicada"
    assert eventos[1]["tipo"] == "Estado"
    assert eventos[1]["despues"] == "Cerrado"
    assert eventos[2]["tipo"] == "Estado"
    assert eventos[2]["despues"] == "Cierre Preliminar"


def test_reapertura_con_motivo_y_ugel_registra_auditoria_y_despublica_libreta():
    client = _preparar_cliente()

    # II Trimestre (id=2) inicia Cerrado con libreta publicada
    resp = client.post(
        "/api/v1/institucion/trimestres/2/transicion",
        json={
            "accion": "reabrir",
            "motivo": "Corrección del nivel de 2 estudiantes de 4.° C en Matemática",
            "acta_emitida_siagie": True,
            "documento_ugel": "Oficio N.° 0345-2026-UGEL-HGA",
        },
    )

    assert resp.status_code == 200
    body = resp.json()
    assert body["estado"] == "Cierre Preliminar"
    assert body["reabierto"] is True
    assert body["libreta_publicada"] is False

    ultimo = listar_eventos_auditoria()[0]
    assert ultimo["tipo"] == "Reapertura"
    assert "Oficio N.° 0345-2026-UGEL-HGA" in ultimo["entidad"]
    assert ultimo["antes"] == "Cerrado"
    assert ultimo["despues"] == "Cierre Preliminar"


def test_reapertura_rechaza_422_y_salto_invalido_rechaza_409():
    client = _preparar_cliente()

    r_422 = client.post(
        "/api/v1/institucion/trimestres/2/transicion",
        json={"accion": "reabrir", "motivo": "muy corto"},
    )
    assert r_422.status_code == 422
    assert r_422.json()["status"] == 422

    r_409 = client.post(
        "/api/v1/institucion/trimestres/3/transicion",
        json={"accion": "cerrar"},
    )
    assert r_409.status_code == 409
    assert r_409.json()["status"] == 409

    r_pub_409 = client.post("/api/v1/institucion/trimestres/3/publicar-libreta")
    assert r_pub_409.status_code == 409


def test_rechaza_403_para_roles_distintos_a_administrador():
    client = _preparar_cliente()
    headers = {"X-Rol-Usuario": "Docente"}

    assert client.get("/api/v1/institucion/tablero-admin", headers=headers).status_code == 403
    assert client.patch("/api/v1/institucion/solicitudes/r1/atender", headers=headers).status_code == 403
    assert client.get("/api/v1/institucion/trimestres", headers=headers).status_code == 403
    assert (
        client.post(
            "/api/v1/institucion/trimestres/3/transicion",
            json={"accion": "cierre_preliminar"},
            headers=headers,
        ).status_code
        == 403
    )
    assert (
        client.post("/api/v1/institucion/trimestres/2/publicar-libreta", headers=headers).status_code
        == 403
    )
