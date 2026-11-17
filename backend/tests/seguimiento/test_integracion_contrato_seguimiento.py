# Spec: plataforma-web · Requirement: Endpoint de verificación de salud y contratos OpenAPI (RC03, AC06)
from app.main import crear_app
from tests.conftest import crear_cliente


def test_seguimiento_inicio_responde_datos_para_variantes_a_b_y_c():
    client = crear_cliente(crear_app())

    resp = client.get("/api/v1/seguimiento/estudiantes/est-demo-1/inicio")

    assert resp.status_code == 200
    body = resp.json()
    assert "novedades" in body
    assert "kpis" in body
    assert "agenda_semanal" in body
    assert "distribucion_niveles" in body


def test_seguimiento_marcar_visto_responde_200():
    client = crear_cliente(crear_app())

    resp = client.post("/api/v1/seguimiento/estudiantes/est-demo-1/novedades/visto")

    assert resp.status_code == 200
    assert resp.json()["visto"] is True


def test_seguimiento_cursos_y_detalle_de_curso():
    client = crear_cliente(crear_app())

    lista = client.get("/api/v1/seguimiento/estudiantes/est-demo-1/cursos")
    assert lista.status_code == 200
    cursos = lista.json()["cursos"]
    assert len(cursos) >= 1

    curso_id = cursos[0]["asignatura_id"]
    detalle = client.get(f"/api/v1/seguimiento/estudiantes/est-demo-1/cursos/{curso_id}")
    assert detalle.status_code == 200
    assert detalle.json()["asignatura_id"] == curso_id
    assert len(detalle.json()["equipo"]) >= 1
