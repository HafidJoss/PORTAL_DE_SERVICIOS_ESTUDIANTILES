import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  Check,
  Inbox,
  KeyRound,
  RotateCcw,
  School,
  UserCog,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  getObtenerTableroAdminApiV1InstitucionTableroAdminGetQueryKey,
  useAtenderSolicitudAdminApiV1InstitucionSolicitudesSolicitudIdAtenderPatch,
  useObtenerTableroAdminApiV1InstitucionTableroAdminGet,
} from "../../../api/generated/institucion/institucion";
import type { SolicitudAdminOutTipo, TrimestreAdminOutEstado } from "../../../api/generated/model";
import { BannerPortada } from "../../../shared/componentes/bannerPortada";
import { Tarjeta } from "../../../shared/componentes/tarjeta";
import { etapasProgresoTrimestre } from "../utilidades/reglasTrimestresAdmin";

type FiltroSolicitudes = "pendientes" | "atendidas" | "todas";

const ESTILO_TIPO: Record<SolicitudAdminOutTipo, { bg: string; fg: string }> = {
  Cuenta: { bg: "#F5F3FF", fg: "#6D28D9" },
  Asignación: { bg: "#F1F5F9", fg: "#1E293B" },
  Reapertura: { bg: "#FEF2F2", fg: "#C81E1E" },
  Catálogo: { bg: "#FFFBEB", fg: "#B45309" },
};

const ESTILO_ESTADO_TRIM: Record<TrimestreAdminOutEstado, { bg: string; fg: string }> = {
  Aperturado: { bg: "#F1F5F9", fg: "#475569" },
  "En Evaluación": { bg: "#FFFBEB", fg: "#B45309" },
  "Cierre Preliminar": { bg: "#EFF6FF", fg: "#1D4ED8" },
  Cerrado: { bg: "#ECFDF5", fg: "#047857" },
};

function iconoSolicitud(tipo: SolicitudAdminOutTipo) {
  if (tipo === "Cuenta") return KeyRound;
  if (tipo === "Asignación") return UserCog;
  if (tipo === "Reapertura") return RotateCcw;
  return School;
}

