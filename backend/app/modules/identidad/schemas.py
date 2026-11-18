"""Esquemas Pydantic de entrada y salida para el módulo de identidad."""

from typing import Literal

from pydantic import BaseModel, Field

RolUsuario = Literal[
    "Administrador",
    "Dirección",
    "Secretaría Académica",
    "Docente",
    "Auxiliar",
    "Apoderado",
    "Estudiante",
]


class LoginIn(BaseModel):
    """Credenciales para iniciar sesión por documento de identidad."""

    dni: str = Field(..., pattern=r"^\d{8}$", description="Documento de identidad de 8 dígitos")
    contrasena: str = Field(..., min_length=1, description="Contraseña del usuario")
    recordar: bool = Field(default=False, description="Mantener preferencia de recordar DNI")


class ActivacionIn(BaseModel):
    """Datos para activar una cuenta con código de un solo uso."""

    dni: str = Field(..., pattern=r"^\d{8}$")
    codigo_activacion: str = Field(..., min_length=6, max_length=12)
    nueva_contrasena: str = Field(..., min_length=8)
    acepta_privacidad: bool = Field(...)


class CambioContrasenaIn(BaseModel):
    """Solicitud de actualización de contraseña propia."""

    contrasena_actual: str = Field(..., min_length=1)
    nueva_contrasena: str = Field(..., min_length=8)


class HijoVinculadoOut(BaseModel):
    """Estudiante vinculado al perfil de un apoderado (relación N:M, RF01)."""

    estudiante_id: str
    codigo: str
    nombres: str
    apellidos: str
    grado_seccion: str
    iniciales: str
    tutor: str


class UsuarioSesionOut(BaseModel):
    """Resumen público del usuario autenticado."""

    id: str
    dni: str
    nombres: str
    apellidos: str
    rol: RolUsuario
    estudiante_id: str | None = None
    codigo_estudiante: str | None = None
    grado_seccion: str | None = None
    tutor: str | None = None
    docente_id: str | None = None
    especialidad: str | None = None
    nivel_educativo: str | None = None
    secciones_a_cargo: list[str] | None = None
    apoderado_id: str | None = None
    hijos_vinculados: list[HijoVinculadoOut] = []


class SesionOut(BaseModel):
    """Respuesta de inicio o consulta de sesión."""

    autenticado: bool
    usuario: UsuarioSesionOut


class ActivacionOut(BaseModel):
    """Confirmación de activación de cuenta."""

    activada: bool
    mensaje: str


class MensajeOperacionOut(BaseModel):
    """Respuesta simple para operaciones de cierre de sesión o cambio de clave."""

    mensaje: str


class AvisoPrivacidadOut(BaseModel):
    """Texto vigente del aviso de privacidad (Ley N.º 29733)."""

    version: str
    actualizado_el: str
    titulo: str
    contenido: str
