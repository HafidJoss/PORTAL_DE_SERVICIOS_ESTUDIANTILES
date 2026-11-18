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


# Spec: evaluacion · Requirement: Registro de sesiones de clase, criterios y Nota del día
def test_evaluacion_docente_panel_y_sesiones_k1_k4():
    client = crear_cliente(crear_app())

    panel = client.get("/api/v1/evaluacion/docentes/doc-demo-1/secciones/3B/clases")
    assert panel.status_code == 200
    body = panel.json()
    assert body["seccion_id"] == "3B"
    assert len(body["competencias"]) == 4
    assert len(body["estudiantes"]) == 30
    assert len(body["sesiones"]) >= 10

    creada = client.post(
        "/api/v1/evaluacion/docentes/doc-demo-1/secciones/3B/sesiones",
        json={
            "competencia": "C2",
            "capacidad_idx": 0,
            "tema": "Ecuaciones lineales en contexto",
            "evidencia": "Ficha de ejercicios",
            "fecha": "2026-11-12",
            "criterios": [
                "Identifica datos",
                "Plantea la ecuación",
                "Resuelve sin errores",
                "Verifica el resultado",
            ],
        },
    )
    assert creada.status_code == 201
    assert creada.json()["estado"] == "pendiente"

    invalida = client.post(
        "/api/v1/evaluacion/docentes/doc-demo-1/secciones/3B/sesiones",
        json={
            "competencia": "C2",
            "capacidad_idx": 0,
            "tema": "Ab",
            "evidencia": "",
            "fecha": "2026-11-12",
            "criterios": ["C1", "C2", "C3"],
        },
    )
    assert invalida.status_code == 422
    assert invalida.json()["status"] == 422


# Spec: evaluacion · Scenario: Bloqueo de publicación por criterios incompletos
def test_evaluacion_docente_guardado_y_validacion_notas_sesion():
    client = crear_cliente(crear_app())

    incompleta = client.put(
        "/api/v1/evaluacion/docentes/doc-demo-1/secciones/3B/sesiones/3Bs16/notas",
        json={
            "notas_por_estudiante": {"0": ["A", "A", "AD", "A"]},
            "ajustes_manuales": {},
            "publicar": True,
        },
    )
    assert incompleta.status_code == 400
    assert incompleta.json()["status"] == 400

    completa = {str(i): ["A", "A", "B", "A"] for i in range(30)}
    ok = client.put(
        "/api/v1/evaluacion/docentes/doc-demo-1/secciones/3B/sesiones/3Bs16/notas",
        json={
            "notas_por_estudiante": completa,
            "ajustes_manuales": {"0": "AD"},
            "publicar": True,
        },
    )
    assert ok.status_code == 200
    assert ok.json()["estado"] == "registrada"


# Spec: evaluacion · Requirement: Gestión de actividades, cierre RF22 y observaciones RF24
def test_evaluacion_docente_actividades_cierre_y_observaciones():
    client = crear_cliente(crear_app())

    act = client.post(
        "/api/v1/evaluacion/docentes/doc-demo-1/secciones/3B/actividades",
        json={
            "titulo": "Taller de funciones lineales",
            "fecha_entrega": "2026-11-24",
            "competencia": "C2",
            "descripcion": "Resolver ejercicios 1 al 8.",
            "estado": "borrador",
        },
    )
    assert act.status_code == 201
    assert act.json()["estado"] == "borrador"

    pub = client.post(
        f"/api/v1/evaluacion/docentes/doc-demo-1/actividades/{act.json()['id']}/publicar"
    )
    assert pub.status_code == 200
    assert pub.json()["estado"] == "publicada"

    no_pub = client.post(
        "/api/v1/evaluacion/docentes/doc-demo-1/actividades/act-inexistente/publicar"
    )
    assert no_pub.status_code == 404

    cierre_sin_concl_sec = client.post(
        "/api/v1/evaluacion/docentes/doc-demo-1/secciones/3B/cierre/confirmar",
        json={
            "competencia": "C1",
            "nivel_educativo": "Secundaria",
            "filas": [
                {"estudiante_idx": 0, "nivel": "C", "conclusion": "Falta"},
                {"estudiante_idx": 1, "nivel": "B", "conclusion": ""},
            ],
        },
    )
    assert cierre_sin_concl_sec.status_code == 400

    cierre_sin_concl_pri = client.post(
        "/api/v1/evaluacion/docentes/doc-demo-1/secciones/3B/cierre/confirmar",
        json={
            "competencia": "C1",
            "nivel_educativo": "Primaria",
            "filas": [
                {"estudiante_idx": 0, "nivel": "B", "conclusion": ""},
            ],
        },
    )
    assert cierre_sin_concl_pri.status_code == 400

    cierre_ok = client.post(
        "/api/v1/evaluacion/docentes/doc-demo-1/secciones/3B/cierre/confirmar",
        json={
            "competencia": "C1",
            "nivel_educativo": "Secundaria",
            "filas": [
                {
                    "estudiante_idx": 0,
                    "nivel": "C",
                    "conclusion": "Requiere refuerzo en lectura de tablas.",
                },
                {"estudiante_idx": 1, "nivel": "A", "conclusion": ""},
            ],
        },
    )
    assert cierre_ok.status_code == 200
    assert cierre_ok.json()["confirmada"] is True

    obs_invalida = client.post(
        "/api/v1/evaluacion/docentes/doc-demo-1/secciones/3B/observaciones",
        json={"estudiante_idx": 0, "tipo": "Positiva", "texto": "Ok"},
    )
    assert obs_invalida.status_code == 422

    obs_ok = client.post(
        "/api/v1/evaluacion/docentes/doc-demo-1/secciones/3B/observaciones",
        json={
            "estudiante_idx": 0,
            "tipo": "Positiva",
            "texto": "Participó activamente resolviendo problemas en pizarra.",
        },
    )
    assert obs_ok.status_code == 201
    assert obs_ok.json()["tipo"] == "Positiva"