export function InicioAdminVista() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filtro, setFiltro] = useState<FiltroSolicitudes>("pendientes");
  const [abiertaId, setAbiertaId] = useState<string | null>(null);

  const consulta = useObtenerTableroAdminApiV1InstitucionTableroAdminGet();
  const atenderMutation =
    useAtenderSolicitudAdminApiV1InstitucionSolicitudesSolicitudIdAtenderPatch();

  if (consulta.isLoading) {
    return (
      <div style={{ padding: 24, color: "var(--text-muted)" }}>
        Cargando tablero administrativo...
      </div>
    );
  }

  if (consulta.isError || consulta.data?.status !== 200) {
    return (
      <Tarjeta>
        <p style={{ margin: 0, color: "var(--status-danger-fg)" }}>
          No se pudo cargar el tablero de administración.
        </p>
      </Tarjeta>
    );
  }

  const tablero = consulta.data.data;
  const solicitudesFiltradas = tablero.solicitudes.filter((s) => {
    if (filtro === "pendientes") return !s.atendida;
    if (filtro === "atendidas") return s.atendida;
    return true;
  });

  const etapas = etapasProgresoTrimestre(tablero.trimestre_actual.estado);
  const estiloEstado = ESTILO_ESTADO_TRIM[tablero.trimestre_actual.estado];

  async function manejarAtender(solicitudId: string) {
    await atenderMutation.mutateAsync({ solicitudId });
    await queryClient.invalidateQueries({
      queryKey: getObtenerTableroAdminApiV1InstitucionTableroAdminGetQueryKey(),
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <BannerPortada
        titulo={tablero.saludo}
        subtitulo={`${tablero.fecha_actual_texto} · Tienes ${tablero.kpis.solicitudes_pendientes} solicitudes por atender. ${tablero.periodo_texto}.`}
        acciones={
          <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
            <div style={{ lineHeight: 1.2 }}>
              <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 24 }}>
                {tablero.kpis.solicitudes_pendientes}
              </div>
              <div style={{ fontSize: 12, color: "#CBD5E1", marginTop: 2 }}>Por atender</div>
            </div>
            <div style={{ lineHeight: 1.2 }}>
              <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 24 }}>
                {tablero.kpis.cuentas_sin_activar}
              </div>
              <div style={{ fontSize: 12, color: "#CBD5E1", marginTop: 2 }}>
                Cuentas sin activar
              </div>
            </div>
            <div style={{ lineHeight: 1.2 }}>
              <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 24 }}>
                {tablero.kpis.secciones_con_cierre}/{tablero.kpis.total_secciones_seguimiento}
              </div>
              <div style={{ fontSize: 12, color: "#CBD5E1", marginTop: 2 }}>
                Secciones con cierre
              </div>
            </div>
          </div>
        }
      />

      <div style={{ display: "flex", flexWrap: "wrap", gap: 20, alignItems: "flex-start" }}>
        <section
          style={{
            flex: "999 1 480px",
            minWidth: 0,
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-card)",
            borderRadius: "var(--radius-xl)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid var(--border-subtle)",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-heading)",
                fontWeight: 600,
                fontSize: 18,
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <Inbox size={20} />
              Bandeja de solicitudes
            </h2>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {(
                [
                  ["pendientes", `Por atender (${tablero.kpis.solicitudes_pendientes})`],
                  ["atendidas", "Atendidas"],
                  ["todas", "Todas"],
                ] as const
              ).map(([id, label]) => {
                const activo = filtro === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setFiltro(id)}
                    style={{
                      height: 34,
                      padding: "0 14px",
                      borderRadius: "var(--radius-pill)",
                      border: `1px solid ${activo ? "var(--color-primary)" : "var(--border-subtle)"}`,
                      backgroundColor: activo ? "var(--color-primary-light)" : "var(--bg-surface)",
                      color: activo ? "var(--color-primary)" : "var(--text-secondary)",
                      fontFamily: "var(--font-button)",
                      fontWeight: 600,
                      fontSize: 13,
                      cursor: "pointer",
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {solicitudesFiltradas.length === 0 ? (
            <div style={{ padding: "32px 20px", textAlign: "center", color: "var(--text-muted)" }}>
              No hay solicitudes en esta vista.
            </div>
          ) : (
            solicitudesFiltradas.map((sol) => {
              const abierta = abiertaId === sol.id;
              const estilo = ESTILO_TIPO[sol.tipo];
              const Icono = iconoSolicitud(sol.tipo);
              return (
                <div
                  key={sol.id}
                  style={{
                    borderBottom: "1px solid var(--border-subtle)",
                    backgroundColor: abierta ? "var(--bg-subtle)" : "var(--bg-surface)",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setAbiertaId(abierta ? null : sol.id)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 14,
                      padding: "14px 20px",
                      border: "none",
                      background: "transparent",
                      textAlign: "left",
                      cursor: "pointer",
                    }}
                  >
                    <span
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        backgroundColor: estilo.bg,
                        color: estilo.fg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Icono size={18} />
                    </span>
                    <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 14, fontWeight: sol.no_leida ? 600 : 500, color: "var(--text-main)" }}>
                          {sol.remitente}
                        </span>
                        <span
                          style={{
                            height: 22,
                            padding: "0 9px",
                            borderRadius: "var(--radius-pill)",
                            backgroundColor: estilo.bg,
                            color: estilo.fg,
                            fontFamily: "var(--font-button)",
                            fontWeight: 600,
                            fontSize: 12,
                            display: "inline-flex",
                            alignItems: "center",
                          }}
                        >
                          {sol.tipo}
                        </span>
                        <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--text-muted)" }}>
                          {sol.fecha}
                        </span>
                      </span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-main)" }}>
                        {sol.asunto}
                      </span>
                      {!abierta ? (
                        <span
                          style={{
                            fontSize: 13,
                            color: "var(--text-muted)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {sol.detalle}
                        </span>
                      ) : null}
                    </span>
                  </button>

                  {abierta ? (
                    <div
                      style={{
                        padding: "0 20px 18px 74px",
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                      }}
                    >
                      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "var(--text-secondary)" }}>
                        {sol.detalle}
                      </p>
                      <div
                        style={{
                          display: "flex",
                          gap: 10,
                          flexWrap: "wrap",
                          alignItems: "center",
                          justifyContent: "flex-end",
                        }}
                      >
                        {sol.atendida ? (
                          <span
                            style={{
                              marginRight: "auto",
                              height: 28,
                              padding: "0 10px",
                              borderRadius: "var(--radius-pill)",
                              backgroundColor: "#ECFDF5",
                              color: "#047857",
                              fontFamily: "var(--font-button)",
                              fontWeight: 600,
                              fontSize: 12,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 5,
                            }}
                          >
                            <Check size={14} />
                            Atendida
                          </span>
                        ) : (
                          <button
                            type="button"
                            disabled={atenderMutation.isPending}
                            onClick={() => void manejarAtender(sol.id)}
                            style={{
                              marginRight: "auto",
                              height: 36,
                              padding: "0 14px",
                              border: "none",
                              background: "transparent",
                              color: "var(--text-secondary)",
                              fontFamily: "var(--font-button)",
                              fontWeight: 600,
                              fontSize: 13,
                              cursor: "pointer",
                            }}
                          >
                            Marcar como atendida
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => navigate(sol.ruta_destino)}
                          style={{
                            height: 36,
                            padding: "0 16px",
                            border: "none",
                            borderRadius: "var(--radius-pill)",
                            backgroundColor: "var(--color-primary)",
                            color: "#FFFFFF",
                            fontFamily: "var(--font-button)",
                            fontWeight: 600,
                            fontSize: 13,
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <ArrowRight size={14} />
                          {sol.etiqueta_accion}
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })
          )}
        </section>

        <aside style={{ flex: "1 1 300px", minWidth: 0, display: "flex", flexDirection: "column", gap: 16 }}>
          <Tarjeta style={{ padding: 0, overflow: "hidden" }}>
            <div
              style={{
                padding: "14px 18px",
                borderBottom: "1px solid var(--border-subtle)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h3 style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: 15 }}>
                {tablero.trimestre_actual.nombre}
              </h3>
              <button
                type="button"
                onClick={() => navigate("/trimestres")}
                style={{
                  border: "none",
                  background: "none",
                  color: "var(--color-primary)",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Gestionar
              </button>
            </div>
            <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", gap: 4 }}>
                {etapas.map((etapa) => (
                  <span
                    key={etapa.estado}
                    title={etapa.etiqueta}
                    style={{
                      flex: 1,
                      height: 8,
                      borderRadius: "var(--radius-pill)",
                      backgroundColor: etapa.actual
                        ? "var(--color-primary)"
                        : etapa.completada
                          ? "#1E293B"
                          : "#E2E8F0",
                    }}
                  />
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    height: 22,
                    padding: "0 9px",
                    borderRadius: "var(--radius-pill)",
                    backgroundColor: estiloEstado.bg,
                    color: estiloEstado.fg,
                    fontFamily: "var(--font-button)",
                    fontWeight: 600,
                    fontSize: 12,
                    display: "inline-flex",
                    alignItems: "center",
                  }}
                >
                  {tablero.trimestre_actual.estado}
                </span>
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  {tablero.trimestre_actual.siguiente_hito}
                </span>
              </div>
            </div>
          </Tarjeta>

          <Tarjeta style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border-subtle)" }}>
              <h3 style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: 15 }}>
                Avance de cierre por sección
              </h3>
            </div>
            {tablero.avance_secciones.map((item) => (
              <div
                key={item.seccion}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "9px 18px",
                  borderBottom: "1px solid var(--border-subtle)",
                }}
              >
                <span style={{ width: 44, fontSize: 13, fontWeight: 600 }}>{item.seccion}</span>
                <span
                  style={{
                    flex: 1,
                    height: 6,
                    borderRadius: "var(--radius-pill)",
                    backgroundColor: "var(--bg-subtle)",
                    overflow: "hidden",
                    display: "block",
                  }}
                >
                  <span
                    style={{
                      display: "block",
                      height: 6,
                      width: `${item.porcentaje}%`,
                      borderRadius: "var(--radius-pill)",
                      backgroundColor:
                        item.porcentaje === 100
                          ? "#059669"
                          : item.porcentaje >= 60
                            ? "#1E293B"
                            : "#D97706",
                    }}
                  />
                </span>
                <span style={{ width: 38, textAlign: "right", fontSize: 12, color: "var(--text-muted)" }}>
                  {item.porcentaje}%
                </span>
              </div>
            ))}
            <div style={{ padding: "10px 18px", fontSize: 12, color: "var(--text-muted)" }}>
              Competencias con nivel confirmado por los docentes.
            </div>
          </Tarjeta>

          <Tarjeta style={{ padding: 0, overflow: "hidden" }}>
            <div
              style={{
                padding: "14px 18px",
                borderBottom: "1px solid var(--border-subtle)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h3 style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: 15 }}>Cuentas</h3>
              <button
                type="button"
                onClick={() => navigate("/cuentas")}
                style={{
                  border: "none",
                  background: "none",
                  color: "var(--color-primary)",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Ver cuentas
              </button>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: 8,
                padding: "14px 18px",
              }}
            >
              <div>
                <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 20, color: "#047857" }}>
                  {tablero.resumen_cuentas.activas}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Activas</div>
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 20, color: "#B45309" }}>
                  {tablero.resumen_cuentas.pendientes}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Pendientes</div>
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 20, color: "#991B1B" }}>
                  {tablero.resumen_cuentas.bloqueadas}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Bloqueadas</div>
              </div>
            </div>
          </Tarjeta>
        </aside>
      </div>
    </div>
  );
}
