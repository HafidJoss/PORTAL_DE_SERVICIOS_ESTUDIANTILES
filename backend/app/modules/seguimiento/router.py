"""Endpoints contractuales (stub) del módulo de seguimiento."""

from fastapi import APIRouter

from app.core.errors import AppError

from .schemas import (
    CompetenciaCursoResumenOut,
    CursoDetalleOut,
    CursoResumenOut,
    DiaAgendaOut,
    DistribucionNivelItemOut,
    EntregaProximaOut,
    EventoAgendaOut,
    InicioEstudianteOut,
    IntegranteEquipoOut,
    KpiInicioOut,
    ListaCursosOut,
    NovedadesVistoOut,
    NovedadItemOut,
    StreamCursoOut,
)

router = APIRouter(prefix="/seguimiento", tags=["seguimiento"])


@router.get("/estudiantes/{estudiante_id}/inicio", response_model=InicioEstudianteOut)
def obtener_inicio_estudiante(estudiante_id: str) -> InicioEstudianteOut:
    """Compone novedades, KPIs y agenda semanal del estudiante (contrato stub)."""
    return InicioEstudianteOut(
        estudiante_id=estudiante_id,
        ultima_visita="2026-11-11T18:40:00-05:00",
        novedades_sin_ver=2,
        novedades=[
            NovedadItemOut(
                id="nov-1",
                grupo="Hoy",
                tipo="calificativo",
                etiqueta="Calificativo",
                curso="Matemática",
                titulo="Práctica calificada: sistemas de ecuaciones",
                detalle="Resuelve problemas de regularidad, equivalencia y cambio",
                nivel="A",
                hora="11:20",
                ruta_destino="/calificaciones",
            ),
            NovedadItemOut(
                id="nov-2",
                grupo="Ayer",
                tipo="mensaje",
                etiqueta="Nueva tarea",
                curso="Matemática",
                titulo="Ficha: funciones lineales",
                detalle="Entrega: miércoles 18 de noviembre",
                hora="19:05",
                ruta_destino="/mensajes",
            ),
        ],
        kpis=[
            KpiInicioOut(
                clave="novedades",
                etiqueta="Novedades",
                valor="2",
                subtitulo="Desde ayer, 18:40",
            ),
            KpiInicioOut(
                clave="pendientes",
                etiqueta="Pendientes",
                valor="1",
                subtitulo="1 próximo a vencer",
            ),
            KpiInicioOut(
                clave="asistencia",
                etiqueta="Asistencia",
                valor="96%",
                subtitulo="Noviembre · 1 tardanza",
            ),
            KpiInicioOut(
                clave="libreta",
                etiqueta="Libreta",
                valor="II Trim.",
                subtitulo="Publicada",
            ),
        ],
        distribucion_niveles=[
            DistribucionNivelItemOut(nivel="AD", nombre="Logro destacado", cantidad=4, porcentaje=20.0),
            DistribucionNivelItemOut(nivel="A", nombre="Logro esperado", cantidad=12, porcentaje=60.0),
            DistribucionNivelItemOut(nivel="B", nombre="En proceso", cantidad=3, porcentaje=15.0),
            DistribucionNivelItemOut(nivel="C", nombre="En inicio", cantidad=1, porcentaje=5.0),
        ],
        agenda_semanal=[
            DiaAgendaOut(
                etiqueta="Hoy",
                numero=12,
                es_hoy=True,
                asistencia="Presente",
                eventos=[
                    EventoAgendaOut(
                        titulo="A en Práctica calificada",
                        tipo="calificativo",
                        ruta_destino="/calificaciones",
                    )
                ],
            )
        ],
        proximas_entregas=[
            EntregaProximaOut(
                id="act-1",
                titulo="Ficha: funciones lineales",
                curso="Matemática",
                fecha_entrega="2026-11-18",
                estado_etiqueta="En 6 días",
                urgente=False,
            )
        ],
    )


@router.post("/estudiantes/{estudiante_id}/novedades/visto", response_model=NovedadesVistoOut)
def marcar_novedades_vistas(estudiante_id: str) -> NovedadesVistoOut:
    """Actualiza la marca de última visita del estudiante (contrato stub)."""
    _ = estudiante_id
    return NovedadesVistoOut(visto=True, ultima_visita="2026-11-15T20:00:00-05:00")


@router.get("/estudiantes/{estudiante_id}/cursos", response_model=ListaCursosOut)
def listar_cursos_estudiante(estudiante_id: str) -> ListaCursosOut:
    """Devuelve la lista de cursos del estudiante (contrato stub)."""
    _ = estudiante_id
    return ListaCursosOut(
        grado_seccion="3.° de Secundaria B",
        total_pendientes=1,
        cursos=[
            CursoResumenOut(
                asignatura_id="mat",
                nombre="Matemática",
                docente="Prof. Julio Gamboa Rojas",
                rol_docente="Docente titular",
                horario="Lun · Mié · Vie",
                horas_semanales=6,
                pendientes=1,
                proximo_vencimiento="Ficha: funciones lineales · 18 nov",
                mini_niveles=["AD", "A", "B", "A"],
            )
        ],
    )


@router.get(
    "/estudiantes/{estudiante_id}/cursos/{asignatura_id}",
    response_model=CursoDetalleOut,
)
def obtener_detalle_curso(estudiante_id: str, asignatura_id: str) -> CursoDetalleOut:
    """Devuelve el detalle del curso con novedades, competencias y plana docente."""
    _ = estudiante_id
    if asignatura_id != "mat":
        raise AppError(
            title="Curso no encontrado",
            detail=f"No existe el curso '{asignatura_id}' para el estudiante.",
            status_code=404,
        )
    return CursoDetalleOut(
        asignatura_id="mat",
        nombre="Matemática",
        docente="Prof. Julio Gamboa Rojas",
        rol_docente="Docente titular",
        horario="Lun · Mié · Vie",
        horas_semanales=6,
        stream=[
            StreamCursoOut(
                titulo="Práctica calificada: sistemas de ecuaciones",
                subtitulo="Se publicó tu calificativo",
                fecha="12 nov",
                tipo="calificativo",
                nivel="A",
                cuerpo="Planteas bien las ecuaciones; revisa los signos al despejar.",
            )
        ],
        competencias=[
            CompetenciaCursoResumenOut(
                nombre="Resuelve problemas de cantidad",
                trimestres=["A", "A", "AD"],
            )
        ],
        equipo=[
            IntegranteEquipoOut(
                nombre="Prof. Julio Gamboa Rojas",
                rol="Docente titular",
                grupo="docente",
            ),
            IntegranteEquipoOut(
                nombre="Prof. Rosa Cárdenas Palomino",
                rol="Tutora de 3.° B",
                grupo="equipo_seccion",
            ),
        ],
    )
