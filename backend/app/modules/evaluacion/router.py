"""Endpoints contractuales (stub) del módulo de evaluación."""

from fastapi import APIRouter

from app.core.errores import ErrorAplicacion
from app.core.pertenencia import validar_pertenencia_apoderado

from .schemas import (
    ActividadDocenteCreateIn,
    ActividadDocenteOut,
    ActividadOut,
    BandejaEnviadosDocenteOut,
    CalificacionesEstudianteOut,
    CalificativoPublicadoOut,
    CompetenciaCatalogoOut,
    CompetenciaNivelOut,
    ConclusionOut,
    ConfirmacionCierreOut,
    ConfirmarCierreIn,
    CursoCalificacionesOut,
    DestinatarioEstudianteOut,
    EstudianteSeccionOut,
    LecturaConfirmadaOut,
    ListaActividadesOut,
    ListaMensajesOut,
    MensajeDocenteCreateIn,
    MensajeEnviadoDocenteOut,
    MensajeOut,
    NivelGuardadoDocenteOut,
    NotasSesionPutIn,
    ObservacionDocenteCreateIn,
    ObservacionDocenteOut,
    PanelEvaluacionSeccionOut,
    RespuestaHiloOut,
    RespuestaMensajeIn,
    SeccionDestinatariosOut,
    SesionClaseCreateIn,
    SesionClaseOut,
)

router = APIRouter(prefix="/evaluacion", tags=["evaluacion"])


@router.get(
    "/estudiantes/{estudiante_id}/calificaciones",
    response_model=CalificacionesEstudianteOut,
)
def obtener_calificaciones_estudiante(
    estudiante_id: str,
    apoderado_id: str | None = None,
) -> CalificacionesEstudianteOut:
    """Devuelve niveles por competencia, conclusiones y calificativos publicados (RF08, DA05)."""
    validar_pertenencia_apoderado(apoderado_id, estudiante_id)
    if estudiante_id == "est-demo-2":
        return CalificacionesEstudianteOut(
            trimestre_actual=3,
            estado_trimestre="En Evaluación",
            criterio_sugerencia="mediana_capacidades",
            cursos=[
                CursoCalificacionesOut(
                    asignatura_id="cta",
                    nombre="Ciencia y Tecnología",
                    docente="Prof. Ana Lucía Torres",
                    competencias=[
                        CompetenciaNivelOut(
                            nombre="Indaga mediante métodos científicos",
                            trimestres=["AD", "A", "AD"],
                        )
                    ],
                    conclusiones=[
                        ConclusionOut(
                            trimestre="II Trimestre",
                            competencia="Explica el mundo físico basándose en conocimientos",
                            nivel="A",
                            texto="Formula hipótesis claras y argumenta con evidencias de laboratorio.",
                        )
                    ],
                    calificativos_publicados=[
                        CalificativoPublicadoOut(
                            id="act-cta-2",
                            tipo="sesion_clase",
                            titulo="Sesión 12: Método científico",
                            fecha="12 nov",
                            competencia="Indaga mediante métodos científicos",
                            nivel="AD",
                            comentario="Sofía lideró el registro de observaciones en laboratorio.",
                        )
                    ],
                ),
                CursoCalificacionesOut(
                    asignatura_id="mat",
                    nombre="Matemática",
                    docente="Prof. Luis Herrera Paredes",
                    competencias=[
                        CompetenciaNivelOut(
                            nombre="Resuelve problemas de cantidad",
                            trimestres=["A", "AD", "A"],
                        )
                    ],
                    conclusiones=[],
                    calificativos_publicados=[],
                ),
            ],
        )
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
def listar_actividades_estudiante(
    estudiante_id: str,
    apoderado_id: str | None = None,
) -> ListaActividadesOut:
    """Lista trabajos y sesiones de clase (nota del día) del estudiante (RF23, DA05)."""
    validar_pertenencia_apoderado(apoderado_id, estudiante_id)
    if estudiante_id == "est-demo-2":
        return ListaActividadesOut(
            pendientes=1,
            vencen_pronto=0,
            actividades=[
                ActividadOut(
                    id="act-cta-1",
                    tipo="trabajo",
                    titulo="Maqueta del sistema solar",
                    curso="Ciencia y Tecnología",
                    asignada="10 nov",
                    fecha_entrega="17 nov",
                    estado="pendiente",
                    urgente=False,
                    competencia="Explica el mundo físico basándose en conocimientos",
                    capacidad="Comprende y usa conocimientos sobre los seres vivos y universo",
                    descripcion="Presentar maqueta rotulada en clase con materiales reciclados.",
                ),
                ActividadOut(
                    id="act-cta-s1",
                    tipo="sesion_clase",
                    titulo="Sesión 12: Método científico (Nota del día)",
                    curso="Ciencia y Tecnología",
                    asignada="12 nov",
                    fecha_entrega=None,
                    estado="calificado",
                    competencia="Indaga mediante métodos científicos",
                    capacidad="Genera y registra datos e información",
                    nivel="AD",
                    comentario="Excelente desempeño durante el experimento guiado.",
                ),
            ],
        )
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
def listar_mensajes_estudiante(
    estudiante_id: str,
    apoderado_id: str | None = None,
) -> ListaMensajesOut:
    """Devuelve la bandeja de mensajes e hilos del estudiante o apoderado (RF25, DA05)."""
    validar_pertenencia_apoderado(apoderado_id, estudiante_id)
    if estudiante_id == "est-demo-2":
        return ListaMensajesOut(
            sin_leer=1,
            mensajes=[
                MensajeOut(
                    id="msg-sof-1",
                    tipo="Tarea",
                    remitente="Prof. Ana Lucía Torres",
                    curso="Ciencia y Tecnología",
                    asunto="Indicaciones de maqueta del sistema solar para Sofía",
                    fecha="Hoy",
                    fecha_larga="hoy, 09:20",
                    destinatarios="1.° A · Sofía Quispe Huamán",
                    cuerpo="Se recuerda traer la maqueta con rótulos legibles el martes 17.",
                    actividad_id="act-cta-1",
                    no_leido=True,
                    lectura_confirmada=False,
                    respuestas=[],
                )
            ],
        )
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



