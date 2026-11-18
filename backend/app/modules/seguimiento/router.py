"""Endpoints contractuales (stub) del módulo de seguimiento."""

from fastapi import APIRouter

from app.core.errores import ErrorAplicacion
from app.core.pertenencia import validar_pertenencia_apoderado

from .schemas import (
    AlertaDocenteOut,
    AnuncioSeccionCreateIn,
    ClaseHoyDocenteOut,
    CompetenciaCursoResumenOut,
    CursoDetalleOut,
    CursoResumenOut,
    DetalleSeccionDocenteOut,
    DiaAgendaOut,
    DistribucionNivelItemOut,
    ElementoStreamSeccionOut,
    EntregaProximaOut,
    EtapaTrimestreOut,
    EventoAgendaOut,
    InicioApoderadoOut,
    InicioDocenteOut,
    InicioEstudianteOut,
    IntegranteEquipoOut,
    KpiInicioOut,
    ListaCursosOut,
    ListaSeccionesDocenteOut,
    MensajeBandejaApoderadoOut,
    MensajeBandejaDocenteOut,
    NotaPendienteDocenteOut,
    NovedadItemOut,
    NovedadesVistoOut,
    OperacionBandejaOut,
    PendienteSeccionOut,
    RespuestaBandejaIn,
    RespuestaBandejaOut,
    ResumenAsistenciaApoderadoOut,
    SeccionDocenteOut,
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
def listar_cursos_estudiante(
    estudiante_id: str,
    apoderado_id: str | None = None,
) -> ListaCursosOut:
    """Devuelve la lista de cursos del estudiante contextualizada por menor (RF04, DA05)."""
    validar_pertenencia_apoderado(apoderado_id, estudiante_id)
    if estudiante_id == "est-demo-2":
        return ListaCursosOut(
            grado_seccion="1.° de Secundaria A",
            total_pendientes=1,
            cursos=[
                CursoResumenOut(
                    asignatura_id="cta",
                    nombre="Ciencia y Tecnología",
                    docente="Prof. Ana Lucía Torres",
                    rol_docente="Docente titular",
                    horario="Mar · Jue",
                    horas_semanales=5,
                    pendientes=1,
                    proximo_vencimiento="Maqueta del sistema solar · 17 nov",
                    mini_niveles=["AD", "AD", "A"],
                ),
                CursoResumenOut(
                    asignatura_id="mat",
                    nombre="Matemática",
                    docente="Prof. Luis Herrera Paredes",
                    rol_docente="Docente titular",
                    horario="Lun · Mié · Vie",
                    horas_semanales=6,
                    pendientes=0,
                    proximo_vencimiento="Sin pendientes próximos",
                    mini_niveles=["A", "AD", "A", "A"],
                ),
            ],
        )
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
def obtener_detalle_curso(
    estudiante_id: str,
    asignatura_id: str,
    apoderado_id: str | None = None,
) -> CursoDetalleOut:
    """Devuelve el detalle del curso con novedades, competencias y plana docente (RF04, DA05)."""
    validar_pertenencia_apoderado(apoderado_id, estudiante_id)
    if estudiante_id == "est-demo-2" and asignatura_id == "cta":
        return CursoDetalleOut(
            asignatura_id="cta",
            nombre="Ciencia y Tecnología",
            docente="Prof. Ana Lucía Torres",
            rol_docente="Docente titular",
            horario="Mar · Jue",
            horas_semanales=5,
            stream=[
                StreamCursoOut(
                    titulo="Práctica de laboratorio: sistema solar",
                    subtitulo="Se publicó tu calificativo",
                    fecha="12 nov",
                    tipo="calificativo",
                    nivel="AD",
                    cuerpo="Sofía demostró dominio del método científico y trabajo en equipo.",
                )
            ],
            competencias=[
                CompetenciaCursoResumenOut(
                    nombre="Indaga mediante métodos científicos",
                    trimestres=["AD", "A", "AD"],
                )
            ],
            equipo=[
                IntegranteEquipoOut(
                    nombre="Prof. Ana Lucía Torres",
                    rol="Docente titular",
                    grupo="docente",
                ),
                IntegranteEquipoOut(
                    nombre="Prof. Elena Soto Vega",
                    rol="Tutora de 1.° A",
                    grupo="equipo_seccion",
                ),
            ],
        )
    if asignatura_id != "mat":
        raise ErrorAplicacion(
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


def _mensajes_bandeja_docente_demo() -> list[MensajeBandejaDocenteOut]:
    return [
        MensajeBandejaDocenteOut(
            id="m1",
            origen="institucion",
            remitente="Dirección",
            asunto="Cierre preliminar del III Trimestre: 4 de diciembre",
            cuerpo=(
                "Estimados docentes:\nLes recordamos que el cierre preliminar del III Trimestre "
                "es el jueves 4 de diciembre. Desde esa fecha solo se podrán ajustar niveles "
                "y conclusiones descriptivas."
            ),
            fecha="Hoy, 7:10",
            leido=False,
            puede_responder=False,
        ),
        MensajeBandejaDocenteOut(
            id="m2",
            origen="estudiante",
            remitente="Diego Cárdenas Rojas",
            nombre_corto="Diego",
            seccion_id="3B",
            seccion_nombre="3.° B",
            asunto="Consulta sobre la ficha de funciones lineales",
            cuerpo=(
                "Profesor, buenos días. En el ejercicio 7 de la ficha no entiendo cómo hallar "
                "la pendiente si solo me dan dos puntos. ¿Lo podemos revisar hoy?"
            ),
            fecha="Hoy, 6:52",
            leido=False,
            puede_responder=True,
            destino_tab="nov",
        ),
        MensajeBandejaDocenteOut(
            id="m3",
            origen="institucion",
            remitente="Coordinación académica",
            asunto="Reunión de área de Matemática — viernes 14, 3:00 p.m.",
            cuerpo="Se convoca a los docentes del área a la reunión de planificación de la Unidad 8.",
            fecha="Ayer, 16:30",
            leido=False,
            puede_responder=False,
        ),
        MensajeBandejaDocenteOut(
            id="m4",
            origen="estudiante",
            remitente="María José Huamaní Ccori",
            nombre_corto="María José",
            seccion_id="4A",
            seccion_nombre="4.° A",
            asunto="No pude asistir a la práctica del martes",
            cuerpo=(
                "Buenas noches, profesor. El martes estuve con descanso médico. "
                "¿Podría rendir la práctica otro día?"
            ),
            fecha="Ayer, 20:14",
            leido=False,
            puede_responder=True,
            destino_tab="clases",
        ),
        MensajeBandejaDocenteOut(
            id="m5",
            origen="asistencia",
            remitente="Auxiliar de educación",
            seccion_id="4C",
            seccion_nombre="4.° C",
            asunto="Resumen de asistencia · 4.° C",
            cuerpo="Faltas del 11 de noviembre en 4.° C: 3 registros (1 justificada). Tardanzas: 2.",
            fecha="Ayer, 13:05",
            leido=True,
            puede_responder=False,
            destino_tab="est",
        ),
    ]


@router.get(
    "/docentes/{docente_id}/inicio",
    response_model=InicioDocenteOut,
)
def obtener_inicio_docente(docente_id: str) -> InicioDocenteOut:
    """Devuelve bandeja, clases del día, pendientes, alertas y etapas del docente."""
    mensajes = _mensajes_bandeja_docente_demo()
    pendientes = [
        NotaPendienteDocenteOut(
            seccion_id="3B",
            seccion_nombre="3.° B",
            sesion_id="3Bs16",
            titulo="Clase: Pendiente y razón de cambio",
            registrados=0,
            total=30,
            porcentaje=0,
        ),
        NotaPendienteDocenteOut(
            seccion_id="4A",
            seccion_nombre="4.° A",
            sesion_id="4As16",
            titulo="Clase: Pendiente y razón de cambio",
            registrados=0,
            total=31,
            porcentaje=0,
        ),
        NotaPendienteDocenteOut(
            seccion_id="4C",
            seccion_nombre="4.° C",
            sesion_id="4Cs16",
            titulo="Clase: Pendiente y razón de cambio",
            registrados=0,
            total=29,
            porcentaje=0,
        ),
    ]
    return InicioDocenteOut(
        docente_id=docente_id,
        trimestre_actual="III Trimestre en evaluación",
        fecha_etiqueta="Jueves 12 de noviembre · III Trimestre en evaluación",
        sin_leer=sum(1 for m in mensajes if not m.leido),
        por_calificar_total=len(pendientes),
        mensajes_bandeja=mensajes,
        clases_hoy=[
            ClaseHoyDocenteOut(
                seccion_id="3A",
                seccion_nombre="3.° A",
                aula="Aula 12",
                estudiantes_total=32,
                hora_inicio="07:45",
                hora_fin="09:15",
                estado="Terminada",
            ),
            ClaseHoyDocenteOut(
                seccion_id="4A",
                seccion_nombre="4.° A",
                aula="Aula 21",
                estudiantes_total=31,
                hora_inicio="09:30",
                hora_fin="11:00",
                estado="En curso",
                sesion_id="4As16",
            ),
            ClaseHoyDocenteOut(
                seccion_id="4C",
                seccion_nombre="4.° C",
                aula="Aula 23",
                estudiantes_total=29,
                hora_inicio="11:15",
                hora_fin="12:45",
                estado="Siguiente",
            ),
        ],
        notas_pendientes=pendientes,
        alertas=[
            AlertaDocenteOut(
                id="al-1",
                texto="4 estudiantes de 3.° B tienen nivel C en alguna competencia: requieren conclusión descriptiva.",
                severidad="danger",
                seccion_id="3B",
                destino_tab="cierre",
            ),
            AlertaDocenteOut(
                id="al-2",
                texto="3 clases tienen notas del día pendientes de registrar.",
                severidad="warning",
                seccion_id="4A",
                destino_tab="clases",
            ),
            AlertaDocenteOut(
                id="al-3",
                texto="«Proyecto: presupuesto familiar» sigue en borrador (3.° A).",
                severidad="neutral",
                seccion_id="3A",
                destino_tab="act",
            ),
        ],
        etapas_trimestre=[
            EtapaTrimestreOut(nombre="Aperturado", fecha="14 de septiembre", estado="completada"),
            EtapaTrimestreOut(
                nombre="En evaluación",
                fecha="Desde el 21 de septiembre · actual",
                estado="actual",
            ),
            EtapaTrimestreOut(
                nombre="Cierre preliminar",
                fecha="4 de diciembre · solo ajustes de nivel y conclusiones",
                estado="pendiente",
            ),
            EtapaTrimestreOut(nombre="Cerrado", fecha="18 de diciembre", estado="pendiente"),
        ],
    )


@router.post(
    "/docentes/{docente_id}/bandeja/leer-todo",
    response_model=OperacionBandejaOut,
)
def marcar_bandeja_docente_leida(docente_id: str) -> OperacionBandejaOut:
    """Marca todos los mensajes de la bandeja docente como leídos."""
    _ = docente_id
    return OperacionBandejaOut(ok=True, mensaje="Bandeja marcada como leída.")


@router.post(
    "/docentes/{docente_id}/bandeja/{mensaje_id}/leer",
    response_model=OperacionBandejaOut,
)
def marcar_mensaje_bandeja_leido(docente_id: str, mensaje_id: str) -> OperacionBandejaOut:
    """Marca un mensaje específico de la bandeja docente como leído."""
    _ = docente_id
    mensajes = {m.id: m for m in _mensajes_bandeja_docente_demo()}
    if mensaje_id not in mensajes:
        raise ErrorAplicacion(
            title="Mensaje no encontrado",
            detail=f"No existe el mensaje '{mensaje_id}' en la bandeja.",
            status_code=404,
        )
    return OperacionBandejaOut(ok=True, mensaje="Mensaje marcado como leído.")


@router.post(
    "/docentes/{docente_id}/bandeja/{mensaje_id}/responder",
    response_model=RespuestaBandejaOut,
)
def responder_mensaje_bandeja(
    docente_id: str, mensaje_id: str, datos: RespuestaBandejaIn
) -> RespuestaBandejaOut:
    """Registra una respuesta acotada en hilo solo sobre consultas de estudiantes."""
    _ = docente_id
    mensajes = {m.id: m for m in _mensajes_bandeja_docente_demo()}
    objetivo = mensajes.get(mensaje_id)
    if objetivo is None:
        raise ErrorAplicacion(
            title="Mensaje no encontrado",
            detail=f"No existe el mensaje '{mensaje_id}' en la bandeja.",
            status_code=404,
        )
    if not objetivo.puede_responder:
        raise ErrorAplicacion(
            title="Hilo de solo lectura",
            detail="Los comunicados institucionales o resúmenes de asistencia no admiten respuestas.",
            status_code=400,
        )
    return RespuestaBandejaOut(
        mensaje_id=mensaje_id,
        texto=datos.texto.strip(),
        fecha="Hoy, ahora",
    )


def _secciones_docente_demo() -> list[SeccionDocenteOut]:
    return [
        SeccionDocenteOut(
            seccion_id="3A",
            nombre="3.° A",
            horario="Lun · Mar · Jue",
            aula="Aula 12",
            tutor="Prof. Edwin Pariona",
            estudiantes_total=32,
            competencias_confirmadas=4,
            competencias_total=4,
            notas_pendientes=[],
        ),
        SeccionDocenteOut(
            seccion_id="3B",
            nombre="3.° B",
            horario="Lun · Mié · Vie",
            aula="Aula 14",
            tutor="Prof. Rosa Cárdenas",
            estudiantes_total=30,
            competencias_confirmadas=0,
            competencias_total=4,
            notas_pendientes=[
                PendienteSeccionOut(
                    sesion_id="3Bs16",
                    titulo="Clase: Pendiente y razón de cambio",
                    registrados=0,
                    total=30,
                    porcentaje=0,
                )
            ],
        ),
        SeccionDocenteOut(
            seccion_id="4A",
            nombre="4.° A",
            horario="Mar · Jue · Vie",
            aula="Aula 21",
            tutor="Prof. Karen Lozano",
            estudiantes_total=31,
            competencias_confirmadas=1,
            competencias_total=4,
            notas_pendientes=[
                PendienteSeccionOut(
                    sesion_id="4As16",
                    titulo="Clase: Pendiente y razón de cambio",
                    registrados=0,
                    total=31,
                    porcentaje=0,
                )
            ],
        ),
        SeccionDocenteOut(
            seccion_id="4C",
            nombre="4.° C",
            horario="Lun · Mié · Jue",
            aula="Aula 23",
            tutor="Prof. Raúl Ccahuana",
            estudiantes_total=29,
            competencias_confirmadas=0,
            competencias_total=4,
            notas_pendientes=[
                PendienteSeccionOut(
                    sesion_id="4Cs16",
                    titulo="Clase: Pendiente y razón de cambio",
                    registrados=0,
                    total=29,
                    porcentaje=0,
                )
            ],
        ),
    ]


@router.get(
    "/docentes/{docente_id}/cursos",
    response_model=ListaSeccionesDocenteOut,
)
def listar_secciones_docente(docente_id: str) -> ListaSeccionesDocenteOut:
    """Devuelve las secciones asignadas al docente para la grilla Mis cursos."""
    _ = docente_id
    secciones = _secciones_docente_demo()
    return ListaSeccionesDocenteOut(
        asignatura_nombre="Matemática",
        nivel_educativo="Secundaria",
        anio_escolar=2026,
        total_estudiantes=sum(s.estudiantes_total for s in secciones),
        secciones=secciones,
    )


@router.get(
    "/docentes/{docente_id}/secciones/{seccion_id}",
    response_model=DetalleSeccionDocenteOut,
)
def obtener_detalle_seccion_docente(
    docente_id: str, seccion_id: str
) -> DetalleSeccionDocenteOut:
    """Devuelve cabecera, distribución de niveles y flujo Novedades de la sección."""
    _ = docente_id
    mapa = {sec.seccion_id: sec for sec in _secciones_docente_demo()}
    sec = mapa.get(seccion_id)
    if sec is None:
        raise ErrorAplicacion(
            title="Sección no encontrada",
            detail=f"No existe la sección '{seccion_id}' para el docente.",
            status_code=404,
        )
    return DetalleSeccionDocenteOut(
        seccion_id=sec.seccion_id,
        nombre=sec.nombre,
        asignatura="Matemática",
        nivel_educativo="Secundaria",
        horario=sec.horario,
        aula=sec.aula,
        tutor=sec.tutor,
        estudiantes_total=sec.estudiantes_total,
        clases_registradas=17 if sec.seccion_id == "3A" else 16,
        competencias_confirmadas=sec.competencias_confirmadas,
        competencias_total=sec.competencias_total,
        distribucion_niveles=[
            DistribucionNivelItemOut(nivel="AD", nombre="Logro destacado", cantidad=6, porcentaje=20.0),
            DistribucionNivelItemOut(nivel="A", nombre="Logro esperado", cantidad=15, porcentaje=50.0),
            DistribucionNivelItemOut(nivel="B", nombre="En proceso", cantidad=6, porcentaje=20.0),
            DistribucionNivelItemOut(nivel="C", nombre="En inicio", cantidad=3, porcentaje=10.0),
        ],
        pendientes=sec.notas_pendientes,
        stream=[
            ElementoStreamSeccionOut(
                id=f"st-{sec.seccion_id}-1",
                tipo="Actividad",
                titulo="Ficha: funciones lineales",
                subtitulo="Regularidad, equivalencia y cambio · Entrega 18 nov",
                fecha="11 nov",
                cuerpo="Ejercicios 1 al 12 de la ficha entregada en clase.",
            ),
            ElementoStreamSeccionOut(
                id=f"st-{sec.seccion_id}-2",
                tipo="Clase",
                titulo="Funciones lineales · Tabla y gráfica de una función",
                subtitulo="Sesión registrada · Todos los criterios completos",
                fecha="11 nov",
                cuerpo="Se evaluaron los 4 criterios de participación y representación gráfica.",
            ),
            ElementoStreamSeccionOut(
                id=f"st-{sec.seccion_id}-3",
                tipo="Aviso",
                titulo="Material para próxima sesión",
                subtitulo="Comunicado unidireccional a la sección",
                fecha="10 nov",
                cuerpo="Traer regla y hoja cuadriculada para trabajar pendientes en plano cartesiano.",
            ),
        ],
    )


@router.post(
    "/docentes/{docente_id}/secciones/{seccion_id}/anuncios",
    response_model=ElementoStreamSeccionOut,
    status_code=201,
)
def publicar_anuncio_seccion(
    docente_id: str, seccion_id: str, datos: AnuncioSeccionCreateIn
) -> ElementoStreamSeccionOut:
    """Publica un anuncio unidireccional en Novedades de la sección (RF25, RC08)."""
    _ = docente_id
    mapa = {sec.seccion_id: sec for sec in _secciones_docente_demo()}
    if seccion_id not in mapa:
        raise ErrorAplicacion(
            title="Sección no encontrada",
            detail=f"No existe la sección '{seccion_id}' para el docente.",
            status_code=404,
        )
    return ElementoStreamSeccionOut(
        id=f"anuncio-{seccion_id.lower()}-1",
        tipo=datos.tipo,
        titulo=f"{datos.tipo} del docente",
        subtitulo="Comunicación unidireccional en la sección",
        fecha="Ahora",
        cuerpo=datos.texto,
    )



_APODERADO_HIJOS_DEMO: dict[str, dict[str, object]] = {
    "est-demo-1": {
        "nombre": "Luis Ángel Quispe Huamán",
        "grado_seccion": "3.° de Secundaria B",
        "pendientes_total": 2,
        "asistencia_porcentaje": "96%",
        "resumen_asistencia": ResumenAsistenciaApoderadoOut(
            porcentaje="96%",
            presentes=48,
            tardanzas=1,
            faltas=1,
        ),
        "proximas_entregas": [
            EntregaProximaOut(
                id="ent-apo-1",
                titulo="Resolución de sistemas 2×2",
                curso="Matemática",
                fecha_entrega="Vie 13 nov · 18:00",
                estado_etiqueta="Pendiente",
                urgente=True,
            ),
            EntregaProximaOut(
                id="ent-apo-2",
                titulo="Ensayo breve sobre la Independencia",
                curso="Ciencias Sociales",
                fecha_entrega="Lun 16 nov · 20:00",
                estado_etiqueta="En curso",
                urgente=False,
            ),
        ],
    },
    "est-demo-2": {
        "nombre": "Sofía Quispe Huamán",
        "grado_seccion": "1.° de Secundaria A",
        "pendientes_total": 1,
        "asistencia_porcentaje": "98%",
        "resumen_asistencia": ResumenAsistenciaApoderadoOut(
            porcentaje="98%",
            presentes=49,
            tardanzas=1,
            faltas=0,
        ),
        "proximas_entregas": [
            EntregaProximaOut(
                id="ent-apo-3",
                titulo="Maqueta del sistema solar",
                curso="Ciencia y Tecnología",
                fecha_entrega="Mar 17 nov · 14:00",
                estado_etiqueta="En curso",
                urgente=False,
            ),
        ],
    },
}

_COMUNICADOS_APODERADO_IDS = {"i1", "i2", "i3", "i4", "m1", "m3"}


def _construir_bandeja_apoderado(estudiante_id: str) -> list[MensajeBandejaApoderadoOut]:
    """Construye los comunicados y mensajes contextualizados al estudiante activo."""
    es_primero = estudiante_id == "est-demo-2"
    curso_docente = "Ciencia y Tecnología" if es_primero else "Matemática"
    docente_remitente = "Prof. Ana Lucía Torres" if es_primero else "Prof. Carlos Mendoza"
    iniciales_docente = "AT" if es_primero else "CM"
    nombre_corto = "Sofía" if es_primero else "Luis Ángel"

    return [
        MensajeBandejaApoderadoOut(
            id="i1",
            origen="institucion",
            remitente="Dirección",
            iniciales="IE",
            curso="",
            asunto="Entrega de libretas del III Trimestre — viernes 20 nov",
            cuerpo=(
                "Estimadas familias: las libretas oficiales estarán disponibles en el portal "
                "desde las 10:00 a.m. y la atención presencial por tutoría será de 15:00 a 18:00."
            ),
            fecha="Hoy, 09:00",
            leido=False,
            requiere_confirmacion=True,
            lectura_confirmada=False,
            etiqueta="Institución",
            ruta_destino="/libreta",
        ),
        MensajeBandejaApoderadoOut(
            id="i2",
            origen="asistencia",
            remitente="Asistencia",
            iniciales="AS",
            curso="",
            asunto=f"Tardanza registrada de {nombre_corto} (07:52)",
            cuerpo=(
                f"{nombre_corto} ingresó a las 07:52 a la institución. Puedes revisar el historial "
                "y enviar una justificación escrita si corresponde."
            ),
            fecha="Hoy, 08:15",
            leido=False,
            requiere_confirmacion=False,
            lectura_confirmada=False,
            etiqueta="Asistencia",
            ruta_destino="/asistencia",
        ),
        MensajeBandejaApoderadoOut(
            id="m1",
            origen="docente",
            remitente=docente_remitente,
            iniciales=iniciales_docente,
            curso=curso_docente,
            asunto=f"Avance positivo de {nombre_corto} en el III Trimestre",
            cuerpo=(
                f"Compartimos que {nombre_corto} completó las últimas actividades de {curso_docente} "
                "con participación destacada en clase."
            ),
            fecha="Ayer, 17:40",
            leido=False,
            requiere_confirmacion=False,
            lectura_confirmada=False,
            etiqueta="Docente",
            ruta_destino="/cursos",
        ),
        MensajeBandejaApoderadoOut(
            id="m3",
            origen="docente",
            remitente="Tutoría de grado",
            iniciales="TU",
            curso="Tutoría y Orientación",
            asunto="Recordatorio de jornada de convivencia escolar",
            cuerpo=(
                "Se recuerda a las familias confirmar el horario de salida del viernes por "
                "actividad formativa de cierre de unidad."
            ),
            fecha="Lun 10 nov",
            leido=True,
            requiere_confirmacion=False,
            lectura_confirmada=False,
            etiqueta="Docente",
            ruta_destino="/mensajes",
        ),
        MensajeBandejaApoderadoOut(
            id="i3",
            origen="institucion",
            remitente="Tesorería",
            iniciales="IE",
            curso="",
            asunto="Cronograma de matrícula regular y ratificación 2027",
            cuerpo="El proceso de ratificación de vacante se habilitará del 1 al 15 de diciembre.",
            fecha="Vie 07 nov",
            leido=True,
            requiere_confirmacion=False,
            lectura_confirmada=False,
            etiqueta="Institución",
            ruta_destino="/inicio",
        ),
    ]


def _validar_pertenencia_apoderado(apoderado_id: str, estudiante_id: str | None = None) -> None:
    """Garantiza DA05: el apoderado solo accede a sus propios hijos vinculados."""
    if apoderado_id != "apo-demo-1" or (
        estudiante_id is not None and estudiante_id not in _APODERADO_HIJOS_DEMO
    ):
        raise ErrorAplicacion(
            title="Acceso no autorizado",
            detail="El estudiante solicitado no está vinculado a este apoderado.",
            status_code=403,
        )


@router.get(
    "/apoderados/{apoderado_id}/hijos/{estudiante_id}/inicio",
    response_model=InicioApoderadoOut,
)
def obtener_inicio_apoderado(apoderado_id: str, estudiante_id: str) -> InicioApoderadoOut:
    """Devuelve bandeja, entregas y resumen de asistencia del hijo vinculado activo (RF01, DA05)."""
    _validar_pertenencia_apoderado(apoderado_id, estudiante_id)
    hijo = _APODERADO_HIJOS_DEMO[estudiante_id]
    bandeja = _construir_bandeja_apoderado(estudiante_id)
    return InicioApoderadoOut(
        apoderado_id=apoderado_id,
        estudiante_id=estudiante_id,
        estudiante_nombre=str(hijo["nombre"]),
        grado_seccion=str(hijo["grado_seccion"]),
        sin_leer=sum(1 for mensaje in bandeja if not mensaje.leido),
        pendientes_total=int(hijo["pendientes_total"]),  # type: ignore[arg-type]
        asistencia_porcentaje=str(hijo["asistencia_porcentaje"]),
        mensajes_bandeja=bandeja,
        proximas_entregas=list(hijo["proximas_entregas"]),  # type: ignore[arg-type]
        resumen_asistencia=hijo["resumen_asistencia"],  # type: ignore[arg-type]
    )


@router.post(
    "/apoderados/{apoderado_id}/comunicados/{comunicado_id}/confirmar-lectura",
    response_model=OperacionBandejaOut,
)
def confirmar_lectura_comunicado_apoderado(
    apoderado_id: str, comunicado_id: str
) -> OperacionBandejaOut:
    """Registra la confirmación de lectura de un comunicado institucional (RF25, DA05)."""
    _validar_pertenencia_apoderado(apoderado_id)
    if comunicado_id not in _COMUNICADOS_APODERADO_IDS:
        raise ErrorAplicacion(
            title="Comunicado no encontrado",
            detail=f"No existe el comunicado '{comunicado_id}' para el apoderado.",
            status_code=404,
        )
    return OperacionBandejaOut(
        ok=True,
        mensaje="Lectura confirmada. Dirección fue notificada.",
    )
