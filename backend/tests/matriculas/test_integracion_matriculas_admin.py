# Spec: matriculas · Requirement: Pool sin sección, nómina por sección, movimiento y estado escolar (RF18, RF21, HU13, AC04)
"""Pruebas de integración de matrículas y nómina por sección (RF18, RF21, HU13, AC04)."""

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


def test_pool_sin_seccion_y_asignacion_validada_por_grado():
    client = _preparar_cliente()

    r_pool = client.get("/api/v1/matriculas/sin-seccion")
    assert r_pool.status_code == 200
    pool = r_pool.json()["estudiantes"]
    assert len(pool) == 6
    est_1ro = next(e for e in pool if e["grado"] == 1)
    est_4to = next(e for e in pool if e["grado"] == 4)

    # Grado incompatible (4.° -> S1P) rechaza 422
    r_bad = client.post(
        "/api/v1/matriculas/asignar",
        json={"estudiante_id": est_4to["id"], "seccion_id": "S1P"},
    )
    assert r_bad.status_code == 422

    # Grado compatible (1.° -> S1P) asigna y audita
    r_ok = client.post(
        "/api/v1/matriculas/asignar",
        json={"estudiante_id": est_1ro["id"], "seccion_id": "S1P"},
    )
    assert r_ok.status_code == 200
    assert r_ok.json()["estado"] == "Activo"

    assert len(client.get("/api/v1/matriculas/sin-seccion").json()["estudiantes"]) == 5
    nomina_s1p = client.get("/api/v1/matriculas/secciones/S1P/estudiantes").json()
    assert len(nomina_s1p["estudiantes"]) == 1
    assert nomina_s1p["estudiantes"][0]["id"] == est_1ro["id"]
    assert listar_eventos_auditoria(tipo="Asignación")[0]["antes"] == "Sin sección"


def test_estudiantes_seccion_resumen_mover_y_cambiar_estado():
    client = _preparar_cliente()

    r_nom = client.get("/api/v1/matriculas/secciones/S3B/estudiantes")
    assert r_nom.status_code == 200
    body = r_nom.json()
    assert len(body["estudiantes"]) >= 1
    est = body["estudiantes"][0]
    assert "codigo" in est
    assert len(est["resumen"]["areas"]) == 5

    # Cambiar estado a Trasladado
    r_est = client.patch(
        f"/api/v1/matriculas/estudiantes/{est['id']}/estado",
        json={"seccion_id": "S3B", "estado": "Trasladado"},
    )
    assert r_est.status_code == 200
    assert r_est.json()["estado"] == "Trasladado"

    # Mover a otra sección del mismo grado (S3A)
    r_mov = client.patch(
        f"/api/v1/matriculas/estudiantes/{est['id']}/mover",
        json={"seccion_origen_id": "S3B", "seccion_destino_id": "S3A"},
    )
    assert r_mov.status_code == 200
    assert r_mov.json()["seccion_destino_id"] == "S3A"

    # Quitar de la sección hacia el pool (__pool)
    r_pool = client.patch(
        f"/api/v1/matriculas/estudiantes/{est['id']}/mover",
        json={"seccion_origen_id": "S3A", "seccion_destino_id": "__pool"},
    )
    assert r_pool.status_code == 200
    assert r_pool.json()["seccion_destino_id"] == "__pool"
    assert listar_eventos_auditoria(tipo="Asignación")[0]["despues"] == "Sin sección"


def test_matriculas_rechaza_403_a_roles_no_administradores():
    client = _preparar_cliente()
    headers = {"X-Rol-Usuario": "Apoderado"}

    assert client.get("/api/v1/matriculas/sin-seccion", headers=headers).status_code == 403
    assert (
        client.get("/api/v1/matriculas/secciones/S3B/estudiantes", headers=headers).status_code
        == 403
    )
    assert (
        client.post(
            "/api/v1/matriculas/asignar",
            json={"estudiante_id": "p0", "seccion_id": "S1P"},
            headers=headers,
        ).status_code
        == 403
    )
