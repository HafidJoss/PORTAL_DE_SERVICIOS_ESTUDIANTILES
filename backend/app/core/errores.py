"""Esquemas y manejadores globales de errores según RFC 9457 (Problem Details)."""

from http import HTTPStatus

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from starlette.exceptions import HTTPException as StarletteHTTPException


class ProblemDetail(BaseModel):
    """Representación estándar de error HTTP según RFC 9457."""

    type: str = Field(default="about:blank", description="URI que identifica el tipo de problema")
    title: str = Field(..., description="Resumen legible del problema")
    status: int = Field(..., description="Código de estado HTTP")
    detail: str = Field(..., description="Explicación específica de esta ocurrencia")
    instance: str | None = Field(default=None, description="Ruta o identificador de la petición")


class ErrorAplicacion(Exception):
    """Excepción base de dominio traducida automáticamente a Problem Details."""

    def __init__(
        self,
        title: str,
        detail: str,
        status_code: int = 400,
        error_type: str = "about:blank",
    ) -> None:
        super().__init__(detail)
        self.title = title
        self.detail = detail
        self.status_code = status_code
        self.error_type = error_type


def _problem_response(
    status_code: int,
    title: str,
    detail: str,
    request: Request,
    error_type: str = "about:blank",
) -> JSONResponse:
    cuerpo = ProblemDetail(
        type=error_type,
        title=title,
        status=status_code,
        detail=detail,
        instance=str(request.url.path),
    )
    return JSONResponse(
        status_code=status_code,
        content=cuerpo.model_dump(exclude_none=True),
        media_type="application/problem+json",
    )


def registrar_manejadores_error(app: FastAPI) -> None:
    """Registra en FastAPI los manejadores globales de RFC 9457."""

    @app.exception_handler(ErrorAplicacion)
    async def manejar_error_aplicacion(request: Request, exc: ErrorAplicacion) -> JSONResponse:
        return _problem_response(
            status_code=exc.status_code,
            title=exc.title,
            detail=exc.detail,
            request=request,
            error_type=exc.error_type,
        )

    @app.exception_handler(StarletteHTTPException)
    async def manejar_http_exception(
        request: Request, exc: StarletteHTTPException
    ) -> JSONResponse:
        try:
            title = HTTPStatus(exc.status_code).phrase
        except ValueError:
            title = "Error HTTP"
        detail = str(exc.detail) if exc.detail else title
        return _problem_response(
            status_code=exc.status_code,
            title=title,
            detail=detail,
            request=request,
        )

    @app.exception_handler(RequestValidationError)
    async def manejar_validacion(
        request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        errores = exc.errors()
        detalle = "; ".join(
            f"{'.'.join(str(loc) for loc in err['loc'])}: {err['msg']}"
            for err in errores
        ) or "Los datos enviados no cumplen el formato esperado."
        return _problem_response(
            status_code=422,
            title="Datos de entrada inválidos",
            detail=detalle,
            request=request,
            error_type="https://portal.mariscal.edu.pe/problemas/validacion",
        )