_SECCIONES_DOCENTE_META: dict[str, tuple[str, int]] = {
    "3A": ("3.° A", 32),
    "3B": ("3.° B", 30),
    "4A": ("4.° A", 31),
    "4C": ("4.° C", 29),
}

_NOMBRES_PILOTO = [
    "Luis Ángel", "María José", "Diego", "Ana Lucía", "Jhon", "Rosa", "Kevin",
    "Milagros", "Carlos", "Yesenia", "Edwin", "Lucero", "Frank", "Nayeli",
    "Alexander", "Sofía", "Brayan", "Fiorella", "Jhordan", "Valeria", "Renzo",
    "Camila", "Joel", "Dayana", "Gabriel", "Andrea", "Rodrigo", "Xiomara",
    "Josué", "Mayra", "Elmer", "Karina",
]
_APELLIDOS_PILOTO = [
    "Quispe Huamán", "Huamaní Ccori", "Palomino Tito", "Cárdenas Rojas",
    "Mendoza Yupanqui", "Pariona Gómez", "Ayala Bautista", "Gutiérrez Ore",
    "Tineo Prado", "Ccahuana Flores", "Vílchez Sulca", "Alarcón Medina",
    "Bendezú Lapa", "Torres Chávez", "Quispe Ramos", "Huamán Allcca",
    "Prado Infanzón", "Cisneros Aguilar", "Llactahuamán Soto", "Rojas Najarro",
]

