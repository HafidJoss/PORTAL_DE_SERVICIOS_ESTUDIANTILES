import { useState } from "react";

import type { ActividadOut } from "../../../api/generated/model";
import { InsigniaNivel } from "../../../shared/componentes/insigniaNivel";
import { esSesionClase, etiquetaEstadoActividad } from "../utilidades/filtrosActividades";

interface TarjetaActividadProps {
  actividad: ActividadOut;
}

const BADGE_ESTADO: Record<ActividadOut["estado"], { bg: string; fg: string }> = {
  pendiente: { bg: "var(--status-warning-bg)", fg: "var(--status-warning-fg)" },
  vencido: { bg: "var(--status-danger-bg)", fg: "var(--status-danger)" },
  entregado: { bg: "var(--status-info-bg)", fg: "var(--status-info-fg)" },
  calificado: { bg: "var(--status-success-bg)", fg: "var(--status-success-fg)" },
};

/** Tarjeta expandible de una actividad o sesión de clase (Nota del día). */
export function TarjetaActividad({ actividad }: TarjetaActividadProps) {
  const [abierto, setAbierto] = useState(false);
  const sesionClase = esSesionClase(actividad);
  const badge = BADGE_ESTADO[actividad.estado];
  const etiquetaEstado =
    actividad.estado === "pendiente" && actividad.urgente
      ? "Vence pronto"
      : etiquetaEstadoActividad(actividad.estado);

  return (
    <article
      style={{
        backgroundColor: "var(--bg-surface)",
        border: "1px solid var(--border-card)",
        borderRadius: "var(--radius-xl)",
        boxShadow: "var(--shadow-card)",
        overflow: "hidden",
      }}
    >
      <button
        type="button"
        aria-expanded={abierto}
        onClick={() => setAbierto((prev) => !prev)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 14,
          padding: "16px 20px",
          border: "none",
          background: "transparent",
          textAlign: "left",
          cursor: "pointer",
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: "1 1 260px", minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
            <span
              style={{
                fontSize: 11,
                fontFamily: "var(--font-button)",
                fontWeight: 600,
                padding: "2px 8px",
                borderRadius: "var(--radius-pill)",
                backgroundColor: sesionClase ? "var(--color-primary-light)" : "var(--bg-subtle)",
                color: sesionClase ? "var(--color-primary)" : "var(--text-muted)",
              }}
            >
              {sesionClase ? "Nota del día" : "Trabajo"}
            </span>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{actividad.curso}</span>
          </div>
          <div
            style={{
              fontFamily: "var(--font-heading)",
              fontWeight: 600,
              fontSize: 15,
              color: "var(--text-main)",
              lineHeight: 1.35,
            }}
          >
            {actividad.titulo}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
            {sesionClase
              ? `Sesión: ${actividad.asignada}`
              : `Asignada: ${actividad.asignada}${actividad.fecha_entrega ? ` · Entrega: ${actividad.fecha_entrega}` : ""}`}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {actividad.nivel ? <InsigniaNivel nivel={actividad.nivel} /> : null}
          <span
            style={{
              height: 24,
              padding: "0 10px",
              borderRadius: "var(--radius-pill)",
              backgroundColor: badge.bg,
              color: badge.fg,
              fontFamily: "var(--font-button)",
              fontWeight: 600,
              fontSize: 12,
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            {etiquetaEstado}
          </span>
        </div>
      </button>

      {abierto ? (
        <div
          style={{
            padding: "14px 20px 18px",
            borderTop: "1px solid var(--border-card)",
            backgroundColor: "var(--bg-subtle)",
            display: "flex",
            flexDirection: "column",
            gap: 8,
            fontSize: 13,
            color: "var(--text-main)",
          }}
        >
          <div>
            <strong>Competencia:</strong> {actividad.competencia}
          </div>
          <div>
            <strong>Capacidad:</strong> {actividad.capacidad}
          </div>
          {!sesionClase && actividad.fecha_entrega ? (
            <div>
              <strong>Fecha límite: {actividad.fecha_entrega}</strong>
            </div>
          ) : null}
          {actividad.descripcion ? (
            <p style={{ margin: 0, lineHeight: 1.5, color: "var(--text-muted)" }}>
              {actividad.descripcion}
            </p>
          ) : null}
          {actividad.comentario ? (
            <div
              style={{
                padding: "10px 12px",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--bg-surface)",
                border: "1px solid var(--border-card)",
              }}
            >
              <strong>Observación docente:</strong> {actividad.comentario}
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