# Spec: evaluacion · Requirement: Envío docente de mensajes a sección o estudiante sin adjuntos
def test_evaluacion_docente_mensajes_listar_enviar_y_validar():
    client = crear_cliente(crear_app())

    bandeja = client.get("/api/v1/evaluacion/docentes/doc-demo-1/mensajes")
    assert bandeja.status_code == 200
    body = bandeja.json()
    assert len(body["secciones"]) == 4
    assert len(body["enviados"]) >= 1

    creado = client.post(
        "/api/v1/evaluacion/docentes/doc-demo-1/mensajes",
        json={
            "tipo": "Recordatorio",
            "seccion_id": "4A",
            "estudiante_idx": None,
            "asunto": "Traer compás el viernes",
            "cuerpo": "Trabajaremos circunferencias y polígonos inscritos.",
        },
    )
    assert creado.status_code == 201
    assert creado.json()["tipo"] == "Recordatorio"
    assert creado.json()["destinatario"] == "4.° A"

    invalido = client.post(
        "/api/v1/evaluacion/docentes/doc-demo-1/mensajes",
        json={
            "tipo": "Tarea",
            "seccion_id": "4A",
            "asunto": "Ab",
            "cuerpo": "Ok",
        },
    )
    assert invalido.status_code == 422
    assert invalido.json()["status"] == 422

    no_sec = client.post(
        "/api/v1/evaluacion/docentes/doc-demo-1/mensajes",
        json={
            "tipo": "Tarea",
            "seccion_id": "9Z",
            "asunto": "Asunto válido",
            "cuerpo": "Contenido válido para validación de sección.",
        },
    )
    assert no_sec.status_code == 404



# Spec: evaluacion · Requirement: Consulta multi-hijo de calificaciones cualitativas y trabajos para el apoderado (RF08, RF22, RF23, HU06, HU10, DA05, RC08)
def test_evaluacion_multi_hijo_y_pertenencia_apoderado():
    client = crear_cliente(crear_app())

    calif_2 = client.get(
        "/api/v1/evaluacion/estudiantes/est-demo-2/calificaciones?apoderado_id=apo-demo-1"
    )
    assert calif_2.status_code == 200
    nombres_cursos = {c["nombre"] for c in calif_2.json()["cursos"]}
    assert "Ciencia y Tecnología" in nombres_cursos

    acts_2 = client.get(
        "/api/v1/evaluacion/estudiantes/est-demo-2/actividades?apoderado_id=apo-demo-1"
    )
    assert acts_2.status_code == 200
    titulos_2 = {a["titulo"] for a in acts_2.json()["actividades"]}
    assert any("sistema solar" in t.lower() for t in titulos_2)

    msgs_2 = client.get(
        "/api/v1/evaluacion/estudiantes/est-demo-2/mensajes?apoderado_id=apo-demo-1"
    )
    assert msgs_2.status_code == 200
    assert any("Sofía" in m["asunto"] or "Sofía" in m["cuerpo"] for m in msgs_2.json()["mensajes"])

    for ruta in (
        "/api/v1/evaluacion/estudiantes/est-ajeno/calificaciones?apoderado_id=apo-demo-1",
        "/api/v1/evaluacion/estudiantes/est-ajeno/actividades?apoderado_id=apo-demo-1",
        "/api/v1/evaluacion/estudiantes/est-ajeno/mensajes?apoderado_id=apo-demo-1",
    ):
        resp = client.get(ruta)
        assert resp.status_code == 403
        assert resp.json()["status"] == 403
