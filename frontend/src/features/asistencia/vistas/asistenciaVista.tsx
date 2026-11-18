import { useQueryClient } from "@tanstack/react-query";
import { Clock } from "lucide-react";
import { useState } from "react";

import {
  getObtenerAsistenciaMensualApiV1AsistenciaEstudiantesEstudianteIdGetQueryKey,
  useEnviarJustificacionAsistenciaApiV1AsistenciaApoderadosApoderadoIdHijosEstudianteIdJustificacionesPost,
  useObtenerAsistenciaMensualApiV1AsistenciaEstudiantesEstudianteIdGet,
} from "../../../api/generated/asistencia/asistencia";
import type { AsistenciaMesOut, UsuarioSesionOut } from "../../../api/generated/model";
import { BannerPortada } from "../../../shared/componentes/bannerPortada";
import { Boton } from "../../../shared/componentes/boton";
import { Tarjeta } from "../../../shared/componentes/tarjeta";
import { EstadoVacio } from "../../../shared/componentes/estadoVacio";
import {
  resolverContextoEstudiante,
  resolverHijoActivo,
} from "../../../shared/utilidades/sesion";
import { CalendarioAsistencia } from "../componentes/calendarioAsistencia";
import {
  ESTILO_CODIGO_ASISTENCIA,
  MESES_LECTIVOS_ASISTENCIA,
  construirGrillaLaboral,
} from "../utilidades/calendarioMes";
import {
  MOTIVOS_JUSTIFICACION,
  puedeJustificarIncidencia,
  validarJustificacionTexto,
} from "../utilidades/justificacionesAsistencia";

interface AsistenciaVistaProps {
  usuario: UsuarioSesionOut;
  hijoActivoId?: string | null;
}

