"""Endpoints contractuales (stub) del módulo de reportes."""

from fastapi import APIRouter

from app.core.errores import ErrorAplicacion
from app.core.pertenencia import validar_pertenencia_apoderado

from .schemas import (
    AreaLibretaOut,
    FilaLibretaCompetenciaOut,
    LibretasOut,
    ResumenSiagieDocenteOut,
    SeccionSiagieEstadoOut,
    SituacionFinalOut,
    SolicitudDescargaSiagieIn,
    TrimestreLibretaOut,
    TrimestreSiagieOut,
    UrlDescargaOut,
)

router = APIRouter(prefix="/reportes", tags=["reportes"])


@router.get("/estudiantes/{estudiante_id}/libretas", response_model=LibretasOut)
def obtener_libretas_estudiante(
    estudiante_id: str,
    apoderado_id: str | None = None,
) -> LibretasOut:
    """Devuelve las libretas trimestrales y situación final (contrato stub, DA05)."""
    validar_pertenencia_apoderado(apoderado_id, estudiante_id)
    if estudiante_id == "est-demo-2":
        areas_demo = [
            AreaLibretaOut(
                nombre="Ciencia y Tecnología",
                competencias=[
                    FilaLibretaCompetenciaOut(
                        competencia="Indaga mediante métodos científicos",
                        nivel="AD",
                        conclusion="Sobresale en la formulación de hipótesis y experimentación.",
                    )
                ],
            ),
            AreaLibretaOut(
                nombre="Matemática",
                competencias=[
                    FilaLibretaCompetenciaOut(
                        competencia="Resuelve problemas de cantidad",
                        nivel="A",
                        conclusion="",
                    )
                ],
            ),
        ]
        grado_seccion = "1.° Secundaria · A"
    else:
        areas_demo = [
            AreaLibretaOut(
                nombre="Matemática",
                competencias=[
                    FilaLibretaCompetenciaOut(
                        competencia="Resuelve problemas de cantidad",
                        nivel="A",
                        conclusion="",
                    )
                ],
            )
        ]
        grado_seccion = "3.° Secundaria · B"
    return LibretasOut(
        estudiante_id=estudiante_id,
        anio_escolar=2026,
        grado_seccion=grado_seccion,
        trimestres=[
            TrimestreLibretaOut(
                trimestre_id=1,
                nombre="I Trimestre",
                rango_fechas="9 mar – 29 may",
                publicada=True,
                fecha_publicacion="2026-06-05",
                areas=areas_demo,
            ),
            TrimestreLibretaOut(
                trimestre_id=2,
                nombre="II Trimestre",
                rango_fechas="1 jun – 11 sep",
                publicada=True,
                fecha_publicacion="2026-09-11",
                areas=areas_demo,
            ),
            TrimestreLibretaOut(
                trimestre_id=3,
                nombre="III Trimestre",
                rango_fechas="14 sep – 18 dic",
                publicada=False,
                fecha_publicacion=None,
                areas=[],
            ),
        ],
        situacion_final=SituacionFinalOut(calculada=False, codigo=None, etiqueta=None),
    )


@router.get(
    "/estudiantes/{estudiante_id}/libretas/{trimestre_id}/descarga",
    response_model=UrlDescargaOut,
)
def obtener_url_descarga_libreta(
    estudiante_id: str,
    trimestre_id: int,
    apoderado_id: str | None = None,
) -> UrlDescargaOut:
    """Devuelve una URL firmada temporal de 15 min para descargar el PDF (RC05, DA05)."""
    validar_pertenencia_apoderado(apoderado_id, estudiante_id)
    return UrlDescargaOut(
        url_firmada=f"https://storage.googleapis.com/portal-mariscal-stub/libreta-{estudiante_id}-t{trimestre_id}.pdf?X-Goog-Expires=900",
        expira_en_segundos=900,
        nombre_archivo=f"libreta_T{trimestre_id}_{estudiante_id}.pdf",
    )



_SECCIONES_SIAGIE_META: list[tuple[str, str, int, int]] = [
    ("3A", "3.° A", 32, 4),
    ("3B", "3.° B", 30, 0),
    ("4A", "4.° A", 31, 1),
    ("4C", "4.° C", 29, 0),
]


def _construir_trimestres_siagie() -> list[TrimestreSiagieOut]:
    trimestres: list[TrimestreSiagieOut] = []
    for trim_id, nombre, cerrado in (
        (1, "I Trim.", True),
        (2, "II Trim.", True),
        (3, "III Trim.", False),
    ):
        secciones = [
            SeccionSiagieEstadoOut(
                seccion_id=sec_id,
                nombre=sec_nombre,
                estudiantes_total=total,
                competencias_confirmadas=4 if trim_id < 3 else conf_t3,
                competencias_total=4,
                listo_para_exportar=(trim_id < 3 or conf_t3 == 4),
            )
            for sec_id, sec_nombre, total, conf_t3 in _SECCIONES_SIAGIE_META
        ]
        trimestres.append(
            TrimestreSiagieOut(
                trimestre_id=trim_id,
                nombre=nombre,
                cerrado=cerrado,
                secciones=secciones,
            )
        )
    return trimestres


@router.get(
    "/docentes/{docente_id}/siagie",
    response_model=ResumenSiagieDocenteOut,
)
def obtener_resumen_siagie_docente(docente_id: str) -> ResumenSiagieDocenteOut:
    """Devuelve estado de preparación SIAGIE y Actas por trimestre y sección."""
    _ = docente_id
    return ResumenSiagieDocenteOut(
        asignatura="Matemática",
        trimestres=_construir_trimestres_siagie(),
    )


@router.post(
    "/docentes/{docente_id}/siagie/{seccion_id}/descarga",
    response_model=UrlDescargaOut,
)
def generar_descarga_siagie_docente(
    docente_id: str, seccion_id: str, datos: SolicitudDescargaSiagieIn
) -> UrlDescargaOut:
    """Emite URL firmada temporal (TTL 15 min) para Excel SIAGIE o Acta preliminar (RF16, RC05)."""
    trimestres = {t.trimestre_id: t for t in _construir_trimestres_siagie()}
    trimestre = trimestres[datos.trimestre_id]
    mapa_sec = {s.seccion_id: s for s in trimestre.secciones}
    seccion = mapa_sec.get(seccion_id)

    if seccion is None:
        raise ErrorAplicacion(
            title="Sección no encontrada",
            detail=f"No existe la sección '{seccion_id}' asignada al docente.",
            status_code=404,
        )

    if not seccion.listo_para_exportar:
        faltantes = seccion.competencias_total - seccion.competencias_confirmadas
        raise ErrorAplicacion(
            title="Cierre incompleto para exportar",
            detail=(
                f"La sección {seccion.nombre} aún tiene {faltantes} competencia(s) "
                "sin confirmar en este trimestre."
            ),
            status_code=400,
        )

    if datos.formato == "excel_siagie":
        nombre_archivo = f"SIAGIE_Matematica_{seccion_id}_T{datos.trimestre_id}.xlsx"
    else:
        nombre_archivo = f"Acta_preliminar_{seccion_id}_T{datos.trimestre_id}.pdf"

    return UrlDescargaOut(
        url_firmada=(
            f"https://storage.googleapis.com/portal-mariscal-stub/docente-{docente_id}/"
            f"{nombre_archivo}?X-Goog-Expires=900"
        ),
        expira_en_segundos=900,
        nombre_archivo=nombre_archivo,
    )