_COMPETENCIAS_CATALOGO: list[CompetenciaCatalogoOut] = [
    CompetenciaCatalogoOut(
        codigo="C1",
        nombre="Resuelve problemas de cantidad",
        capacidades=[
            "Traduce cantidades a expresiones numéricas",
            "Comunica su comprensión sobre los números y las operaciones",
            "Usa estrategias y procedimientos de estimación y cálculo",
            "Argumenta afirmaciones sobre las relaciones numéricas y las operaciones",
        ],
    ),
    CompetenciaCatalogoOut(
        codigo="C2",
        nombre="Resuelve problemas de regularidad, equivalencia y cambio",
        capacidades=[
            "Traduce datos y condiciones a expresiones algebraicas y gráficas",
            "Comunica su comprensión sobre las relaciones algebraicas",
            "Usa estrategias y procedimientos para encontrar equivalencias y reglas generales",
            "Argumenta afirmaciones sobre relaciones de cambio y equivalencia",
        ],
    ),
    CompetenciaCatalogoOut(
        codigo="C3",
        nombre="Resuelve problemas de forma, movimiento y localización",
        capacidades=[
            "Modela objetos con formas geométricas y sus transformaciones",
            "Comunica su comprensión sobre las formas y relaciones geométricas",
            "Usa estrategias y procedimientos para medir y orientarse en el espacio",
            "Argumenta afirmaciones sobre relaciones geométricas",
        ],
    ),
    CompetenciaCatalogoOut(
        codigo="C4",
        nombre="Resuelve problemas de gestión de datos e incertidumbre",
        capacidades=[
            "Representa datos con gráficos y medidas estadísticas o probabilísticas",
            "Comunica su comprensión de los conceptos estadísticos y probabilísticos",
            "Usa estrategias y procedimientos para recopilar y procesar datos",
            "Sustenta conclusiones o decisiones con base en la información obtenida",
        ],
    ),
]

_CRITERIOS_BASE: list[list[str]] = [
    [
        "Identifica los datos del problema",
        "Traduce las condiciones a una expresión",
        "Representa con gráfico o material",
        "Verifica que la expresión cumpla las condiciones",
    ],
    [
        "Usa lenguaje matemático adecuado",
        "Explica su procedimiento con claridad",
        "Relaciona distintas representaciones",
        "Responde preguntas de sus compañeros",
    ],
    [
        "Selecciona una estrategia pertinente",
        "Aplica el procedimiento correctamente",
        "Realiza cálculos sin errores",
        "Revisa y corrige su resultado",
    ],
    [
        "Plantea una afirmación",
        "La justifica con ejemplos",
        "Usa propiedades para sustentarla",
        "Identifica errores en otros razonamientos",
    ],
]

_SESIONES_PLAN: list[tuple[str, int, str, str, str]] = [
    ("C4", 0, "Tablas de frecuencia", "Tabla de frecuencias de una encuesta", "23 sep"),
    ("C4", 2, "Gráficos de barras", "Gráfico de barras de la encuesta", "25 sep"),
    ("C3", 0, "Prismas y su desarrollo", "Desarrollo plano de un prisma", "30 sep"),
    ("C3", 2, "Área lateral y total", "Cálculo de áreas en prismas", "2 oct"),
    ("C3", 3, "Propiedades de los prismas", "Justificación escrita", "7 oct"),
    ("C1", 0, "Porcentajes", "Problemas de porcentaje", "9 oct"),
    ("C1", 2, "Descuentos sucesivos", "Ficha de descuentos", "14 oct"),
    ("C1", 1, "Aumentos y descuentos", "Exposición en pares", "16 oct"),
    ("C1", 3, "Interés simple", "Argumentación de resultados", "21 oct"),
    ("C2", 0, "Plantear ecuaciones", "Traducción de enunciados", "23 oct"),
    ("C2", 0, "Sistemas de ecuaciones 2×2", "Planteamiento de sistemas", "28 oct"),
    ("C2", 2, "Método de sustitución", "Resolución en la pizarra", "30 oct"),
    ("C2", 2, "Método de reducción", "Práctica dirigida", "4 nov"),
    ("C2", 1, "Interpretación gráfica", "Gráfica de dos rectas", "6 nov"),
    ("C2", 2, "Práctica calificada", "Práctica de sistemas de ecuaciones", "9 nov"),
    ("C2", 0, "Funciones lineales", "Tabla y gráfica de una función", "11 nov"),
    ("C2", 3, "Pendiente y razón de cambio", "Explicación de la pendiente", "12 nov"),
]

