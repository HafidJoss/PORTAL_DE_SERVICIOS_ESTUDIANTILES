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


# Spec: seguimiento · Scenario: Visualización integral del tablero inicial del docente
def test_seguimiento_docente_inicio_responde_bandeja_clases_y_alertas():
    client = crear_cliente(crear_app())

    resp = client.get("/api/v1/seguimiento/docentes/doc-demo-1/inicio")

    assert resp.status_code == 200
    body = resp.json()
    assert body["docente_id"] == "doc-demo-1"
    assert len(body["mensajes_bandeja"]) >= 4
    assert len(body["clases_hoy"]) >= 1
    assert len(body["notas_pendientes"]) >= 1
    assert len(body["alertas"]) >= 1
    assert len(body["etapas_trimestre"]) == 4


# Spec: seguimiento · Scenario: Marcado masivo y respuesta en hilo a consulta de estudiante
def test_seguimiento_docente_bandeja_leer_y_responder_hilo():
    client = crear_cliente(crear_app())

    leer_uno = client.post("/api/v1/seguimiento/docentes/doc-demo-1/bandeja/m1/leer")
    assert leer_uno.status_code == 200
    assert leer_uno.json()["ok"] is True

    leer_todo = client.post("/api/v1/seguimiento/docentes/doc-demo-1/bandeja/leer-todo")
    assert leer_todo.status_code == 200
    assert leer_todo.json()["ok"] is True

    responder = client.post(
        "/api/v1/seguimiento/docentes/doc-demo-1/bandeja/m2/responder",
        json={"texto": "Revisaremos el ejercicio 7 hoy en clase."},
    )
    assert responder.status_code == 200
    assert responder.json()["mensaje_id"] == "m2"
    assert responder.json()["texto"] == "Revisaremos el ejercicio 7 hoy en clase."


# Spec: seguimiento · Scenario: Validación de respuesta vacía y mensajes institucionales de solo lectura
def test_seguimiento_docente_rechaza_respuesta_a_institucion_o_invalida():
    client = crear_cliente(crear_app())

    inst = client.post(
        "/api/v1/seguimiento/docentes/doc-demo-1/bandeja/m1/responder",
        json={"texto": "Respuesta no permitida"},
    )
    assert inst.status_code == 400
    assert inst.json()["status"] == 400

    vacio = client.post(
        "/api/v1/seguimiento/docentes/doc-demo-1/bandeja/m2/responder",
        json={"texto": "a"},
    )
    assert vacio.status_code == 422

    inexistente = client.post(
        "/api/v1/seguimiento/docentes/doc-demo-1/bandeja/no-existe/leer"
    )
    assert inexistente.status_code == 404


# Spec: seguimiento · Scenario: Visualización de tarjetas por sección en Mis cursos del docente
def test_seguimiento_docente_cursos_responde_secciones_asignadas():
    client = crear_cliente(crear_app())

    resp = client.get("/api/v1/seguimiento/docentes/doc-demo-1/cursos")

    assert resp.status_code == 200
    body = resp.json()
    assert body["asignatura_nombre"] == "Matemática"
    assert len(body["secciones"]) >= 4
    primera = body["secciones"][0]
    assert "horario" in primera
    assert "aula" in primera
    assert "competencias_confirmadas" in primera


# Spec: seguimiento · Requirement: Detalle de sección docente y anuncios unidireccionales
def test_seguimiento_docente_detalle_seccion_y_anuncios():
    client = crear_cliente(crear_app())

    detalle = client.get("/api/v1/seguimiento/docentes/doc-demo-1/secciones/3B")
    assert detalle.status_code == 200
    body = detalle.json()
    assert body["seccion_id"] == "3B"
    assert len(body["distribucion_niveles"]) == 4
    assert len(body["stream"]) >= 1

    no_existe = client.get("/api/v1/seguimiento/docentes/doc-demo-1/secciones/9Z")
    assert no_existe.status_code == 404
    assert no_existe.json()["status"] == 404

    anuncio_vacio = client.post(
        "/api/v1/seguimiento/docentes/doc-demo-1/secciones/3B/anuncios",
        json={"tipo": "Aviso", "texto": "Hi"},
    )
    assert anuncio_vacio.status_code == 422
    assert anuncio_vacio.json()["status"] == 422

    anuncio_ok = client.post(
        "/api/v1/seguimiento/docentes/doc-demo-1/secciones/3B/anuncios",
        json={
            "tipo": "Recordatorio",
            "texto": "Traer regla y compás para la sesión del viernes.",
        },
    )
    assert anuncio_ok.status_code == 201
    assert anuncio_ok.json()["tipo"] == "Recordatorio"
