import { useState, type CSSProperties } from "react";
import { CalendarCheck, CheckCircle2, Inbox, Landmark } from "lucide-react";

import type { MensajeBandejaApoderadoOut } from "../../../api/generated/model";
import { AvatarIniciales } from "../../../shared/componentes/avatarIniciales";
import { Boton } from "../../../shared/componentes/boton";
import { EstadoVacio } from "../../../shared/componentes/estadoVacio";
import { Tarjeta } from "../../../shared/componentes/tarjeta";
import {
  contarNoLeidosApoderado,
  filtrarBandejaApoderado,
  type FiltroBandejaApoderado,
} from "../utilidades/filtrosBandejaApoderado";

interface BandejaApoderadoProps {
  mensajes: readonly MensajeBandejaApoderadoOut[];
  onAbrirMensaje: (mensaje: MensajeBandejaApoderadoOut) => void;
  onMarcarTodoLeido: () => void;
  onConfirmarLectura: (mensaje: MensajeBandejaApoderadoOut) => Promise<void>;
  confirmandoId?: string | null;
  onIrDestino?: (ruta: string) => void;
}

const ESTILO_ORIGEN: Record<
  MensajeBandejaApoderadoOut["origen"],
  { bg: string; fg: string }
> = {
  institucion: {
    bg: "var(--bg-subtle)",
    fg: "var(--text-main)",
  },
  asistencia: {
    bg: "var(--status-warning-bg)",
    fg: "var(--status-warning-fg)",
  },
  docente: {
    bg: "var(--color-primary-light)",
    fg: "var(--color-primary)",
  },
};

