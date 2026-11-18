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



# Spec: asistencia · Requirement: Consulta multi-hijo de asistencia mensual y envío de justificaciones escritas del apoderado (RF20, HU16, DA05, RC08)
def test_asistencia_apoderado_multi_hijo_y_justificaciones():
    client = crear_cliente(crear_app())

    hijo_1 = client.get(
        "/api/v1/asistencia/estudiantes/est-demo-1?mes=11&anio=2026&apoderado_id=apo-demo-1"
    )
    assert hijo_1.status_code == 200
    assert hijo_1.json()["seccion"] == "3.° B"
    inc_t1 = next(i for i in hijo_1.json()["incidencias"] if i["id"] == "inc-t1")
    assert inc_t1["puede_justificar"] is True

    hijo_2 = client.get(
        "/api/v1/asistencia/estudiantes/est-demo-2?mes=11&anio=2026&apoderado_id=apo-demo-1"
    )
    assert hijo_2.status_code == 200
    assert hijo_2.json()["seccion"] == "1.° A"
    assert any(i["id"] == "inc-sof-t1" and i["puede_justificar"] for i in hijo_2.json()["incidencias"])

    ajeno_get = client.get(
        "/api/v1/asistencia/estudiantes/est-ajeno?mes=11&anio=2026&apoderado_id=apo-demo-1"
    )
    assert ajeno_get.status_code == 403
    assert ajeno_get.json()["status"] == 403

    just_ok = client.post(
        "/api/v1/asistencia/apoderados/apo-demo-1/hijos/est-demo-1/justificaciones",
        json={
            "incidencia_id": "inc-t1",
            "motivo": "Salud / Cita médica",
            "detalle": "Tuvo control médico temprano y presentó constancia.",
        },
    )
    assert just_ok.status_code == 201
    assert just_ok.json()["estado"] == "en_revision"
    assert just_ok.json()["incidencia_id"] == "inc-t1"

    just_corta = client.post(
        "/api/v1/asistencia/apoderados/apo-demo-1/hijos/est-demo-1/justificaciones",
        json={"incidencia_id": "inc-t1", "motivo": "Transporte", "detalle": "Mal"},
    )
    assert just_corta.status_code == 422
    assert just_corta.json()["status"] == 422

    just_no_existe = client.post(
        "/api/v1/asistencia/apoderados/apo-demo-1/hijos/est-demo-1/justificaciones",
        json={
            "incidencia_id": "inc-inexistente",
            "motivo": "Transporte",
            "detalle": "Hubo congestión vehicular en la ruta.",
        },
    )
    assert just_no_existe.status_code == 404

    just_ya_hecha = client.post(
        "/api/v1/asistencia/apoderados/apo-demo-1/hijos/est-demo-1/justificaciones",
        json={
            "incidencia_id": "inc-fj1",
            "motivo": "Salud / Cita médica",
            "detalle": "Incidencia ya justificada previamente.",
        },
    )
    assert just_ya_hecha.status_code == 400

    ajeno_post = client.post(
        "/api/v1/asistencia/apoderados/apo-demo-1/hijos/est-ajeno/justificaciones",
        json={
            "incidencia_id": "inc-t1",
            "motivo": "Motivo familiar",
            "detalle": "Asunto familiar urgente debidamente comunicado.",
        },
    )
    assert ajeno_post.status_code == 403
    assert ajeno_post.json()["status"] == 403
