import { Card } from "../../shared/components/Card";
import {
  ESTILO_CODIGO_ASISTENCIA,
  LEYENDA_ASISTENCIA,
  type CeldaCalendarioAsistencia,
} from "./calendarioMes";

interface CalendarioAsistenciaProps {
  tituloMes: string;
  celdas: CeldaCalendarioAsistencia[];
}

const CABECERA_DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie"];

/** Calendario semanal lunes a viernes de asistencia con leyenda de códigos. */
export function CalendarioAsistencia({ tituloMes, celdas }: CalendarioAsistenciaProps) {
  return (
    <Card>
      <h2
        style={{
          fontFamily: "var(--font-heading)",
          fontWeight: 600,
          fontSize: 17,
          margin: "0 0 14px",
          color: "var(--text-main)",
        }}
      >
        Calendario de asistencia · {tituloMes}
      </h2>

      <div
        role="grid"
        aria-label={`Calendario de asistencia de ${tituloMes}`}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
          gap: 8,
        }}
      >
        {CABECERA_DIAS.map((dia) => (
          <div
            key={dia}
            role="columnheader"
            style={{
              textAlign: "center",
              fontSize: 11,
              fontFamily: "var(--font-button)",
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              paddingBottom: 4,
            }}
          >
            {dia}
          </div>
        ))}

        {celdas.map((celda, indice) => {
          if (celda.dia === null) {
            return <div key={`hueco-${indice}`} aria-hidden="true" style={{ minHeight: 54 }} />;
          }
          const estilo = ESTILO_CODIGO_ASISTENCIA[celda.codigo];
          return (
            <div
              key={`dia-${celda.dia}`}
              role="gridcell"
              aria-label={`Día ${celda.dia}: ${celda.nombreEstado}`}
              style={{
                minHeight: 54,
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-card)",
                backgroundColor: estilo.bg,
                color: estilo.fg,
                padding: "6px 8px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 600, opacity: 0.85 }}>{celda.dia}</span>
              <span
                style={{
                  fontFamily: "var(--font-button)",
                  fontWeight: 700,
                  fontSize: 13,
                }}
              >
                {celda.codigo || "—"}
              </span>
            </div>
          );
        })}
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          marginTop: 16,
          paddingTop: 12,
          borderTop: "1px solid var(--border-card)",
        }}
      >
        {LEYENDA_ASISTENCIA.map((item) => (
          <div key={item.codigo} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span
              style={{
                minWidth: 26,
                height: 22,
                padding: "0 6px",
                borderRadius: "var(--radius-pill)",
                backgroundColor: item.bg,
                color: item.fg,
                fontFamily: "var(--font-button)",
                fontWeight: 700,
                fontSize: 11,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {item.codigo}
            </span>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{item.etiqueta}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
