import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";

import type { UrlDescargaOut, UsuarioSesionOut } from "../../api/generated/model";
import {
  obtenerUrlDescargaLibretaApiV1ReportesEstudiantesEstudianteIdLibretasTrimestreIdDescargaGet,
  useObtenerLibretasEstudianteApiV1ReportesEstudiantesEstudianteIdLibretasGet,
} from "../../api/generated/reportes/reportes";
import { BadgeNivel } from "../../shared/components/BadgeNivel";
import { BannerHero } from "../../shared/components/BannerHero";
import { Button } from "../../shared/components/Button";
import { Card } from "../../shared/components/Card";
import { EstadoVacio } from "../../shared/components/EstadoVacio";
import { resolverEstudianteId } from "../../shared/utils/sesion";
import {
  contarPublicadas,
  etiquetaSituacionFinal,
  formatearMinutosVigencia,
  seleccionarTrimestreInicial,
} from "./resumenLibreta";

interface LibretaPageProps {
  usuario: UsuarioSesionOut;
}

/** Vista Libreta de notas (/libreta) con vista previa oficial y descarga por URL firmada (RC05). */
export function LibretaPage({ usuario }: LibretaPageProps) {
  const estudianteId = resolverEstudianteId(usuario);
  const [trimestreElegidoId, setTrimestreElegidoId] = useState<number | null>(null);
  const [descargaPorTrimestre, setDescargaPorTrimestre] = useState<Record<number, UrlDescargaOut>>(
    {},
  );
  const [errorDescarga, setErrorDescarga] = useState<string | null>(null);

  const consulta = useObtenerLibretasEstudianteApiV1ReportesEstudiantesEstudianteIdLibretasGet(
    estudianteId,
    {
      query: {
        enabled: Boolean(estudianteId),
      },
    },
  );

  const mutDescarga = useMutation({
    mutationFn: async (trimestreId: number) => {
      const resp =
        await obtenerUrlDescargaLibretaApiV1ReportesEstudiantesEstudianteIdLibretasTrimestreIdDescargaGet(
          estudianteId,
          trimestreId,
        );
      if (resp.status !== 200) {
        throw new Error("No se pudo generar el enlace temporal.");
      }
      return { trimestreId, datos: resp.data };
    },
  });

  if (!estudianteId) {
    return (
      <EstadoVacio
        titulo="Vista disponible solo para estudiantes"
        descripcion="Tu cuenta actual no tiene un perfil de estudiante asociado para consultar libretas."
      />
    );
  }

  const datos = consulta.data?.status === 200 ? consulta.data.data : undefined;
  const resumen = datos ? contarPublicadas(datos.trimestres) : { publicadas: 0, total: 0 };
  const trimestreIdActivo =
    trimestreElegidoId ?? (datos ? seleccionarTrimestreInicial(datos.trimestres) : null);
  const trimestreActivo = datos?.trimestres.find((t) => t.trimestre_id === trimestreIdActivo);
  const descargaActiva =
    trimestreActivo !== undefined ? descargaPorTrimestre[trimestreActivo.trimestre_id] : undefined;

  async function manejarSolicitarDescarga(trimestreId: number) {
    setErrorDescarga(null);
    try {
      const resultado = await mutDescarga.mutateAsync(trimestreId);
      setDescargaPorTrimestre((prev) => ({
        ...prev,
        [resultado.trimestreId]: resultado.datos,
      }));
    } catch {
      setErrorDescarga("No se pudo generar el enlace de descarga. Inténtalo nuevamente.");
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <BannerHero
        titulo="Libreta de notas"
        subtitulo={
          datos
            ? `Informe de progreso del aprendizaje por trimestre · Año escolar ${datos.anio_escolar}`
            : "Informe de progreso del aprendizaje por trimestre"
        }
        acciones={
          datos ? (
            <div>
              <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 24 }}>
                {resumen.publicadas} de {resumen.total}
              </div>
              <div style={{ fontSize: 12, color: "#CBD5E1" }}>Publicadas</div>
            </div>
          ) : null
        }
      />

      {consulta.isLoading ? (
        <EstadoVacio
          titulo="Cargando libretas..."
          descripcion="Estamos consultando las libretas publicadas de tu año escolar."
        />
      ) : consulta.isError || !datos ? (
        <EstadoVacio
          titulo="No pudimos cargar tus libretas"
          descripcion="Ocurrió un problema al consultar el informe de progreso. Inténtalo nuevamente."
          accion={
            <Button variant="primary" onClick={() => void consulta.refetch()}>
              Reintentar
            </Button>
          }
        />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
            gap: 20,
            alignItems: "start",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {datos.trimestres.map((t) => {
              const seleccionado = t.trimestre_id === trimestreActivo?.trimestre_id;
              return (
                <button
                  key={t.trimestre_id}
                  type="button"
                  aria-pressed={seleccionado}
                  onClick={() => {
                    setTrimestreElegidoId(t.trimestre_id);
                    setErrorDescarga(null);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    padding: "14px 16px",
                    borderRadius: "var(--radius-lg)",
                    border: seleccionado
                      ? "2px solid var(--color-primary)"
                      : "1px solid var(--border-card)",
                    backgroundColor: "var(--bg-surface)",
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 14 }}>
                      {t.nombre}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                      {t.rango_fechas}
                    </div>
                  </div>
                  <span
                    style={{
                      padding: "2px 8px",
                      borderRadius: "var(--radius-pill)",
                      backgroundColor: t.publicada
                        ? "var(--status-success-bg)"
                        : "var(--status-warning-bg)",
                      color: t.publicada
                        ? "var(--status-success-fg)"
                        : "var(--status-warning-fg)",
                      fontFamily: "var(--font-button)",
                      fontWeight: 600,
                      fontSize: 11,
                      flexShrink: 0,
                    }}
                  >
                    {t.publicada ? "Publicada" : "En proceso"}
                  </span>
                </button>
              );
            })}

            {datos.situacion_final.calculada && datos.situacion_final.codigo ? (
              <Card>
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", color: "var(--text-muted)" }}>
                  Situación final anual
                </div>
                <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 18, marginTop: 6 }}>
                  {datos.situacion_final.codigo} · {etiquetaSituacionFinal(datos.situacion_final.codigo)}
                </div>
              </Card>
            ) : null}
          </div>

          <div>
            {!trimestreActivo ? (
              <EstadoVacio
                titulo="Sin trimestres disponibles"
                descripcion="Aún no existen periodos registrados para este año escolar."
              />
            ) : !trimestreActivo.publicada ? (
              <EstadoVacio
                titulo="Libreta aún no publicada"
                descripcion={`La libreta del ${trimestreActivo.nombre} estará disponible cuando Dirección la publique al cierre del trimestre.`}
                accion={
                  <Link
                    to="/calificaciones"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      height: 38,
                      padding: "0 16px",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--color-primary)",
                      color: "var(--color-primary)",
                      fontFamily: "var(--font-button)",
                      fontWeight: 600,
                      fontSize: 14,
                      textDecoration: "none",
                    }}
                  >
                    Ir a Calificaciones
                  </Link>
                }
              />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                  <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                    {trimestreActivo.fecha_publicacion
                      ? `Publicada el ${trimestreActivo.fecha_publicacion}`
                      : "Libreta oficial publicada"}
                  </span>
                  <Button
                    variant="primary"
                    disabled={mutDescarga.isPending}
                    onClick={() => void manejarSolicitarDescarga(trimestreActivo.trimestre_id)}
                  >
                    {mutDescarga.isPending ? "Generando enlace..." : "Descargar PDF"}
                  </Button>
                </div>

                {errorDescarga ? (
                  <div
                    role="alert"
                    style={{
                      padding: "12px 14px",
                      borderRadius: "var(--radius-md)",
                      backgroundColor: "var(--status-danger-bg)",
                      color: "var(--status-danger)",
                      fontSize: 13,
                      fontWeight: 500,
                    }}
                  >
                    {errorDescarga}
                  </div>
                ) : null}

                {descargaActiva ? (
                  <Card style={{ backgroundColor: "var(--bg-subtle)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                      <div style={{ fontSize: 13 }}>
                        <strong>Enlace temporal válido por {formatearMinutosVigencia(descargaActiva.expira_en_segundos)} minutos</strong>
                        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                          Haz clic para abrir o guardar tu libreta en PDF.
                        </div>
                      </div>
                      <a
                        href={descargaActiva.url_firmada}
                        download={descargaActiva.nombre_archivo}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontFamily: "var(--font-button)",
                          fontWeight: 600,
                          fontSize: 13,
                          color: "var(--color-primary)",
                        }}
                      >
                        {descargaActiva.nombre_archivo}
                      </a>
                    </div>
                  </Card>
                ) : null}

                <Card>
                  <div style={{ borderBottom: "2px solid var(--color-primary)", paddingBottom: 14, marginBottom: 16 }}>
                    <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 16 }}>
                      Gran Unidad Escolar «Mariscal Cáceres»
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      Ayacucho · UGEL Huamanga
                    </div>
                  </div>

                  <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 18, margin: "0 0 4px" }}>
                    Informe de progreso del aprendizaje
                  </h2>
                  <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>
                    {trimestreActivo.nombre} · {datos.grado_seccion} · Año escolar {datos.anio_escolar}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {trimestreActivo.areas.map((area) => (
                      <div
                        key={area.nombre}
                        style={{
                          border: "1px solid var(--border-card)",
                          borderRadius: "var(--radius-md)",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            padding: "10px 14px",
                            backgroundColor: "var(--bg-subtle)",
                            fontFamily: "var(--font-heading)",
                            fontWeight: 600,
                            fontSize: 14,
                          }}
                        >
                          {area.nombre}
                        </div>
                        {area.competencias.map((comp) => (
                          <div
                            key={comp.competencia}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              gap: 12,
                              padding: "12px 14px",
                              borderTop: "1px solid var(--border-card)",
                            }}
                          >
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 13, fontWeight: 500 }}>
                                {comp.competencia}
                                {comp.es_transversal ? (
                                  <span
                                    style={{
                                      marginLeft: 8,
                                      fontSize: 11,
                                      padding: "2px 6px",
                                      borderRadius: "var(--radius-pill)",
                                      backgroundColor: "var(--bg-subtle)",
                                      color: "var(--text-muted)",
                                    }}
                                  >
                                    Transversal
                                  </span>
                                ) : null}
                              </div>
                              {comp.conclusion ? (
                                <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--text-muted)" }}>
                                  {comp.conclusion}
                                </p>
                              ) : null}
                            </div>
                            <BadgeNivel nivel={comp.nivel} />
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>

                  <p style={{ margin: "16px 0 0", fontSize: 11, color: "var(--text-muted)" }}>
                    Documento generado por el Portal de Servicios Estudiantiles. El Acta Oficial de Evaluación se emite desde el SIAGIE.
                  </p>
                </Card>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