/** Vista Asistencia (/asistencia): solo lectura en Estudiante y con justificaciones escritas en Apoderado. */
export function AsistenciaVista({ usuario, hijoActivoId }: AsistenciaVistaProps) {
  const queryClient = useQueryClient();
  const { estudianteId, apoderadoId } = resolverContextoEstudiante(usuario, hijoActivoId);
  const esApoderado = usuario.rol === "Apoderado";
  const hijoActivo = esApoderado ? resolverHijoActivo(usuario, hijoActivoId) : null;
  const [mesActivo, setMesActivo] = useState<9 | 10 | 11>(11);
  const [incidenciaFormId, setIncidenciaFormId] = useState<string | null>(null);
  const [motivoForm, setMotivoForm] = useState<string>(MOTIVOS_JUSTIFICACION[0]);
  const [detalleForm, setDetalleForm] = useState("");
  const [errorForm, setErrorForm] = useState("");

  const paramsConsulta = apoderadoId
    ? { mes: mesActivo, anio: 2026, apoderado_id: apoderadoId }
    : { mes: mesActivo, anio: 2026 };
  const queryKey =
    getObtenerAsistenciaMensualApiV1AsistenciaEstudiantesEstudianteIdGetQueryKey(
      estudianteId,
      paramsConsulta,
    );

  const consulta = useObtenerAsistenciaMensualApiV1AsistenciaEstudiantesEstudianteIdGet(
    estudianteId,
    paramsConsulta,
    {
      query: {
        enabled: Boolean(estudianteId),
      },
    },
  );
  const mutJustificacion =
    useEnviarJustificacionAsistenciaApiV1AsistenciaApoderadosApoderadoIdHijosEstudianteIdJustificacionesPost();

  if (!estudianteId) {
    return (
      <EstadoVacio
        titulo="Vista disponible solo para estudiantes"
        descripcion="Tu cuenta actual no tiene un perfil de estudiante asociado para consultar asistencia."
      />
    );
  }

  const datos = consulta.data?.status === 200 ? consulta.data.data : undefined;
  const metaMes =
    MESES_LECTIVOS_ASISTENCIA.find((m) => m.mes === mesActivo) ?? MESES_LECTIVOS_ASISTENCIA[2]!;
  const celdas = datos ? construirGrillaLaboral(datos.mes, datos.anio, datos.dias) : [];

  async function manejarEnviarJustificacion(incidenciaId: string) {
    const err = validarJustificacionTexto(motivoForm, detalleForm);
    if (err) {
      setErrorForm(err);
      return;
    }
    setErrorForm("");
    try {
      const resp = await mutJustificacion.mutateAsync({
        apoderadoId: apoderadoId ?? "",
        estudianteId,
        data: {
          incidencia_id: incidenciaId,
          motivo: motivoForm,
          detalle: detalleForm.trim(),
        },
      });
      if (resp.status !== 201) {
        setErrorForm("No se pudo enviar la justificación. Intenta nuevamente.");
        return;
      }
      queryClient.setQueryData(queryKey, (actual: { status: number; data: AsistenciaMesOut } | undefined) => {
        if (!actual || actual.status !== 200) return actual;
        return {
          ...actual,
          data: {
            ...actual.data,
            incidencias: actual.data.incidencias.map((item) =>
              item.id === incidenciaId
                ? { ...item, puede_justificar: false, justificacion_enviada: true }
                : item,
            ),
          },
        };
      });
      setIncidenciaFormId(null);
      setDetalleForm("");
      await queryClient.invalidateQueries({ queryKey });
    } catch {
      setErrorForm("No se pudo enviar la justificación. Intenta nuevamente.");
    }
  }

  const tarjetasKpi = datos
    ? [
        { etiqueta: "Asistencia", valor: datos.kpis.porcentaje },
        { etiqueta: "Presentes", valor: String(datos.kpis.presentes) },
        { etiqueta: "Tardanzas", valor: String(datos.kpis.tardanzas) },
        { etiqueta: "Faltas", valor: String(datos.kpis.faltas) },
        { etiqueta: "Justificadas", valor: String(datos.kpis.justificadas) },
      ]
    : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <BannerPortada
        titulo="Asistencia"
        subtitulo={
          datos
            ? `${hijoActivo ? `${hijoActivo.nombres} ${hijoActivo.apellidos} · ` : ""}Sección ${datos.seccion} · ${metaMes.nombreLargo} ${datos.anio}`
            : hijoActivo
              ? `${hijoActivo.nombres} ${hijoActivo.apellidos} · ${metaMes.nombreLargo} 2026`
              : `Consulta mensual · ${metaMes.nombreLargo} 2026`
        }
        acciones={
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }} role="group" aria-label="Seleccionar mes">
            {MESES_LECTIVOS_ASISTENCIA.map((m) => {
              const activo = m.mes === mesActivo;
              return (
                <button
                  key={m.mes}
                  type="button"
                  aria-pressed={activo}
                  onClick={() => setMesActivo(m.mes)}
                  style={{
                    height: 36,
                    padding: "0 14px",
                    borderRadius: "var(--radius-pill)",
                    border: activo ? "none" : "1px solid rgba(255,255,255,0.28)",
                    backgroundColor: activo ? "var(--color-primary)" : "rgba(255,255,255,0.1)",
                    color: "#FFFFFF",
                    fontFamily: "var(--font-button)",
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  {m.etiqueta}
                </button>
              );
            })}
          </div>
        }
      />

      {consulta.isLoading ? (
        <EstadoVacio
          titulo="Cargando asistencia..."
          descripcion="Estamos consultando tus registros del mes seleccionado."
        />
      ) : consulta.isError || !datos ? (
        <EstadoVacio
          titulo="No pudimos cargar tu asistencia"
          descripcion="Ocurrió un problema al consultar el registro mensual de asistencia."
          accion={
            <Boton variant="primary" onClick={() => void consulta.refetch()}>
              Reintentar
            </Boton>
          }
        />
      ) : (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: 12,
            }}
          >
            {tarjetasKpi.map((kpi) => (
              <Tarjeta key={kpi.etiqueta} style={{ padding: 16 }}>
                <div
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontWeight: 700,
                    fontSize: 24,
                    color: "var(--text-main)",
                  }}
                >
                  {kpi.valor}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                  {kpi.etiqueta}
                </div>
              </Tarjeta>
            ))}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
              gap: 20,
              alignItems: "start",
            }}
          >
            <CalendarioAsistencia
              tituloMes={`${metaMes.nombreLargo} ${datos.anio}`}
              celdas={celdas}
            />

            <Tarjeta>
              <h2
                style={{
                  fontFamily: "var(--font-heading)",
                  fontWeight: 600,
                  fontSize: 17,
                  margin: "0 0 14px",
                  color: "var(--text-main)",
                }}
              >
                Incidencias del mes
              </h2>

              {datos.incidencias.length === 0 ? (
                <p style={{ margin: 0, fontSize: 14, color: "var(--text-muted)", lineHeight: 1.5 }}>
                  No se registran tardanzas ni faltas en este mes.
                </p>
              ) : (
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                  }}
                >
                  {datos.incidencias.map((inc, idx) => {
                    const estilo = ESTILO_CODIGO_ASISTENCIA[inc.codigo];
                    const incidenciaKey = inc.id || `${inc.fecha}-${inc.codigo}-${idx}`;
                    const mostrarJustificar = puedeJustificarIncidencia(inc, esApoderado);
                    const formAbierto = esApoderado && incidenciaFormId === inc.id && inc.id !== "";

                    return (
                      <li
                        key={incidenciaKey}
                        style={{
                          padding: "12px 14px",
                          borderRadius: "var(--radius-md)",
                          border: "1px solid var(--border-card)",
                          display: "flex",
                          flexDirection: "column",
                          gap: 8,
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-main)" }}>
                            {inc.fecha} · {inc.nombre_estado}
                          </span>
                          <span
                            style={{
                              padding: "2px 8px",
                              borderRadius: "var(--radius-pill)",
                              backgroundColor: estilo.bg,
                              color: estilo.fg,
                              fontFamily: "var(--font-button)",
                              fontWeight: 700,
                              fontSize: 11,
                            }}
                          >
                            {inc.codigo}
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)", lineHeight: 1.45 }}>
                          {inc.detalle}
                        </p>

                        {esApoderado && inc.justificacion_enviada && (inc.codigo === "T" || inc.codigo === "F") ? (
                          <span
                            style={{
                              alignSelf: "flex-start",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              padding: "4px 10px",
                              borderRadius: "var(--radius-pill)",
                              backgroundColor: "var(--status-warning-bg)",
                              color: "var(--status-warning-fg)",
                              fontSize: 12,
                              fontWeight: 600,
                            }}
                          >
                            <Clock size={12} />
                            <span>Justificación enviada · en revisión</span>
                          </span>
                        ) : null}

                        {mostrarJustificar && !formAbierto ? (
                          <div style={{ display: "flex" }}>
                            <Boton
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setIncidenciaFormId(inc.id || incidenciaKey);
                                setMotivoForm(MOTIVOS_JUSTIFICACION[0]);
                                setDetalleForm("");
                                setErrorForm("");
                              }}
                            >
                              Justificar
                            </Boton>
                          </div>
                        ) : null}

                        {formAbierto ? (
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 10,
                              padding: 12,
                              borderRadius: "var(--radius-md)",
                              backgroundColor: "var(--bg-subtle)",
                            }}
                          >
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                              {MOTIVOS_JUSTIFICACION.map((motivo) => {
                                const activo = motivoForm === motivo;
                                return (
                                  <button
                                    key={motivo}
                                    type="button"
                                    aria-pressed={activo}
                                    onClick={() => setMotivoForm(motivo)}
                                    style={{
                                      height: 30,
                                      padding: "0 10px",
                                      borderRadius: "var(--radius-pill)",
                                      border: `1px solid ${activo ? "var(--color-primary)" : "var(--border-subtle)"}`,
                                      backgroundColor: activo ? "var(--color-primary-light)" : "var(--bg-surface)",
                                      color: activo ? "var(--color-primary)" : "var(--text-secondary)",
                                      fontSize: 12,
                                      fontWeight: 600,
                                      cursor: "pointer",
                                    }}
                                  >
                                    {motivo}
                                  </button>
                                );
                              })}
                            </div>
                            <textarea
                              aria-label="Motivo detallado de la justificación"
                              rows={3}
                              value={detalleForm}
                              onChange={(e) => setDetalleForm(e.target.value)}
                              placeholder="Explica brevemente el motivo. Si tienes certificado, entrégalo al auxiliar."
                              style={{
                                width: "100%",
                                borderRadius: "var(--radius-md)",
                                border: "1px solid var(--border-input)",
                                padding: 10,
                                fontFamily: "inherit",
                                fontSize: 13,
                                backgroundColor: "var(--bg-surface)",
                                color: "var(--text-main)",
                              }}
                            />
                            {errorForm ? (
                              <div role="alert" style={{ fontSize: 12, color: "var(--status-danger-fg)" }}>
                                {errorForm}
                              </div>
                            ) : null}
                            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, flexWrap: "wrap" }}>
                              <Boton
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setIncidenciaFormId(null);
                                  setErrorForm("");
                                }}
                              >
                                Cancelar
                              </Boton>
                              <Boton
                                type="button"
                                variant="primary"
                                size="sm"
                                disabled={mutJustificacion.isPending}
                                onClick={() => void manejarEnviarJustificacion(inc.id ?? "")}
                              >
                                {mutJustificacion.isPending ? "Enviando..." : "Enviar al auxiliar"}
                              </Boton>
                            </div>
                          </div>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              )}
            </Tarjeta>
          </div>
        </>
      )}
    </div>
  );
}