_ACTIVIDADES_REGISTRO: dict[str, ActividadDocenteOut] = {
    "a5": ActividadDocenteOut(
        id="a5",
        titulo="Encuesta y gráficos de barras",
        fecha_entrega="20 oct",
        competencia="C4",
        descripcion="Aplica una encuesta a 20 personas y representa los resultados en un gráfico de barras.",
        estado="publicada",
    ),
    "a2": ActividadDocenteOut(
        id="a2",
        titulo="Construcción de prismas",
        fecha_entrega="27 oct",
        competencia="C3",
        descripcion="Construye un prisma con su desarrollo plano y calcula su área lateral.",
        estado="publicada",
    ),
    "a1": ActividadDocenteOut(
        id="a1",
        titulo="Ficha: porcentajes y descuentos",
        fecha_entrega="3 nov",
        competencia="C1",
        descripcion="Resuelve los problemas de la ficha sobre descuentos sucesivos.",
        estado="publicada",
    ),
    "a3": ActividadDocenteOut(
        id="a3",
        titulo="Práctica calificada: sistemas de ecuaciones",
        fecha_entrega="12 nov",
        competencia="C2",
        descripcion="Práctica individual en clase.",
        estado="publicada",
    ),
    "a4": ActividadDocenteOut(
        id="a4",
        titulo="Ficha: funciones lineales",
        fecha_entrega="18 nov",
        competencia="C2",
        descripcion="Ejercicios 1 al 12 de la ficha entregada en clase.",
        estado="publicada",
    ),
    "a6": ActividadDocenteOut(
        id="a6",
        titulo="Proyecto: presupuesto familiar",
        fecha_entrega="25 nov",
        competencia="C1",
        descripcion="Elabora el presupuesto mensual de una familia de cuatro integrantes.",
        estado="borrador",
    ),
}


def _hash_unitario(clave: str) -> float:
    h = 2166136261
    for ch in clave:
        h ^= ord(ch)
        h = (h * 16777619) & 0xFFFFFFFF
    return h / 4294967295.0


def _validar_seccion(seccion_id: str) -> tuple[str, int]:
    meta = _SECCIONES_DOCENTE_META.get(seccion_id)
    if meta is None:
        raise ErrorAplicacion(
            title="Sección no encontrada",
            detail=f"No existe la sección '{seccion_id}' asignada al docente.",
            status_code=404,
        )
    return meta


def _nomina_estudiantes(seccion_id: str, total: int) -> list[EstudianteSeccionOut]:
    si = list(_SECCIONES_DOCENTE_META.keys()).index(seccion_id)
    nombres_usados: set[str] = set()
    lista: list[str] = []
    i = 0
    while len(lista) < total:
        nm = f"{_APELLIDOS_PILOTO[(i * 7 + si * 3) % 20]}, {_NOMBRES_PILOTO[(i * 5 + si * 11 + i // 20) % 32]}"
        if nm not in nombres_usados:
            nombres_usados.add(nm)
            lista.append(nm)
        i += 1
    if seccion_id == "3B" and lista:
        lista[0] = "Quispe Huamán, Luis Ángel"
    lista.sort()
    estudiantes: list[EstudianteSeccionOut] = []
    for idx, nombre in enumerate(lista):
        partes = nombre.split(", ")
        nombre_pila = partes[1] if len(partes) > 1 else nombre
        iniciales = f"{nombre_pila[0]}{nombre[0]}".upper()
        correlativo = str(3487210000 + int(_hash_unitario(f"{seccion_id}{nombre}") * 9999))[-10:]
        estudiantes.append(
            EstudianteSeccionOut(
                indice=idx,
                codigo=f"0512{correlativo}",
                nombre=nombre,
                iniciales=iniciales,
                observaciones_total=1 if (seccion_id == "3B" and idx == 2) else 0,
            )
        )
    return estudiantes


def _construir_sesiones(seccion_id: str, total: int) -> list[SesionClaseOut]:
    sesiones: list[SesionClaseOut] = []
    for j, (comp, cap_idx, tema, evid, fecha) in enumerate(_SESIONES_PLAN):
        pendiente = seccion_id != "3A" and j == len(_SESIONES_PLAN) - 1
        notas: dict[str, list[str]] = {}
        if not pendiente:
            for idx in range(total):
                criterios_alumno: list[str] = []
                base_stu = _hash_unitario(f"{seccion_id}|{idx}")
                for k in range(4):
                    r = _hash_unitario(f"{seccion_id}|{idx}|s{j}|{k}") * 0.6 + base_stu * 0.4
                    nivel = "C" if r < 0.12 else "B" if r < 0.36 else "A" if r < 0.82 else "AD"
                    criterios_alumno.append(nivel)
                notas[str(idx)] = criterios_alumno
        sesiones.append(
            SesionClaseOut(
                id=f"{seccion_id}s{j}",
                competencia=comp,  # type: ignore[arg-type]
                capacidad_idx=cap_idx,
                tema=tema,
                evidencia=evid,
                fecha=fecha,
                criterios=list(_CRITERIOS_BASE[cap_idx]),
                notas_por_estudiante=notas,
                ajustes_manuales={},
                estado="pendiente" if pendiente else "registrada",
            )
        )
    return sesiones


