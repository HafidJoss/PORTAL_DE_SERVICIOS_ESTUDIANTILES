import { useState } from "react";
import { Download } from "lucide-react";

import {
  getExportarEventosBitacoraCsvApiV1AuditoriaEventosExportarGetUrl,
  useListarEventosBitacoraApiV1AuditoriaEventosGet,
} from "../../../api/generated/auditoria/auditoria";
import { BannerPortada } from "../../../shared/componentes/bannerPortada";

const TIPOS_EVENTO = [
  "Todos",
  "Calificativo",
  "Nivel",
  "Estado",
  "Libreta",
  "Reapertura",
  "Cuenta",
  "Asignación",
  "Seguridad",
];

const ESTILO_TIPO: Record<string, { bg: string; fg: string }> = {
  Sesión: { bg: "#F1F5F9", fg: "#475569" },
  Calificativo: { bg: "#ECFDF5", fg: "#047857" },
  Nivel: { bg: "#ECFDF5", fg: "#047857" },
  Cuenta: { bg: "#F5F3FF", fg: "#6D28D9" },
  Seguridad: { bg: "#FEF2F2", fg: "#991B1B" },
  Libreta: { bg: "#EFF6FF", fg: "#1D4ED8" },
  Estado: { bg: "#FFFBEB", fg: "#B45309" },
  Reapertura: { bg: "#FEF2F2", fg: "#C81E1E" },
  Asignación: { bg: "#F1F5F9", fg: "#1E293B" },
};

export function BitacoraAdminVista() {
  const [tipo, setTipo] = useState("Todos");
  const [descargando, setDescargando] = useState(false);

  const consulta = useListarEventosBitacoraApiV1AuditoriaEventosGet({ tipo });
  const datos = consulta.data?.status === 200 ? consulta.data.data : null;

  async function manejarExportarCsv() {
    setDescargando(true);
    try {
      const rutaRel = getExportarEventosBitacoraCsvApiV1AuditoriaEventosExportarGetUrl({ tipo });
      const origen =
        typeof window !== "undefined" && window.location?.origin?.startsWith("http")
          ? window.location.origin
          : "";
      const url = rutaRel.startsWith("/") && origen ? `${origen}${rutaRel}` : rutaRel;
      const resp = await fetch(url, { credentials: "include" });
      if (!resp.ok) return;
      const texto = await resp.text();
      const blob = new Blob([texto], { type: "text/csv;charset=utf-8" });
      const objectUrl = URL.createObjectURL(blob);
      const enlace = document.createElement("a");
      enlace.href = objectUrl;
      enlace.download = "Bitacora_2026.csv";
      document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();
      URL.revokeObjectURL(objectUrl);
    } finally {
      setDescargando(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <BannerPortada
        titulo="Bitácora de auditoría"
        subtitulo="Registro inalterable de eventos críticos: calificativos, niveles, estados, libretas, reaperturas y cuentas."
        acciones={
          <div style={{ lineHeight: 1.2 }}>
            <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 24 }}>
              {datos?.total ?? 0}
            </div>
            <div style={{ fontSize: 12, color: "#CBD5E1" }}>Eventos</div>
          </div>
        }
      />

      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {TIPOS_EVENTO.map((t) => {
            const on = tipo === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setTipo(t)}
                style={{
                  height: 34,
                  padding: "0 14px",
                  borderRadius: "var(--radius-pill)",
                  border: `1px solid ${on ? "var(--color-primary)" : "var(--border-subtle)"}`,
                  backgroundColor: on ? "var(--color-primary-light)" : "var(--bg-surface)",
                  color: on ? "var(--color-primary)" : "var(--text-secondary)",
                  fontFamily: "var(--font-button)",
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                {t}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          disabled={descargando}
          onClick={() => void manejarExportarCsv()}
          style={{
            height: 38,
            padding: "0 16px",
            borderRadius: "var(--radius-pill)",
            border: "1px solid var(--color-primary)",
            backgroundColor: "var(--bg-surface)",
            color: "var(--color-primary)",
            fontFamily: "var(--font-button)",
            fontWeight: 600,
            fontSize: 13,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Download size={15} />
          Exportar CSV
        </button>
      </div>

      <section
        style={{
          backgroundColor: "var(--bg-surface)",
          border: "1px solid var(--border-card)",
          borderRadius: "var(--radius-xl)",
          overflowX: "auto",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 820 }}>
          <thead>
            <tr style={{ backgroundColor: "var(--bg-subtle)", textAlign: "left" }}>
              <th style={{ padding: "10px 14px", fontSize: 11 }}>Fecha y hora</th>
              <th style={{ padding: "10px 14px", fontSize: 11 }}>Usuario</th>
              <th style={{ padding: "10px 14px", fontSize: 11 }}>Evento</th>
              <th style={{ padding: "10px 14px", fontSize: 11 }}>Entidad</th>
              <th style={{ padding: "10px 14px", fontSize: 11 }}>Antes → Después</th>
              <th style={{ padding: "10px 14px", fontSize: 11 }}>IP</th>
            </tr>
          </thead>
          <tbody>
            {datos?.eventos.map((ev) => {
              const st = ESTILO_TIPO[ev.tipo] ?? { bg: "#F1F5F9", fg: "#475569" };
              const reciente = ev.id.startsWith("n");
              return (
                <tr
                  key={ev.id}
                  style={{
                    borderBottom: "1px solid var(--border-subtle)",
                    backgroundColor: reciente ? "#FFFBEB" : "transparent",
                  }}
                >
                  <td style={{ padding: "10px 14px", whiteSpace: "nowrap" }}>
                    <div>{ev.fecha}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{ev.hora}</div>
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <div>{ev.usuario}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{ev.rol}</div>
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <span
                      style={{
                        height: 22,
                        padding: "0 9px",
                        borderRadius: "var(--radius-pill)",
                        backgroundColor: st.bg,
                        color: st.fg,
                        fontSize: 12,
                        fontWeight: 600,
                        display: "inline-flex",
                        alignItems: "center",
                      }}
                    >
                      {ev.tipo}
                    </span>
                  </td>
                  <td style={{ padding: "10px 14px" }}>{ev.entidad}</td>
                  <td style={{ padding: "10px 14px" }}>
                    <span style={{ color: "#991B1B", textDecoration: "line-through" }}>
                      {ev.antes}
                    </span>{" "}
                    → <span style={{ color: "#047857", fontWeight: 500 }}>{ev.despues}</span>
                  </td>
                  <td style={{ padding: "10px 14px", color: "var(--text-muted)", fontSize: 12 }}>
                    {ev.ip}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}
