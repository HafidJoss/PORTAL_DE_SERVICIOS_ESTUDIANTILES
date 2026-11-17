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


# Spec: reportes · Requirement: Verificación y descarga firmada SIAGIE y Actas preliminares docentes
def test_reportes_docente_siagie_resumen_y_descarga_firmada():
    client = crear_cliente(crear_app())

    resumen = client.get("/api/v1/reportes/docentes/doc-demo-1/siagie")
    assert resumen.status_code == 200
    body = resumen.json()
    assert body["asignatura"] == "Matemática"
    assert len(body["trimestres"]) == 3

    descarga_ok = client.post(
        "/api/v1/reportes/docentes/doc-demo-1/siagie/3A/descarga",
        json={"trimestre_id": 3, "formato": "excel_siagie"},
    )
    assert descarga_ok.status_code == 200
    assert descarga_ok.json()["expira_en_segundos"] == 900
    assert descarga_ok.json()["nombre_archivo"].endswith(".xlsx")

    acta_ok = client.post(
        "/api/v1/reportes/docentes/doc-demo-1/siagie/3B/descarga",
        json={"trimestre_id": 2, "formato": "acta_preliminar"},
    )
    assert acta_ok.status_code == 200
    assert acta_ok.json()["nombre_archivo"].endswith(".pdf")

    incompleta = client.post(
        "/api/v1/reportes/docentes/doc-demo-1/siagie/3B/descarga",
        json={"trimestre_id": 3, "formato": "excel_siagie"},
    )
    assert incompleta.status_code == 400
    assert incompleta.json()["status"] == 400

    no_existe = client.post(
        "/api/v1/reportes/docentes/doc-demo-1/siagie/9Z/descarga",
        json={"trimestre_id": 3, "formato": "excel_siagie"},
    )
    assert no_existe.status_code == 404