@router.get(
    "/docentes/{docente_id}/secciones/{seccion_id}/clases",
    response_model=PanelEvaluacionSeccionOut,
)
def obtener_panel_evaluacion_seccion(
    docente_id: str, seccion_id: str
) -> PanelEvaluacionSeccionOut:
    """Devuelve catálogo de competencias, nómina, sesiones, actividades y cierres de sección."""
    _ = docente_id
    nombre_sec, total = _validar_seccion(seccion_id)
    confirmadas = {"C1", "C2", "C3", "C4"} if seccion_id == "3A" else {"C1"} if seccion_id == "4A" else set()
    cierres = [
        NivelGuardadoDocenteOut(
            competencia=comp.codigo,
            confirmada=comp.codigo in confirmadas,
            niveles_por_estudiante={},
            conclusiones_por_estudiante={},
        )
        for comp in _COMPETENCIAS_CATALOGO
    ]
    return PanelEvaluacionSeccionOut(
        seccion_id=seccion_id,
        seccion_nombre=nombre_sec,
        asignatura_nombre="Matemática",
        nivel_educativo="Secundaria",
        competencias=_COMPETENCIAS_CATALOGO,
        estudiantes=_nomina_estudiantes(seccion_id, total),
        sesiones=_construir_sesiones(seccion_id, total),
        actividades=list(_ACTIVIDADES_REGISTRO.values()),
        cierres=cierres,
        observaciones=[
            ObservacionDocenteOut(
                id="obs-1",
                estudiante_idx=2,
                tipo="Positiva",
                texto="Mejoró su participación en clase resolviendo sistemas en pizarra.",
                fecha="9 nov",
            )
        ]
        if seccion_id == "3B"
        else [],
    )


@router.post(
    "/docentes/{docente_id}/secciones/{seccion_id}/sesiones",
    response_model=SesionClaseOut,
    status_code=201,
)
def crear_sesion_clase(
    docente_id: str, seccion_id: str, datos: SesionClaseCreateIn
) -> SesionClaseOut:
    """Crea una nueva sesión de clase con cuatro criterios evaluables K1..K4."""
    _ = docente_id
    _validar_seccion(seccion_id)
    return SesionClaseOut(
        id=f"{seccion_id}s-nueva",
        competencia=datos.competencia,
        capacidad_idx=datos.capacidad_idx,
        tema=datos.tema,
        evidencia=datos.evidencia.strip() or "Registro de desempeño en clase",
        fecha=datos.fecha,
        criterios=datos.criterios,
        notas_por_estudiante={},
        ajustes_manuales={},
        estado="pendiente",
    )


@router.put(
    "/docentes/{docente_id}/secciones/{seccion_id}/sesiones/{sesion_id}/notas",
    response_model=SesionClaseOut,
)
def guardar_notas_sesion(
    docente_id: str, seccion_id: str, sesion_id: str, datos: NotasSesionPutIn
) -> SesionClaseOut:
    """Guarda avances o publica la sesión exigiendo 4 criterios válidos por estudiante."""
    _ = docente_id
    _, total = _validar_seccion(seccion_id)
    niveles_validos = {"AD", "A", "B", "C"}

    if datos.publicar:
        pendientes = 0
        for idx in range(total):
            criterios = datos.notas_por_estudiante.get(str(idx), [])
            if len(criterios) != 4 or any(c not in niveles_validos for c in criterios):
                pendientes += 1
        if pendientes > 0:
            raise ErrorAplicacion(
                title="Criterios incompletos",
                detail=(
                    f"Faltan criterios por completar en {pendientes} estudiante(s) "
                    "antes de publicar la sesión."
                ),
                status_code=400,
            )

    sesiones = {s.id: s for s in _construir_sesiones(seccion_id, total)}
    base = sesiones.get(sesion_id)
    return SesionClaseOut(
        id=sesion_id,
        competencia=base.competencia if base else "C2",
        capacidad_idx=base.capacidad_idx if base else 0,
        tema=base.tema if base else "Sesión registrada",
        evidencia=base.evidencia if base else "Registro de clase",
        fecha=base.fecha if base else "Hoy",
        criterios=base.criterios if base else list(_CRITERIOS_BASE[0]),
        notas_por_estudiante=datos.notas_por_estudiante,
        ajustes_manuales=dict(datos.ajustes_manuales),
        estado="registrada" if datos.publicar else "pendiente",
    )


