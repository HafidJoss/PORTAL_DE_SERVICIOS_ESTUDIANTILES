# Spec: plataforma-web · Requirement: Endpoint de verificación de salud y contratos OpenAPI (RC03, AC06)
from app.main import crear_app
from tests.conftest import crear_cliente


def test_evaluacion_calificaciones_responde_niveles_y_conclusiones():
    client = crear_cliente(crear_app())

    resp = client.get("/api/v1/evaluacion/estudiantes/est-demo-1/calificaciones")

    assert resp.status_code == 200
    body = resp.json()
    assert len(body["cursos"]) >= 1
    assert body["criterio_sugerencia"] == "mediana_capacidades"


def test_evaluacion_actividades_diferencia_trabajo_y_sesion_clase():
    client = crear_cliente(crear_app())

    resp = client.get("/api/v1/evaluacion/estudiantes/est-demo-1/actividades")

    assert resp.status_code == 200
    tipos = {a["tipo"] for a in resp.json()["actividades"]}
    assert "trabajo" in tipos
    assert "sesion_clase" in tipos


def test_evaluacion_mensajes_lectura_y_respuesta_en_hilo():
    client = crear_cliente(crear_app())

    lista = client.get("/api/v1/evaluacion/estudiantes/est-demo-1/mensajes")
    assert lista.status_code == 200
    msg_id = lista.json()["mensajes"][0]["id"]

    leer = client.post(f"/api/v1/evaluacion/mensajes/{msg_id}/leer")
    assert leer.status_code == 200
    assert leer.json()["lectura_confirmada"] is True

    resp = client.post(
        f"/api/v1/evaluacion/mensajes/{msg_id}/respuestas",
        json={"contenido": "Profesor, revisé la ficha y tengo una consulta sobre el punto 3."},
    )
    assert resp.status_code == 200
    assert resp.json()["mensaje_id"] == msg_id

    invalido = client.post(
        f"/api/v1/evaluacion/mensajes/{msg_id}/respuestas",
        json={"contenido": ""},
    )
    assert invalido.status_code == 422
