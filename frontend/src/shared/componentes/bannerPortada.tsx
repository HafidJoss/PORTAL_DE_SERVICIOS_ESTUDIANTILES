import type { ReactNode } from "react";

interface BannerPortadaProps {
  titulo: string;
  subtitulo?: string;
  acciones?: ReactNode;
}

export function BannerPortada({ titulo, subtitulo, acciones }: BannerPortadaProps) {
  return (
    <section
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: "var(--radius-xl)",
        backgroundColor: "var(--color-secondary-slate)",
        color: "#FFFFFF",
        padding: "24px 28px",
        marginBottom: 24,
        display: "flex",
        flexWrap: "wrap",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: 16,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          right: -40,
          top: -70,
          width: 220,
          height: 220,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.05)",
          pointerEvents: "none",
        }}
      />
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          right: 120,
          bottom: -100,
          width: 180,
          height: 180,
          borderRadius: "50%",
          background: "rgba(200,30,30,0.35)",
          pointerEvents: "none",
        }}
      />
      <div style={{ position: "relative", minWidth: 0, flex: "1 1 280px" }}>
        <h1
          style={{
            fontFamily: "var(--font-heading)",
            fontWeight: 700,
            fontSize: "clamp(22px, 3vw, 28px)",
            lineHeight: 1.2,
            margin: 0,
          }}
        >
          {titulo}
        </h1>
        {subtitulo ? (
          <p
            style={{
              fontSize: 14,
              color: "#CBD5E1",
              margin: "6px 0 0",
              lineHeight: 1.5,
            }}
          >
            {subtitulo}
          </p>
        ) : null}
      </div>
      {acciones ? (
        <div style={{ position: "relative", display: "flex", gap: 12, flexWrap: "wrap" }}>
          {acciones}
        </div>
      ) : null}
    </section>
  );
}
