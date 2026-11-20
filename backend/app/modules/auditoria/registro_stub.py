"""Registro contractual (stub) append-only de eventos de auditoría (RF18, ADR-005)."""

from copy import deepcopy
from datetime import datetime
from typing import Any

_EVENTOS_BASE: list[dict[str, Any]] = [
    {
        "id": "b0",
        "fecha": "12 nov 2026",
        "hora": "07:58:12",
        "usuario": "Marco Ayala",
        "rol": "Administrador",
        "tipo": "Sesión",
        "entidad": "Inicio de sesión",
        "antes": "—",
        "despues": "Correcto",
        "ip": "181.65.22.14",
    },
    {
        "id": "b1",
        "fecha": "12 nov 2026",
        "hora": "07:31:40",
        "usuario": "Julio Gamboa",
        "rol": "Docente",
        "tipo": "Calificativo",
        "entidad": "Matemática · 4.° A · Práctica de sistemas · Huamaní Ccori, María José",
        "antes": "B",
        "despues": "A",
        "ip": "190.42.118.7",
    },
    {
        "id": "b2",
        "fecha": "11 nov 2026",
        "hora": "19:05:03",
        "usuario": "Julio Gamboa",
        "rol": "Docente",
        "tipo": "Calificativo",
        "entidad": "Matemática · 3.° B · 31 notas del día publicadas (Funciones lineales)",
        "antes": "—",
        "despues": "Publicado",
        "ip": "190.42.118.7",
    },
    {
        "id": "b3",
        "fecha": "11 nov 2026",
        "hora": "16:12:55",
        "usuario": "Patricia Vílchez",
        "rol": "Secretaría Académica",
        "tipo": "Cuenta",
        "entidad": "Cuenta de Sofía Quispe Huamán (Estudiante)",
        "antes": "—",
        "despues": "Creada",
        "ip": "181.65.22.30",
    },
    {
        "id": "b4",
        "fecha": "10 nov 2026",
        "hora": "10:22:18",
        "usuario": "Sistema",
        "rol": "Seguridad",
        "tipo": "Seguridad",
        "entidad": "5 intentos fallidos de inicio · DNI 4152****",
        "antes": "Activa",
        "despues": "Bloqueada",
        "ip": "200.48.9.201",
    },
    {
        "id": "b5",
        "fecha": "6 nov 2026",
        "hora": "15:40:09",
        "usuario": "Rosa Cárdenas",
        "rol": "Docente",
        "tipo": "Nivel",
        "entidad": "Comunicación · 3.° B · C2 · Palomino Tito, Diego",
        "antes": "B",
        "despues": "A",
        "ip": "190.42.98.3",
    },
    {
        "id": "b6",
        "fecha": "11 sep 2026",
        "hora": "09:00:00",
        "usuario": "Gloria Mendoza",
        "rol": "Dirección",
        "tipo": "Libreta",
        "entidad": "Libreta del II Trimestre",
        "antes": "No publicada",
        "despues": "Publicada",
        "ip": "181.65.22.11",
    },
    {
        "id": "b7",
        "fecha": "4 sep 2026",
        "hora": "18:30:44",
        "usuario": "Marco Ayala",
        "rol": "Administrador",
        "tipo": "Estado",
        "entidad": "II Trimestre",
        "antes": "Cierre Preliminar",
        "despues": "Cerrado",
        "ip": "181.65.22.14",
    },
    {
        "id": "b8",
        "fecha": "14 sep 2026",
        "hora": "07:00:00",
        "usuario": "Marco Ayala",
        "rol": "Administrador",
        "tipo": "Estado",
        "entidad": "III Trimestre",
        "antes": "Aperturado",
        "despues": "En Evaluación",
        "ip": "181.65.22.14",
    },
]

_eventos_memoria: list[dict[str, Any]] = deepcopy(_EVENTOS_BASE)
_correlativo: int = 1


def reiniciar_eventos_auditoria() -> None:
    """Restaura los eventos iniciales de bitácora para pruebas deterministas."""
    global _eventos_memoria, _correlativo
    _eventos_memoria = deepcopy(_EVENTOS_BASE)
    _correlativo = 1


def registrar_evento_auditoria(
    *,
    tipo: str,
    entidad: str,
    antes: str,
    despues: str,
    usuario: str = "Marco Ayala",
    rol: str = "Administrador",
    ip: str = "181.65.22.14",
) -> dict[str, Any]:
    """Inserta un nuevo evento inmutable al inicio de la bitácora (orden cronológico inverso)."""
    global _correlativo
    ahora = datetime.now()
    evento = {
        "id": f"n{_correlativo}",
        "fecha": "12 nov 2026",
        "hora": ahora.strftime("%H:%M:%S"),
        "usuario": usuario,
        "rol": rol,
        "tipo": tipo,
        "entidad": entidad,
        "antes": antes,
        "despues": despues,
        "ip": ip,
    }
    _correlativo += 1
    _eventos_memoria.insert(0, evento)
    return dict(evento)


def listar_eventos_auditoria(tipo: str | None = None) -> list[dict[str, Any]]:
    """Devuelve una copia de los eventos registrados, opcionalmente filtrados por tipo."""
    if not tipo or tipo == "Todos":
        return deepcopy(_eventos_memoria)
    return [deepcopy(e) for e in _eventos_memoria if e["tipo"] == tipo]
