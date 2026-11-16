import { Link } from "react-router-dom";

import type { DiaAgendaOut, NovedadItemOut } from "../../../api/generated/model";
import { Card } from "../../../shared/components/Card";
import { EstadoVacio } from "../../../shared/components/EstadoVacio";

interface VarianteAgendaSemanalProps {
  agendaSemanal: DiaAgendaOut[];
  novedades: NovedadItemOut[];
}

/** Variante C del inicio: agenda semanal de lunes a viernes y lo nuevo reciente. */
export function VarianteAgendaSemanal({
  agendaSemanal,
  novedades,
}: VarianteAgendaSemanalProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {agendaSemanal.length === 0 ? (
        <EstadoVacio
          titulo="Sin eventos en la agenda semanal"
          descripcion="Cuando se programen evaluaciones o entregas para esta semana las verás aquí."
        />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(175px, 1fr))",
            gap: 12,
          }}
        >
          {agendaSemanal.map((dia) => (
            <Card
              key={`${dia.etiqueta}-${dia.numero}`}
              style={{
                padding: 16,
                border: dia.es_hoy ? "2px solid var(--color-primary)" : "1px solid var(--border-card)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div>
                  <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>
                    {dia.etiqueta} {dia.numero}
                  </span>
                  {dia.es_hoy ? (
                    <span
                      style={{
                        marginLeft: 8,
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "2px 7px",
                        borderRadius: "var(--radius-pill)",
                        backgroundColor: "var(--color-primary-light)",
                        color: "var(--color-primary)",
                      }}
                    >
                      Hoy
                    </span>
                  ) : null}
                </div>
                {dia.asistencia ? (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: "var(--radius-pill)",
                      backgroundColor: "var(--bg-subtle)",
                      color: "var(--text-main)",
                    }}
                  >
                    {dia.asistencia}
                  </span>
                ) : null}
              </div>

              {dia.eventos.length === 0 ? (
                <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted)" }}>Sin actividades programadas.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {dia.eventos.map((ev, idx) => (
                    <Link
                      key={`${ev.titulo}-${idx}`}
                      to={ev.ruta_destino}
                      style={{
                        textDecoration: "none",
                        padding: "8px 10px",
                        borderRadius: "var(--radius-md)",
                        backgroundColor: "var(--bg-subtle)",
                        color: "var(--text-main)",
                        fontSize: 13,
                      }}
                    >
                      <div style={{ fontWeight: 600 }}>{ev.titulo}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{ev.tipo}</div>
                    </Link>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <Card>
        <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 16, margin: "0 0 10px" }}>
          Lo nuevo desde tu última visita
        </h2>
        {novedades.length === 0 ? (
          <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)" }}>
            No hay novedades visibles según tus preferencias actuales.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {novedades.slice(0, 4).map((nov) => (
              <Link
                key={nov.id}
                to={nov.ruta_destino}
                style={{
                  textDecoration: "none",
                  color: "inherit",
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 10,
                  fontSize: 13,
                }}
              >
                <span style={{ fontWeight: 500, color: "var(--text-main)" }}>
                  {nov.curso}: {nov.titulo}
                </span>
                <span style={{ color: "var(--text-muted)", flexShrink: 0 }}>{nov.hora}</span>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
