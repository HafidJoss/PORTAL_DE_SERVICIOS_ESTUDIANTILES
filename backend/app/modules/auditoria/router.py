"""Endpoints contractuales (stub) del módulo de auditoría (RF18, RF29, ADR-005)."""

from fastapi import APIRouter, Depends, Header, Query
from fastapi.responses import Response

from app.core.errores import ErrorAplicacion

from .registro_stub import listar_eventos_auditoria
from .schemas import EventoAuditoriaOut, ListaEventosAuditoriaOut

router = APIRouter(prefix="/auditoria", tags=["auditoria"])


def _exigir_rol_administrador(
    x_rol_usuario: str | None = Header(default="Administrador", alias="X-Rol-Usuario"),
) -> str:
    rol = (x_rol_usuario or "Administrador").strip()
    if rol != "Administrador":
        raise ErrorAplicacion(
            title="Acceso denegado",
            detail="Solo el rol Administrador puede consultar o exportar la bitácora de auditoría.",
            status_code=403,
            error_type="https://portal.mariscal.edu.pe/problemas/acceso-denegado",
        )
    return rol


def _escapar_csv(valor: str) -> str:
    return '"' + str(valor).replace('"', '""') + '"'


@router.get("/eventos", response_model=ListaEventosAuditoriaOut)
def listar_eventos_bitacora(
    tipo: str = Query(default="Todos"),
    _: str = Depends(_exigir_rol_administrador),
) -> ListaEventosAuditoriaOut:
    """Devuelve los eventos críticos registrados en la bitácora en orden cronológico inverso."""
    eventos = listar_eventos_auditoria(tipo=tipo)
    return ListaEventosAuditoriaOut(
        tipo_filtro=tipo,
        total=len(eventos),
        eventos=[EventoAuditoriaOut(**e) for e in eventos],
    )


@router.get("/eventos/exportar", response_class=Response)
def exportar_eventos_bitacora_csv(
    tipo: str = Query(default="Todos"),
    _: str = Depends(_exigir_rol_administrador),
) -> Response:
    """Exporta los eventos filtrados de la bitácora en formato CSV UTF-8 con BOM."""
    eventos = listar_eventos_auditoria(tipo=tipo)
    encabezado = ["Fecha", "Hora", "Usuario", "Rol", "Evento", "Entidad", "Antes", "Después", "IP"]
    filas = [encabezado] + [
        [
            e["fecha"],
            e["hora"],
            e["usuario"],
            e["rol"],
            e["tipo"],
            e["entidad"],
            e["antes"],
            e["despues"],
            e["ip"],
        ]
        for e in eventos
    ]
    cuerpo = "\ufeff" + "\r\n".join(";".join(_escapar_csv(c) for c in fila) for fila in filas)
    return Response(
        content=cuerpo.encode("utf-8"),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": 'attachment; filename="Bitacora_2026.csv"'},
    )
