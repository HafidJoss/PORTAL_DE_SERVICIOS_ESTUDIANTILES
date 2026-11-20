# Spec: auditoria · Requirement: Consulta filtrable de la bitácora inalterable y exportación CSV (RF18, RF29, ADR-005)
"""Pruebas de integración de la bitácora de auditoría y exportación CSV (RF18, RF29, ADR-005)."""

from app.main import crear_app
from app.modules.auditoria.registro_stub import reiniciar_eventos_auditoria
from app.modules.personas.router import reiniciar_cuentas_personas
from tests.conftest import crear_cliente


def _preparar_cliente():
    reiniciar_cuentas_personas()
    reiniciar_eventos_auditoria()
    return crear_cliente(crear_app())


def test_bitacora_lista_filtra_muestra_mutacion_en_vivo_y_exporta_csv():
    client = _preparar_cliente()

    # Crear cuenta genera evento de auditoría en vivo
    r_new = client.post(
        "/api/v1/personas/cuentas",
        json={"nombre": "Elena Prado Soto", "dni": "47778899", "rol": "Auxiliar"},
    )
    assert r_new.status_code == 201

    r_list = client.get("/api/v1/auditoria/eventos", params={"tipo": "Cuenta"})
    assert r_list.status_code == 200
    body = r_list.json()
    assert body["total"] >= 2
    assert "Elena Prado Soto" in body["eventos"][0]["entidad"]
    assert body["eventos"][0]["despues"] == "Creada"

    # Exportar CSV filtrado
    r_csv = client.get("/api/v1/auditoria/eventos/exportar", params={"tipo": "Cuenta"})
    assert r_csv.status_code == 200
    assert "text/csv" in r_csv.headers["content-type"]
    texto = r_csv.text
    assert texto.startswith("\ufeff")
    assert '"Fecha";"Hora";"Usuario";"Rol";"Evento";"Entidad";"Antes";"Después";"IP"' in texto
    assert "Elena Prado Soto" in texto


def test_auditoria_rechaza_403_para_roles_no_administradores():
    client = _preparar_cliente()
    headers = {"X-Rol-Usuario": "Docente"}

    assert client.get("/api/v1/auditoria/eventos", headers=headers).status_code == 403
    assert client.get("/api/v1/auditoria/eventos/exportar", headers=headers).status_code == 403
