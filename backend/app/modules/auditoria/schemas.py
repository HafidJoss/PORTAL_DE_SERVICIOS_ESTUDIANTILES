"""Esquemas Pydantic de salida para el módulo de auditoría (RF18, RF29, ADR-005)."""

from pydantic import BaseModel


class EventoAuditoriaOut(BaseModel):
    """Registro inmutable de un evento crítico del portal."""

    id: str
    fecha: str
    hora: str
    usuario: str
    rol: str
    tipo: str
    entidad: str
    antes: str
    despues: str
    ip: str


class ListaEventosAuditoriaOut(BaseModel):
    """Respuesta del listado cronológico inverso de la bitácora."""

    tipo_filtro: str
    total: int
    eventos: list[EventoAuditoriaOut]