@router.post(
    "/docentes/{docente_id}/secciones/{seccion_id}/actividades",
    response_model=ActividadDocenteOut,
    status_code=201,
)
def crear_actividad_docente(
    docente_id: str, seccion_id: str, datos: ActividadDocenteCreateIn
) -> ActividadDocenteOut:
    """Registra una actividad académica como borrador o publicada sin adjuntos (RC08)."""
    _ = docente_id
    _validar_seccion(seccion_id)
    nueva = ActividadDocenteOut(
        id=f"act-{seccion_id.lower()}-101",
        titulo=datos.titulo,
        fecha_entrega=datos.fecha_entrega,
        competencia=datos.competencia,
        descripcion=datos.descripcion.strip() or "Sin indicaciones adicionales.",
        estado=datos.estado,
    )
    _ACTIVIDADES_REGISTRO[nueva.id] = nueva
    return nueva


@router.post(
    "/docentes/{docente_id}/actividades/{actividad_id}/publicar",
    response_model=ActividadDocenteOut,
)
def publicar_actividad_docente(docente_id: str, actividad_id: str) -> ActividadDocenteOut:
    """Publica una actividad que se encontraba en borrador."""
    _ = docente_id
    actividad = _ACTIVIDADES_REGISTRO.get(actividad_id)
    if actividad is None:
        raise ErrorAplicacion(
            title="Actividad no encontrada",
            detail=f"No existe la actividad '{actividad_id}'.",
            status_code=404,
        )
    actualizada = actividad.model_copy(update={"estado": "publicada"})
    _ACTIVIDADES_REGISTRO[actividad_id] = actualizada
    return actualizada


@router.post(
    "/docentes/{docente_id}/secciones/{seccion_id}/cierre/confirmar",
    response_model=ConfirmacionCierreOut,
)
def confirmar_cierre_competencia(
    docente_id: str, seccion_id: str, datos: ConfirmarCierreIn
) -> ConfirmacionCierreOut:
    """Valida completitud de niveles y conclusiones obligatorias (RF22) al confirmar cierre."""
    _ = docente_id
    _validar_seccion(seccion_id)
    obligatorios = {"B", "C"} if datos.nivel_educativo == "Primaria" else {"C"}
    sin_nivel = 0
    sin_conclusion = 0

    for fila in datos.filas:
        if fila.nivel not in {"AD", "A", "B", "C"}:
            sin_nivel += 1
            continue
        if fila.nivel in obligatorios and len(fila.conclusion.strip()) < 10:
            sin_conclusion += 1

    if sin_nivel > 0 or sin_conclusion > 0:
        raise ErrorAplicacion(
            title="Validación de cierre incompleta",
            detail=(
                f"No se puede confirmar {datos.competencia}: {sin_nivel} sin nivel asignado "
                f"y {sin_conclusion} con conclusión descriptiva pendiente (mín. 10 caracteres)."
            ),
            status_code=400,
        )

    return ConfirmacionCierreOut(
        seccion_id=seccion_id,
        competencia=datos.competencia,
        confirmada=True,
        total_confirmados=len(datos.filas),
    )


@router.post(
    "/docentes/{docente_id}/secciones/{seccion_id}/observaciones",
    response_model=ObservacionDocenteOut,
    status_code=201,
)
def registrar_observacion_docente(
    docente_id: str, seccion_id: str, datos: ObservacionDocenteCreateIn
) -> ObservacionDocenteOut:
    """Publica una observación cualitativa dirigida al estudiante y su apoderado (RF24)."""
    _ = docente_id
    _validar_seccion(seccion_id)
    return ObservacionDocenteOut(
        id=f"obs-{seccion_id.lower()}-{datos.estudiante_idx}",
        estudiante_idx=datos.estudiante_idx,
        tipo=datos.tipo,
        texto=datos.texto,
        fecha="Hoy",
    )


