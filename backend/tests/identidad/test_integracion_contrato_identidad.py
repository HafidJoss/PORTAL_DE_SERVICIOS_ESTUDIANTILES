# Spec: plataforma-web · Requirement: Endpoint de verificación de salud y contratos OpenAPI (RC03, AC06)
from app.main import crear_app
from tests.conftest import crear_cliente


def test_identidad_login_responde_200_con_sesion():
    client = crear_cliente(crear_app())

    resp = client.post(
        "/api/v1/identidad/login",
        json={"dni": "72458193", "contrasena": "clave_segura_123", "recordar": True},
    )

    assert resp.status_code == 200
    body = resp.json()
    assert body["usuario"]["dni"] == "72458193"
    assert body["usuario"]["rol"] == "Estudiante"


def test_identidad_login_rechaza_dni_invalido_con_422_problem_details():
    client = crear_cliente(crear_app())

    resp = client.post(
        "/api/v1/identidad/login",
        json={"dni": "123", "contrasena": "clave_segura_123"},
    )

    assert resp.status_code == 422
    assert resp.json()["status"] == 422


def test_identidad_activar_cuenta_responde_200():
    client = crear_cliente(crear_app())

    resp = client.post(
        "/api/v1/identidad/activar",
        json={
            "dni": "72458193",
            "codigo_activacion": "K7M2QX",
            "nueva_contrasena": "clave_segura_123",
            "acepta_privacidad": True,
        },
    )

    assert resp.status_code == 200
    assert resp.json()["activada"] is True


def test_identidad_activar_rechaza_contrasena_corta_con_422():
    client = crear_cliente(crear_app())

    resp = client.post(
        "/api/v1/identidad/activar",
        json={
            "dni": "72458193",
            "codigo_activacion": "K7M2QX",
            "nueva_contrasena": "123",
            "acepta_privacidad": True,
        },
    )

    assert resp.status_code == 422


def test_identidad_sesion_logout_cambiar_contrasena_y_aviso_privacidad():
    client = crear_cliente(crear_app())

    assert client.get("/api/v1/identidad/sesion").status_code == 200
    assert client.post("/api/v1/identidad/logout").status_code == 200
    assert (
        client.post(
            "/api/v1/identidad/cambiar-contrasena",
            json={
                "contrasena_actual": "clave_anterior_123",
                "nueva_contrasena": "clave_nueva_123",
            },
        ).status_code
        == 200
    )
    aviso = client.get("/api/v1/identidad/aviso-privacidad")
    assert aviso.status_code == 200
    assert "contenido" in aviso.json()


# Spec: identidad · Scenario: Ingreso exitoso de docente con DNI y contraseña válidos (RF14, AC04)
def test_identidad_login_docente_devuelve_perfil_y_secciones():
    client = crear_cliente(crear_app())

    resp = client.post(
        "/api/v1/identidad/login",
        json={"dni": "41257836", "contrasena": "clave_docente_2026", "recordar": True},
    )

    assert resp.status_code == 200
    usuario = resp.json()["usuario"]
    assert usuario["dni"] == "41257836"
    assert usuario["rol"] == "Docente"
    assert usuario["docente_id"] == "doc-demo-1"
    assert usuario["especialidad"] == "Matemática"
    assert usuario["nivel_educativo"] == "Secundaria"
    assert len(usuario["secciones_a_cargo"]) >= 1
