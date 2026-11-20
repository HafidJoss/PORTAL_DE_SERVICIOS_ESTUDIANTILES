# Spec: institucion · Requirement: Gestión de secciones, catálogo CNEB y asignaciones docentes (RF03, RF18, HU08, AC04)
"""Pruebas de integración del catálogo escolar en institución (RF03, RF18, HU08, AC04)."""

from app.main import crear_app
from app.modules.auditoria.registro_stub import (
    listar_eventos_auditoria,
    reiniciar_eventos_auditoria,
)
from app.modules.institucion.catalogo_stub import reiniciar_catalogo_institucion
from app.modules.matriculas.nomina_stub import reiniciar_nomina_matriculas
from tests.conftest import crear_cliente


def _preparar_cliente():
    reiniciar_catalogo_institucion()
    reiniciar_nomina_matriculas()
    reiniciar_eventos_auditoria()
    return crear_cliente(crear_app())


def test_secciones_listar_crear_editar_y_eliminar_vacia_con_auditoria():
    client = _preparar_cliente()

    # 1) Listar 1.° de Secundaria
    r_list = client.get("/api/v1/institucion/secciones", params={"nivel": "Secundaria", "grado": 1})
    assert r_list.status_code == 200
    body = r_list.json()
    assert body["nivel"] == "Secundaria"
    assert body["grado"] == 1
    assert any(s["id"] == "S1P" and s["cantidad_estudiantes"] == 0 for s in body["secciones"])
    assert len(body["letras_disponibles"]) >= 1

    # 2) Crear nueva sección en una letra libre
    letra_libre = body["letras_disponibles"][0]
    r_create = client.post(
        "/api/v1/institucion/secciones",
        json={
            "nivel": "Secundaria",
            "grado": 1,
            "letra": letra_libre,
            "tutor": "Prof. Julio Gamboa Rojas",
            "auxiliar": "Sr. Héctor Palomino Ayala",
        },
    )
    assert r_create.status_code == 201
    creada = r_create.json()
    assert creada["letra"] == letra_libre
    assert creada["cantidad_estudiantes"] == 0

    # Duplicado rechaza 409
    r_dup = client.post(
        "/api/v1/institucion/secciones",
        json={
            "nivel": "Secundaria",
            "grado": 1,
            "letra": letra_libre,
            "tutor": "Prof. Julio Gamboa Rojas",
            "auxiliar": "Sr. Héctor Palomino Ayala",
        },
    )
    assert r_dup.status_code == 409

    # 3) Actualizar tutor y auxiliar
    r_patch = client.patch(
        f"/api/v1/institucion/secciones/{creada['id']}",
        json={"tutor": "Prof. Rosa Cárdenas Palomino", "auxiliar": "Sra. Elena Rojas Najarro"},
    )
    assert r_patch.status_code == 200
    assert r_patch.json()["tutor"] == "Prof. Rosa Cárdenas Palomino"

    # 4) Bloqueo 409 al intentar eliminar sección con estudiantes (S3B)
    r_del_bloqueado = client.delete("/api/v1/institucion/secciones/S3B")
    assert r_del_bloqueado.status_code == 409

    # 5) Eliminar sección vacía (creada)
    r_del_ok = client.delete(f"/api/v1/institucion/secciones/{creada['id']}")
    assert r_del_ok.status_code == 200
    assert r_del_ok.json()["eliminada"] is True

    # Auditoría registrada (RF18)
    eventos = listar_eventos_auditoria(tipo="Asignación")
    assert any("Eliminada" in e["despues"] for e in eventos)
    assert any("Creada" in e["despues"] for e in eventos)


def test_asignaturas_cneb_y_asignaciones_docentes_con_alerta_licencia():
    client = _preparar_cliente()

    r_asig = client.get("/api/v1/institucion/asignaturas", params={"nivel": "Transversales"})
    assert r_asig.status_code == 200
    asig_body = r_asig.json()
    assert len(asig_body["asignaturas"]) == 1
    assert len(asig_body["asignaturas"][0]["competencias"]) == 2

    # Asignaciones en 2.° A tiene alerta de licencia para Prof. Miriam Huamaní Torres
    r_asg = client.get("/api/v1/institucion/asignaciones", params={"seccion_id": "S2A"})
    assert r_asg.status_code == 200
    filas = r_asg.json()["asignaciones"]
    ccss = next(f for f in filas if f["asignatura"] == "Ciencias Sociales")
    assert "licencia" in (ccss["alerta"] or "").lower()

    # Asignar suplente elimina alerta y audita
    r_upd = client.patch(
        "/api/v1/institucion/asignaciones",
        json={
            "seccion_id": "S2A",
            "asignatura": "Ciencias Sociales",
            "suplente": "Prof. Lucía Tineo Prado",
        },
    )
    assert r_upd.status_code == 200
    assert r_upd.json()["suplente"] == "Prof. Lucía Tineo Prado"
    assert not r_upd.json()["alerta"]
    assert listar_eventos_auditoria(tipo="Asignación")[0]["despues"] == "Prof. Lucía Tineo Prado"


def test_catalogo_rechaza_403_a_roles_no_administradores():
    client = _preparar_cliente()
    headers = {"X-Rol-Usuario": "Docente"}

    assert client.get("/api/v1/institucion/secciones", headers=headers).status_code == 403
    assert client.get("/api/v1/institucion/asignaturas", headers=headers).status_code == 403
    assert client.get("/api/v1/institucion/asignaciones", headers=headers).status_code == 403
    assert client.delete("/api/v1/institucion/secciones/S1P", headers=headers).status_code == 403
