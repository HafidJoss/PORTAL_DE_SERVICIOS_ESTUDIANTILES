import { useState } from "react";

import { useObtenerAsistenciaMensualApiV1AsistenciaEstudiantesEstudianteIdGet } from "../../../api/generated/asistencia/asistencia";
import type { UsuarioSesionOut } from "../../../api/generated/model";
import { BannerPortada } from "../../../shared/componentes/bannerPortada";
import { Boton } from "../../../shared/componentes/boton";
import { Tarjeta } from "../../../shared/componentes/tarjeta";
import { EstadoVacio } from "../../../shared/componentes/estadoVacio";
import { resolverEstudianteId } from "../../../shared/utilidades/sesion";
import { CalendarioAsistencia } from "../componentes/calendarioAsistencia";
import {
  ESTILO_CODIGO_ASISTENCIA,
  MESES_LECTIVOS_ASISTENCIA,
  construirGrillaLaboral,
} from "../utilidades/calendarioMes";

interface AsistenciaVistaProps {
  usuario: UsuarioSesionOut;
}

/** Vista Asistencia (/asistencia) en modo solo lectura para el estudiante. */
export function AsistenciaVista({ usuario }: AsistenciaVistaProps) {
  const estudianteId = resolverEstudianteId(usuario);
  const [mesActivo, setMesActivo] = useState<9 | 10 | 11>(11);

  const consulta = useObtenerAsistenciaMensualApiV1AsistenciaEstudiantesEstudianteIdGet(
    estudianteId,
    { mes: mesActivo, anio: 2026 },
    {
      query: {
        enabled: Boolean(estudianteId),
      },
    },
  );

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
            ? `Sección ${datos.seccion} · ${metaMes.nombreLargo} ${datos.anio}`
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
                    return (
                      <li
                        key={`${inc.fecha}-${inc.codigo}-${idx}`}
                        style={{
                          padding: "12px 14px",
                          borderRadius: "var(--radius-md)",
                          border: "1px solid var(--border-card)",
                          display: "flex",
                          flexDirection: "column",
                          gap: 4,
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
