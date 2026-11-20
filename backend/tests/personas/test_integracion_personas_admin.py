# Spec: personas · Requirement: Gestión de cuentas, código de activación, restablecimiento y bloqueo (RF04, RF14, RF18, AC04)
"""Pruebas de integración de cuentas y roles en personas (RF04, RF14, RF18, AC04)."""

from app.main import crear_app
from app.modules.auditoria.registro_stub import (
    listar_eventos_auditoria,
    reiniciar_eventos_auditoria,
)
from app.modules.personas.router import reiniciar_cuentas_personas
from tests.conftest import crear_cliente


def _preparar_cliente():
    reiniciar_cuentas_personas()
    reiniciar_eventos_auditoria()
    return crear_cliente(crear_app())


def test_cuentas_listar_filtrar_crear_editar_restablecer_y_bloquear_con_auditoria():
    client = _preparar_cliente()

    # 1) Listar con conteos por estado
    r_all = client.get("/api/v1/personas/cuentas")
    assert r_all.status_code == 200
    body = r_all.json()
    assert body["total"] == 15
    assert body["activas"] + body["pendientes"] + body["bloqueadas"] == 15

    # Filtrar por búsqueda DNI
    r_q = client.get("/api/v1/personas/cuentas", params={"q": "41522870"})
    assert r_q.status_code == 200
    assert len(r_q.json()["cuentas"]) == 1
    assert r_q.json()["cuentas"][0]["estado"] == "bloqueada"

    # 2) Crear cuenta nueva con código de 6 caracteres
    r_new = client.post(
        "/api/v1/personas/cuentas",
        json={"nombre": "Pedro Quispe Lapa", "dni": "48123456", "rol": "Apoderado"},
    )
    assert r_new.status_code == 201
    creada = r_new.json()
    assert creada["cuenta"]["estado"] == "pendiente"
    assert len(creada["codigo_activacion"]) == 6
    cuenta_id = creada["cuenta"]["id"]

    # DNI duplicado -> 409
    r_dup = client.post(
        "/api/v1/personas/cuentas",
        json={"nombre": "Otro Nombre", "dni": "48123456", "rol": "Docente"},
    )
    assert r_dup.status_code == 409

    # 3) Editar cuenta
    r_edit = client.patch(
        f"/api/v1/personas/cuentas/{cuenta_id}",
        json={"nombre": "Pedro Quispe Lapa", "dni": "48123456", "rol": "Docente"},
    )
    assert r_edit.status_code == 200
    assert r_edit.json()["rol"] == "Docente"

    # 4) Restablecer código
    r_reset = client.post(f"/api/v1/personas/cuentas/{cuenta_id}/restablecer-codigo")
    assert r_reset.status_code == 200
    assert len(r_reset.json()["codigo_activacion"]) == 6
    assert r_reset.json()["cuenta"]["estado"] == "pendiente"

    # 5) Bloquear y desbloquear
    r_blk = client.patch(
        f"/api/v1/personas/cuentas/{cuenta_id}/estado",
        json={"estado": "bloqueada"},
    )
    assert r_blk.status_code == 200
    assert r_blk.json()["estado"] == "bloqueada"

    r_unblk = client.patch(
        f"/api/v1/personas/cuentas/{cuenta_id}/estado",
        json={"estado": "activa"},
    )
    assert r_unblk.status_code == 200
    assert r_unblk.json()["estado"] == "activa"

    # 6) Protección sobre cuenta Administrador (u1) -> 403
    assert (
        client.patch(
            "/api/v1/personas/cuentas/u1/estado",
            json={"estado": "bloqueada"},
        ).status_code
        == 403
    )

    # Auditoría registrada (RF18)
    eventos_cuenta = listar_eventos_auditoria(tipo="Cuenta")
    assert any("Creada" in e["despues"] for e in eventos_cuenta)
    assert any("Bloqueada" in e["despues"] for e in eventos_cuenta)


def test_personas_rechaza_403_para_roles_no_administradores():
    client = _preparar_cliente()
    headers = {"X-Rol-Usuario": "Estudiante"}

    assert client.get("/api/v1/personas/cuentas", headers=headers).status_code == 403
    assert (
        client.post(
            "/api/v1/personas/cuentas",
            json={"nombre": "Ana Torres", "dni": "49999999", "rol": "Docente"},
            headers=headers,
        ).status_code
        == 403
    )