_ENVIADOS_DOCENTE_BASE: list[MensajeEnviadoDocenteOut] = [
    MensajeEnviadoDocenteOut(
        id="env-1",
        tipo="Tarea",
        seccion_id="3B",
        destinatario="3.° B",
        asunto="Nueva ficha: funciones lineales",
        cuerpo="Resuelvan los ejercicios 1 al 12. Entrega: miércoles 18 de noviembre.",
        fecha="Ayer, 19:05",
    ),
    MensajeEnviadoDocenteOut(
        id="env-2",
        tipo="Recordatorio",
        seccion_id="4A",
        destinatario="4.° A",
        asunto="Traer calculadora científica el viernes",
        cuerpo="La utilizaremos para verificar razones trigonométricas y pendientes.",
        fecha="10 nov",
    ),
    MensajeEnviadoDocenteOut(
        id="env-3",
        tipo="Observación · Positiva",
        seccion_id="3B",
        destinatario="Diego Cárdenas Rojas y apoderado (3.° B)",
        asunto="Mejoró su participación en clase",
        cuerpo="Resolvió correctamente los problemas propuestos en pizarra.",
        fecha="9 nov",
    ),
    MensajeEnviadoDocenteOut(
        id="env-4",
        tipo="Tarea",
        seccion_id="4C",
        destinatario="4.° C",
        asunto="Práctica de sistemas de ecuaciones",
        cuerpo="Repasar el método de igualación y sustitución.",
        fecha="5 nov",
    ),
]


@router.get(
    "/docentes/{docente_id}/mensajes",
    response_model=BandejaEnviadosDocenteOut,
)
def listar_mensajes_docente(docente_id: str) -> BandejaEnviadosDocenteOut:
    """Devuelve catálogo de secciones/estudiantes e historial de mensajes enviados."""
    _ = docente_id
    secciones = [
        SeccionDestinatariosOut(
            seccion_id=sec_id,
            nombre=nombre,
            estudiantes_total=total,
            estudiantes=[
                DestinatarioEstudianteOut(indice=est.indice, nombre=est.nombre)
                for est in _nomina_estudiantes(sec_id, total)
            ],
        )
        for sec_id, (nombre, total) in _SECCIONES_DOCENTE_META.items()
    ]
    return BandejaEnviadosDocenteOut(secciones=secciones, enviados=_ENVIADOS_DOCENTE_BASE)


@router.post(
    "/docentes/{docente_id}/mensajes",
    response_model=MensajeEnviadoDocenteOut,
    status_code=201,
)
def enviar_mensaje_docente(
    docente_id: str, datos: MensajeDocenteCreateIn
) -> MensajeEnviadoDocenteOut:
    """Registra y envía un mensaje docente (Tarea o Recordatorio) sin archivos adjuntos."""
    _ = docente_id
    nombre_sec, total = _validar_seccion(datos.seccion_id)
    destinatario = nombre_sec

    if datos.estudiante_idx is not None:
        nomina = _nomina_estudiantes(datos.seccion_id, total)
        if datos.estudiante_idx < 0 or datos.estudiante_idx >= len(nomina):
            raise ErrorAplicacion(
                title="Destinatario no encontrado",
                detail=f"El estudiante índice {datos.estudiante_idx} no pertenece a {nombre_sec}.",
                status_code=404,
            )
        alumno = nomina[datos.estudiante_idx].nombre
        destinatario = f"{alumno} y apoderado ({nombre_sec})"

    return MensajeEnviadoDocenteOut(
        id=f"env-{datos.seccion_id.lower()}-{len(_ENVIADOS_DOCENTE_BASE) + 1}",
        tipo=datos.tipo,
        seccion_id=datos.seccion_id,
        destinatario=destinatario,
        asunto=datos.asunto,
        cuerpo=datos.cuerpo,
        fecha="Hoy, ahora",
    )
