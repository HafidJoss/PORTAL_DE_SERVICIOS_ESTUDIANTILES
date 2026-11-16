"""Endpoints contractuales (stub) del módulo de reportes."""

from fastapi import APIRouter

from .schemas import (
    AreaLibretaOut,
    FilaLibretaCompetenciaOut,
    LibretasOut,
    SituacionFinalOut,
    TrimestreLibretaOut,
    UrlDescargaOut,
)

router = APIRouter(prefix="/reportes", tags=["reportes"])


@router.get("/estudiantes/{estudiante_id}/libretas", response_model=LibretasOut)
def obtener_libretas_estudiante(estudiante_id: str) -> LibretasOut:
    """Devuelve las libretas trimestrales y situación final (contrato stub)."""
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
    return LibretasOut(
        estudiante_id=estudiante_id,
        anio_escolar=2026,
        grado_seccion="3.° Secundaria · B",
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
    estudiante_id: str, trimestre_id: int
) -> UrlDescargaOut:
    """Devuelve una URL firmada temporal de 15 min para descargar el PDF (RC05)."""
    return UrlDescargaOut(
        url_firmada=f"https://storage.googleapis.com/portal-mariscal-stub/libreta-{estudiante_id}-t{trimestre_id}.pdf?X-Goog-Expires=900",
        expira_en_segundos=900,
        nombre_archivo=f"libreta_T{trimestre_id}_{estudiante_id}.pdf",
    )