/** Bandeja familiar filtrable para comunicados institucionales, alertas de asistencia y docentes. */
export function BandejaApoderado({
  mensajes,
  onAbrirMensaje,
  onMarcarTodoLeido,
  onConfirmarLectura,
  confirmandoId = null,
  onIrDestino,
}: BandejaApoderadoProps) {
  const [filtro, setFiltro] = useState<FiltroBandejaApoderado>("todos");
  const [abiertoId, setAbiertoId] = useState<string | null>(null);
  const [errorConfirmacion, setErrorConfirmacion] = useState("");

  const sinLeer = contarNoLeidosApoderado(mensajes);
  const visibles = filtrarBandejaApoderado(mensajes, filtro);

  const chips: { id: FiltroBandejaApoderado; label: string }[] = [
    { id: "todos", label: "Todos" },
    { id: "no_leidos", label: `No leídos (${sinLeer})` },
    { id: "institucion", label: "Institución" },
    { id: "docentes", label: "Docentes" },
  ];

  async function manejarConfirmacion(mensaje: MensajeBandejaApoderadoOut) {
    setErrorConfirmacion("");
    try {
      await onConfirmarLectura(mensaje);
    } catch {
      setErrorConfirmacion("No se pudo confirmar la lectura. Intenta nuevamente.");
    }
  }

  return (
    <Tarjeta style={{ padding: 0, overflow: "hidden" }}>
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid var(--border-subtle)",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
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
            <Inbox size={18} />
            <span>Bandeja familiar</span>
          </h2>
          <button
            type="button"
            onClick={onMarcarTodoLeido}
            style={{
              border: "none",
              background: "none",
              color: "var(--color-primary)",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              padding: 0,
            }}
          >
            Marcar todo como leído
          </button>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {chips.map((c) => {
            const activo = filtro === c.id;
            const chipStyle: CSSProperties = {
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
            };
            return (
              <button
                key={c.id}
                type="button"
                aria-pressed={activo}
                onClick={() => setFiltro(c.id)}
                style={chipStyle}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {visibles.length === 0 ? (
        <div style={{ padding: 20 }}>
          <EstadoVacio
            titulo="No hay comunicados en esta vista."
            descripcion="Cambia el filtro superior para revisar otros mensajes."
          />
        </div>
      ) : (
        visibles.map((m) => {
          const abierto = abiertoId === m.id;
          const meta = ESTILO_ORIGEN[m.origen];
          const etiqueta = m.curso ? `${m.etiqueta} · ${m.curso}` : m.etiqueta;

          return (
            <div
              key={m.id}
              style={{
                borderBottom: "1px solid var(--border-subtle)",
                backgroundColor: abierto ? "var(--bg-subtle)" : "var(--bg-surface)",
              }}
            >
              <button
                type="button"
                aria-expanded={abierto}
                onClick={() => {
                  const proximo = abierto ? null : m.id;
                  setAbiertoId(proximo);
                  setErrorConfirmacion("");
                  if (!abierto && !m.leido) {
                    onAbrirMensaje(m);
                  }
                }}
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
                  color: "var(--text-main)",
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor: !m.leido ? "var(--color-primary)" : "transparent",
                    flexShrink: 0,
                    marginTop: 16,
                  }}
                />
                {m.origen === "docente" ? (
                  <AvatarIniciales
                    nombre={m.remitente}
                    iniciales={m.iniciales}
                    size={38}
                    inverted
                  />
                ) : (
                  <span
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: "50%",
                      backgroundColor: meta.bg,
                      color: meta.fg,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {m.origen === "asistencia" ? (
                      <CalendarCheck size={18} />
                    ) : (
                      <Landmark size={18} />
                    )}
                  </span>
                )}
                <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 14, fontWeight: m.leido ? 400 : 600 }}>
                      {m.remitente}
                    </span>
                    <span
                      style={{
                        height: 22,
                        padding: "0 9px",
                        borderRadius: "var(--radius-pill)",
                        backgroundColor: meta.bg,
                        color: meta.fg,
                        fontFamily: "var(--font-button)",
                        fontWeight: 600,
                        fontSize: 12,
                        display: "inline-flex",
                        alignItems: "center",
                      }}
                    >
                      {etiqueta}
                    </span>
                    <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--text-muted)" }}>
                      {m.fecha}
                    </span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: m.leido ? 400 : 600 }}>{m.asunto}</div>
                  {!abierto ? (
                    <div
                      style={{
                        fontSize: 13,
                        color: "var(--text-muted)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {m.cuerpo.replace(/\n/g, " ")}
                    </div>
                  ) : null}
                </div>
              </button>

              {abierto ? (
                <div
                  style={{
                    padding: "0 20px 18px 64px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      fontSize: 14,
                      lineHeight: 1.6,
                      color: "var(--text-secondary)",
                      whiteSpace: "pre-line",
                    }}
                  >
                    {m.cuerpo}
                  </div>

                  {errorConfirmacion ? (
                    <div role="alert" style={{ fontSize: 12, color: "var(--status-danger-fg)" }}>
                      {errorConfirmacion}
                    </div>
                  ) : null}

                  <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                    {m.requiere_confirmacion ? (
                      m.lectura_confirmada ? (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            fontSize: 13,
                            fontWeight: 600,
                            color: "var(--status-success-fg)",
                            backgroundColor: "var(--status-success-bg)",
                            padding: "6px 12px",
                            borderRadius: "var(--radius-pill)",
                          }}
                        >
                          <CheckCircle2 size={15} />
                          <span>Lectura confirmada · Dirección notificada</span>
                        </span>
                      ) : (
                        <Boton
                          type="button"
                          onClick={() => void manejarConfirmacion(m)}
                          disabled={confirmandoId === m.id}
                        >
                          {confirmandoId === m.id ? "Confirmando..." : "Confirmar lectura"}
                        </Boton>
                      )
                    ) : null}

                    {m.ruta_destino && onIrDestino ? (
                      <Boton
                        type="button"
                        variant="outline"
                        onClick={() => onIrDestino(m.ruta_destino!)}
                      >
                        Ir a la sección
                      </Boton>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          );
        })
      )}
    </Tarjeta>
  );
}
