import { useState, type CSSProperties } from "react";
import { CalendarCheck, Inbox, Landmark, Send } from "lucide-react";

import type { MensajeBandejaDocenteOut } from "../../../api/generated/model";
import { AvatarIniciales } from "../../../shared/componentes/avatarIniciales";
import { Boton } from "../../../shared/componentes/boton";
import { EstadoVacio } from "../../../shared/componentes/estadoVacio";
import { Tarjeta } from "../../../shared/componentes/tarjeta";
import {
  contarSinLeerBandeja,
  filtrarBandejaDocente,
  validarRespuestaBandeja,
  type FiltroBandejaDocente,
} from "../utilidades/filtrosBandejaDocente";

interface BandejaDocenteProps {
  mensajes: readonly MensajeBandejaDocenteOut[];
  onAbrirMensaje: (mensaje: MensajeBandejaDocenteOut) => void;
  onMarcarTodoLeido: () => void;
  onEnviarRespuesta: (mensaje: MensajeBandejaDocenteOut, texto: string) => Promise<void>;
  marcandoTodo?: boolean;
  enviandoRespuesta?: boolean;
  onIrSeccion?: (seccionId: string, destinoTab?: string) => void;
}

const ESTILO_ORIGEN: Record<
  MensajeBandejaDocenteOut["origen"],
  { bg: string; fg: string; label: string }
> = {
  institucion: {
    bg: "var(--bg-subtle)",
    fg: "var(--text-main)",
    label: "Institución",
  },
  asistencia: {
    bg: "var(--status-warning-bg)",
    fg: "var(--status-warning-fg)",
    label: "Asistencia",
  },
  estudiante: {
    bg: "var(--color-primary-light)",
    fg: "var(--color-primary)",
    label: "Estudiante",
  },
};

export function BandejaDocente({
  mensajes,
  onAbrirMensaje,
  onMarcarTodoLeido,
  onEnviarRespuesta,
  marcandoTodo = false,
  enviandoRespuesta = false,
  onIrSeccion,
}: BandejaDocenteProps) {
  const [filtro, setFiltro] = useState<FiltroBandejaDocente>("todos");
  const [abiertoId, setAbiertoId] = useState<string | null>(null);
  const [textoRespuesta, setTextoRespuesta] = useState("");
  const [errorRespuesta, setErrorRespuesta] = useState("");

  const sinLeer = contarSinLeerBandeja(mensajes);
  const visibles = filtrarBandejaDocente(mensajes, filtro);

  const chips: { id: FiltroBandejaDocente; label: string }[] = [
    { id: "todos", label: "Todos" },
    { id: "no_leidos", label: `No leídos (${sinLeer})` },
    { id: "institucion", label: "Institución" },
    { id: "estudiantes", label: "Estudiantes" },
  ];

  async function manejarEnvioRespuesta(mensaje: MensajeBandejaDocenteOut) {
    const err = validarRespuestaBandeja(mensaje, textoRespuesta);
    if (err) {
      setErrorRespuesta(err);
      return;
    }
    setErrorRespuesta("");
    await onEnviarRespuesta(mensaje, textoRespuesta.trim());
    setTextoRespuesta("");
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
            <span>Bandeja de entrada</span>
          </h2>
          <button
            type="button"
            onClick={onMarcarTodoLeido}
            disabled={marcandoTodo}
            style={{
              border: "none",
              background: "none",
              color: "var(--color-primary)",
              fontSize: 13,
              fontWeight: 600,
              cursor: marcandoTodo ? "wait" : "pointer",
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
            titulo="No hay mensajes en esta vista."
            descripcion="Cambia el filtro superior para revisar otros mensajes."
          />
        </div>
      ) : (
        visibles.map((m) => {
          const abierto = abiertoId === m.id;
          const meta = ESTILO_ORIGEN[m.origen];
          const etiqueta =
            m.origen === "estudiante" && m.seccion_nombre
              ? `Estudiante · ${m.seccion_nombre}`
              : meta.label;

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
                  setTextoRespuesta("");
                  setErrorRespuesta("");
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
                {m.origen === "estudiante" ? (
                  <AvatarIniciales nombre={m.remitente} size={38} inverted />
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

                  {(m.respuestas ?? []).map((r, idx) => (
                    <div
                      key={`${m.id}-r-${idx}`}
                      style={{
                        padding: "10px 12px",
                        borderRadius: "var(--radius-md)",
                        backgroundColor: "var(--bg-surface)",
                        border: "1px solid var(--border-subtle)",
                        fontSize: 13,
                      }}
                    >
                      <strong>Tu respuesta</strong> · {r.fecha}
                      <div>{r.texto}</div>
                    </div>
                  ))}

                  {m.puede_responder ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <textarea
                        value={textoRespuesta}
                        onChange={(e) => {
                          setTextoRespuesta(e.target.value);
                          setErrorRespuesta("");
                        }}
                        rows={2}
                        placeholder={`Escribe una respuesta para ${m.nombre_corto || m.remitente}`}
                        style={{
                          width: "100%",
                          border: "1px solid var(--border-input)",
                          borderRadius: "var(--radius-md)",
                          padding: "10px 12px",
                          fontSize: 13,
                          fontFamily: "var(--font-body)",
                          backgroundColor: "var(--bg-surface)",
                          color: "var(--text-main)",
                        }}
                      />
                      {errorRespuesta ? (
                        <div style={{ fontSize: 12, color: "var(--status-danger)" }}>
                          {errorRespuesta}
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      flexWrap: "wrap",
                      justifyContent: "flex-end",
                    }}
                  >
                    {m.seccion_id && onIrSeccion ? (
                      <Boton
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onIrSeccion(m.seccion_id!, m.destino_tab ?? undefined)}
                      >
                        Abrir {m.seccion_nombre || m.seccion_id}
                      </Boton>
                    ) : null}
                    {m.puede_responder ? (
                      <Boton
                        type="button"
                        size="sm"
                        disabled={enviandoRespuesta}
                        onClick={() => {
                          void manejarEnvioRespuesta(m);
                        }}
                      >
                        <Send size={14} />
                        Responder
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
