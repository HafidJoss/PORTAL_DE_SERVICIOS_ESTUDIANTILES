"""Endpoints contractuales (stub) del módulo de evaluación."""

from fastapi import APIRouter

from .schemas import (
    ActividadOut,
    CalificacionesEstudianteOut,
    CalificativoPublicadoOut,
    CompetenciaNivelOut,
    ConclusionOut,
    CursoCalificacionesOut,
    LecturaConfirmadaOut,
    ListaActividadesOut,
    ListaMensajesOut,
    MensajeOut,
    RespuestaHiloOut,
    RespuestaMensajeIn,
)

router = APIRouter(prefix="/evaluacion", tags=["evaluacion"])


@router.get(
    "/estudiantes/{estudiante_id}/calificaciones",
    response_model=CalificacionesEstudianteOut,
)
def obtener_calificaciones_estudiante(estudiante_id: str) -> CalificacionesEstudianteOut:
    """Devuelve niveles por competencia, conclusiones y calificativos publicados."""
    _ = estudiante_id
    return CalificacionesEstudianteOut(
        trimestre_actual=3,
        estado_trimestre="En Evaluación",
        criterio_sugerencia="mediana_capacidades",
        cursos=[
            CursoCalificacionesOut(
                asignatura_id="mat",
                nombre="Matemática",
                docente="Prof. Julio Gamboa Rojas",
                competencias=[
                    CompetenciaNivelOut(
                        nombre="Resuelve problemas de cantidad",
                        trimestres=["A", "A", "AD"],
                    )
                ],
                conclusiones=[
                    ConclusionOut(
                        trimestre="I Trimestre",
                        competencia="Resuelve problemas de regularidad, equivalencia y cambio",
                        nivel="B",
                        texto="Resuelve ecuaciones sencillas; practicar problemas de contexto.",
                    )
                ],
                calificativos_publicados=[
                    CalificativoPublicadoOut(
                        id="act-1",
                        tipo="trabajo",
                        titulo="Práctica calificada: sistemas de ecuaciones",
                        fecha="12 nov",
                        competencia="Regularidad, equivalencia y cambio",
                        nivel="A",
                        comentario="Planteas bien las ecuaciones; revisa los signos al despejar.",
                    )
                ],
            )
        ],
    )


@router.get(
    "/estudiantes/{estudiante_id}/actividades",
    response_model=ListaActividadesOut,
)
def listar_actividades_estudiante(estudiante_id: str) -> ListaActividadesOut:
    """Lista trabajos y sesiones de clase (nota del día) del estudiante."""
    _ = estudiante_id
    return ListaActividadesOut(
        pendientes=1,
        vencen_pronto=1,
        actividades=[
            ActividadOut(
                id="act-t1",
                tipo="trabajo",
                titulo="Ficha: funciones lineales",
                curso="Matemática",
                asignada="11 nov",
                fecha_entrega="18 nov",
                estado="pendiente",
                urgente=True,
                competencia="Resuelve problemas de regularidad, equivalencia y cambio",
                capacidad="Traduce datos y condiciones a expresiones algebraicas",
                descripcion="Resuelve los ejercicios 1 al 12 en tu cuaderno.",
            ),
            ActividadOut(
                id="act-s1",
                tipo="sesion_clase",
                titulo="Sesión 16: método de igualación (Nota del día)",
                curso="Matemática",
                asignada="12 nov",
                fecha_entrega=None,
                estado="calificado",
                competencia="Resuelve problemas de regularidad, equivalencia y cambio",
                capacidad="Comunica su comprensión sobre las relaciones algebraicas",
                nivel="A",
                comentario="Buena participación en pizarra.",
            ),
        ],
    )


@router.get(
    "/estudiantes/{estudiante_id}/mensajes",
    response_model=ListaMensajesOut,
)
def listar_mensajes_estudiante(estudiante_id: str) -> ListaMensajesOut:
    """Devuelve la bandeja de mensajes e hilos del estudiante."""
    _ = estudiante_id
    return ListaMensajesOut(
        sin_leer=1,
        mensajes=[
            MensajeOut(
                id="msg-1",
                tipo="Tarea",
                remitente="Prof. Julio Gamboa Rojas",
                curso="Matemática",
                asunto="Nueva ficha: funciones lineales",
                fecha="Ayer",
                fecha_larga="ayer, 19:05",
                destinatarios="3.° B",
                cuerpo="Resuelvan los ejercicios 1 al 12 de la ficha entregada en clase.",
                actividad_id="act-t1",
                no_leido=True,
                lectura_confirmada=False,
                respuestas=[],
            )
        ],
    )


@router.post("/mensajes/{mensaje_id}/leer", response_model=LecturaConfirmadaOut)
def confirmar_lectura_mensaje(mensaje_id: str) -> LecturaConfirmadaOut:
    """Registra la confirmación de lectura de un mensaje."""
    return LecturaConfirmadaOut(mensaje_id=mensaje_id, lectura_confirmada=True)


@router.post("/mensajes/{mensaje_id}/respuestas", response_model=RespuestaHiloOut)
def responder_mensaje(
    mensaje_id: str, datos: RespuestaMensajeIn
) -> RespuestaHiloOut:
    """Publica una respuesta acotada dentro del hilo de un mensaje (RF25)."""
    return RespuestaHiloOut(
        id="resp-1",
        mensaje_id=mensaje_id,
        autor="Luis Ángel Quispe Huamán",
        rol_autor="Estudiante",
        contenido=datos.contenido,
        fecha="Ahora",
    )
