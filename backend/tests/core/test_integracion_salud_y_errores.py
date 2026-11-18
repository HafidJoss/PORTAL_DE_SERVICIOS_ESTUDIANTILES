# Spec: plataforma-web · Requirement: Endpoint de verificación de salud y contratos OpenAPI (RC03, AC06)
from app.main import crear_app
from tests.conftest import crear_cliente


def test_health_responde_200_con_estado_operativo():
    client = crear_cliente(crear_app())

    resp = client.get("/api/v1/health")

    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


def test_ruta_inexistente_responde_404_en_formato_problem_details():
    client = crear_cliente(crear_app())

    resp = client.get("/api/v1/ruta-que-no-existe")

    assert resp.status_code == 404
    body = resp.json()
    assert body["status"] == 404
    assert body["title"]
    assert body["detail"]
    assert "type" in body


def test_error_de_validacion_responde_422_en_formato_problem_details():
    app = crear_app()

    @app.get("/api/v1/_test-validacion/{numero}")
    def _ruta_test(numero: int):
        return {"numero": numero}

    client = crear_cliente(app)

    resp = client.get("/api/v1/_test-validacion/no-es-entero")

    assert resp.status_code == 422
    body = resp.json()
    assert body["status"] == 422
    assert body["title"]
    assert body["detail"]
    assert "type" in body


def test_openapi_expone_las_18_rutas_base_de_estudiante_v2():
    client = crear_cliente(crear_app())

    resp = client.get("/openapi.json")

    assert resp.status_code == 200
    paths = set(resp.json()["paths"].keys())
    rutas_esperadas = {
        "/api/v1/health",
        "/api/v1/identidad/login",
        "/api/v1/identidad/activar",
        "/api/v1/identidad/logout",
        "/api/v1/identidad/sesion",
        "/api/v1/identidad/cambiar-contrasena",
        "/api/v1/identidad/aviso-privacidad",
        "/api/v1/seguimiento/estudiantes/{estudiante_id}/inicio",
        "/api/v1/seguimiento/estudiantes/{estudiante_id}/novedades/visto",
        "/api/v1/seguimiento/estudiantes/{estudiante_id}/cursos",
        "/api/v1/seguimiento/estudiantes/{estudiante_id}/cursos/{asignatura_id}",
        "/api/v1/seguimiento/docentes/{docente_id}/inicio",
        "/api/v1/seguimiento/docentes/{docente_id}/bandeja/{mensaje_id}/leer",
        "/api/v1/seguimiento/docentes/{docente_id}/bandeja/leer-todo",
        "/api/v1/seguimiento/docentes/{docente_id}/bandeja/{mensaje_id}/responder",
        "/api/v1/seguimiento/docentes/{docente_id}/cursos",
        "/api/v1/seguimiento/docentes/{docente_id}/secciones/{seccion_id}",
        "/api/v1/seguimiento/docentes/{docente_id}/secciones/{seccion_id}/anuncios",
        "/api/v1/seguimiento/apoderados/{apoderado_id}/hijos/{estudiante_id}/inicio",
        "/api/v1/seguimiento/apoderados/{apoderado_id}/comunicados/{comunicado_id}/confirmar-lectura",
        "/api/v1/evaluacion/estudiantes/{estudiante_id}/calificaciones",
        "/api/v1/evaluacion/estudiantes/{estudiante_id}/actividades",
        "/api/v1/evaluacion/estudiantes/{estudiante_id}/mensajes",
        "/api/v1/evaluacion/mensajes/{mensaje_id}/leer",
        "/api/v1/evaluacion/mensajes/{mensaje_id}/respuestas",
        "/api/v1/evaluacion/docentes/{docente_id}/secciones/{seccion_id}/clases",
        "/api/v1/evaluacion/docentes/{docente_id}/secciones/{seccion_id}/sesiones",
        "/api/v1/evaluacion/docentes/{docente_id}/secciones/{seccion_id}/sesiones/{sesion_id}/notas",
        "/api/v1/evaluacion/docentes/{docente_id}/secciones/{seccion_id}/actividades",
        "/api/v1/evaluacion/docentes/{docente_id}/actividades/{actividad_id}/publicar",
        "/api/v1/evaluacion/docentes/{docente_id}/secciones/{seccion_id}/cierre/confirmar",
        "/api/v1/evaluacion/docentes/{docente_id}/secciones/{seccion_id}/observaciones",
        "/api/v1/evaluacion/docentes/{docente_id}/mensajes",
        "/api/v1/asistencia/estudiantes/{estudiante_id}",
        "/api/v1/asistencia/apoderados/{apoderado_id}/hijos/{estudiante_id}/justificaciones",
        "/api/v1/reportes/estudiantes/{estudiante_id}/libretas",
        "/api/v1/reportes/estudiantes/{estudiante_id}/libretas/{trimestre_id}/descarga",
        "/api/v1/reportes/docentes/{docente_id}/siagie",
        "/api/v1/reportes/docentes/{docente_id}/siagie/{seccion_id}/descarga",
    }
    assert rutas_esperadas.issubset(paths)
    assert len(paths) == 39

