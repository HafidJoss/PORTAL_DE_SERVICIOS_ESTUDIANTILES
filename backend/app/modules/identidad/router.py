"""Endpoints contractuales (stub) del módulo de identidad."""

from fastapi import APIRouter

from .schemas import (
    ActivacionIn,
    ActivacionOut,
    AvisoPrivacidadOut,
    CambioContrasenaIn,
    LoginIn,
    MensajeOperacionOut,
    SesionOut,
    UsuarioSesionOut,
)

router = APIRouter(prefix="/identidad", tags=["identidad"])


def _usuario_demo(dni: str = "72458193") -> UsuarioSesionOut:
    return UsuarioSesionOut(
        id="est-demo-1",
        dni=dni,
        nombres="Luis Ángel",
        apellidos="Quispe Huamán",
        rol="Estudiante",
        estudiante_id="est-demo-1",
        codigo_estudiante="05123487210042",
        grado_seccion="3.° de Secundaria B",
        tutor="Prof. Rosa Cárdenas Palomino",
    )


@router.post("/login", response_model=SesionOut)
def iniciar_sesion(datos: LoginIn) -> SesionOut:
    """Inicia sesión con DNI y contraseña (contrato stub)."""
    return SesionOut(autenticado=True, usuario=_usuario_demo(datos.dni))


@router.post("/activar", response_model=ActivacionOut)
def activar_cuenta(datos: ActivacionIn) -> ActivacionOut:
    """Activa una cuenta con código de un solo uso (contrato stub)."""
    return ActivacionOut(
        activada=datos.acepta_privacidad,
        mensaje="Cuenta activada correctamente.",
    )


@router.post("/logout", response_model=MensajeOperacionOut)
def cerrar_sesion() -> MensajeOperacionOut:
    """Cierra la sesión activa invalidando el token vigente (contrato stub)."""
    return MensajeOperacionOut(mensaje="Sesión cerrada correctamente.")


@router.get("/sesion", response_model=SesionOut)
def obtener_sesion() -> SesionOut:
    """Devuelve la información del usuario autenticado (contrato stub)."""
    return SesionOut(autenticado=True, usuario=_usuario_demo())


@router.post("/cambiar-contrasena", response_model=MensajeOperacionOut)
def cambiar_contrasena(datos: CambioContrasenaIn) -> MensajeOperacionOut:
    """Actualiza la contraseña del usuario autenticado (contrato stub)."""
    _ = datos.nueva_contrasena
    return MensajeOperacionOut(mensaje="Contraseña actualizada correctamente.")


@router.get("/aviso-privacidad", response_model=AvisoPrivacidadOut)
def obtener_aviso_privacidad() -> AvisoPrivacidadOut:
    """Devuelve el aviso de privacidad institucional (RF29)."""
    return AvisoPrivacidadOut(
        version="2026.1",
        actualizado_el="2026-03-01",
        titulo="Aviso de Privacidad y Protección de Datos Personales",
        contenido=(
            "La I.E. Emblemática Mariscal Cáceres trata los datos personales "
            "y académicos de estudiantes y apoderados conforme a la Ley N.º 29733 "
            "y el D. S. N.º 016-2024-JUS exclusivamente para fines educativos y "
            "de seguimiento escolar."
        ),
    )
