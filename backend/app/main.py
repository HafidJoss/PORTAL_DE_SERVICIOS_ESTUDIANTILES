"""Punto de entrada de la API del Portal de Servicios Estudiantiles."""

from fastapi import APIRouter, FastAPI
from pydantic import BaseModel

from app.core.errores import ProblemDetail, registrar_manejadores_error
from app.modules.asistencia.router import router as asistencia_router
from app.modules.evaluacion.router import router as evaluacion_router
from app.modules.identidad.router import router as identidad_router
from app.modules.reportes.router import router as reportes_router
from app.modules.seguimiento.router import router as seguimiento_router


class SaludOut(BaseModel):
    """Respuesta del endpoint de verificación de salud."""

    status: str


def crear_app() -> FastAPI:
    """Construye y configura la instancia principal de FastAPI."""
    app = FastAPI(
        title="Portal de Servicios Estudiantiles API",
        version="0.1.0",
        description="API REST del Portal de Servicios Estudiantiles (I.E. Mariscal Cáceres)",
        responses={
            401: {"model": ProblemDetail, "description": "No autenticado"},
            403: {"model": ProblemDetail, "description": "Acceso denegado"},
            404: {"model": ProblemDetail, "description": "Recurso no encontrado"},
            422: {"model": ProblemDetail, "description": "Error de validación"},
        },
    )
    registrar_manejadores_error(app)

    api_v1 = APIRouter(prefix="/api/v1")

    @api_v1.get("/health", response_model=SaludOut, tags=["core"])
    def verificar_salud() -> SaludOut:
        """Verifica que la API está operativa."""
        return SaludOut(status="ok")

    api_v1.include_router(identidad_router)
    api_v1.include_router(seguimiento_router)
    api_v1.include_router(evaluacion_router)
    api_v1.include_router(asistencia_router)
    api_v1.include_router(reportes_router)
    app.include_router(api_v1)
    return app


app = crear_app()
