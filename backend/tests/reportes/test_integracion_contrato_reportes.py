# Spec: plataforma-web · Requirement: Endpoint de verificación de salud y contratos OpenAPI (RC03, AC06)
from app.main import crear_app
from tests.conftest import crear_cliente


def test_reportes_libretas_y_url_firmada_de_descarga():
    client = crear_cliente(crear_app())

    libretas = client.get("/api/v1/reportes/estudiantes/est-demo-1/libretas")
    assert libretas.status_code == 200
    body = libretas.json()
    assert len(body["trimestres"]) == 3
    assert "situacion_final" in body

    descarga = client.get("/api/v1/reportes/estudiantes/est-demo-1/libretas/2/descarga")
    assert descarga.status_code == 200
    assert descarga.json()["expira_en_segundos"] == 900
    assert descarga.json()["url_firmada"].startswith("https://")
