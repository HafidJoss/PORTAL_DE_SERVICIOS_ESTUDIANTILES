# Spec: plataforma-web · Requirement: Endpoint de verificación de salud y contratos OpenAPI (RC03, AC06)
from app.main import crear_app
from tests.conftest import crear_cliente


def test_asistencia_mensual_responde_kpis_calendario_e_incidencias():
    client = crear_cliente(crear_app())

    resp = client.get("/api/v1/asistencia/estudiantes/est-demo-1?mes=11&anio=2026")

    assert resp.status_code == 200
    body = resp.json()
    assert body["mes"] == 11
    assert "kpis" in body
    assert len(body["dias"]) >= 1
    assert "incidencias" in body
