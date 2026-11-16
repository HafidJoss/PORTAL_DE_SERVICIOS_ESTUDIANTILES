import type { ReactNode } from "react";

interface EstadoVacioProps {
  titulo: string;
  descripcion: string;
  accion?: ReactNode;
}

export function EstadoVacio({ titulo, descripcion, accion }: EstadoVacioProps) {
  return (
    <section
      style={{
        backgroundColor: "var(--bg-surface)",
        border: "1px solid var(--border-card)",
        borderRadius: "var(--radius-xl)",
        padding: "36px 24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: 10,
      }}
    >
      <h3
        style={{
          fontFamily: "var(--font-heading)",
          fontWeight: 600,
          fontSize: 16,
          margin: 0,
          color: "var(--text-main)",
        }}
      >
        {titulo}
      </h3>
      <p
        style={{
          margin: 0,
          fontSize: 14,
          color: "var(--text-muted)",
          maxWidth: 420,
          lineHeight: 1.5,
        }}
      >
        {descripcion}
      </p>
      {accion ? <div style={{ marginTop: 8 }}>{accion}</div> : null}
    </section>
  );
}
