import type { CSSProperties } from "react";

export type NivelLogro = "AD" | "A" | "B" | "C" | "—";

const ESTILOS_NIVEL: Record<
  NivelLogro,
  { bg: string; fg: string; nombre: string }
> = {
  AD: { bg: "var(--color-secondary-slate)", fg: "#FFFFFF", nombre: "Logro destacado" },
  A: { bg: "var(--status-success-bg)", fg: "var(--status-success-fg)", nombre: "Logro esperado" },
  B: { bg: "var(--status-warning-bg)", fg: "var(--status-warning-fg)", nombre: "En proceso" },
  C: { bg: "var(--status-danger-bg)", fg: "var(--status-danger)", nombre: "En inicio" },
  "—": { bg: "var(--bg-subtle)", fg: "var(--text-muted)", nombre: "Sin registro" },
};

interface BadgeNivelProps {
  nivel: NivelLogro;
  preliminar?: boolean;
}

export function BadgeNivel({ nivel, preliminar = false }: BadgeNivelProps) {
  const cfg = ESTILOS_NIVEL[nivel] ?? ESTILOS_NIVEL["—"];
  const style: CSSProperties = {
    minWidth: 34,
    height: 26,
    padding: "0 8px",
    borderRadius: "var(--radius-pill)",
    backgroundColor: cfg.bg,
    color: cfg.fg,
    border: preliminar && nivel !== "—" ? `1px dashed ${cfg.fg}` : "none",
    fontFamily: "var(--font-button)",
    fontWeight: 600,
    fontSize: 13,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  };

  return (
    <span title={cfg.nombre} aria-label={`${nivel} - ${cfg.nombre}`} style={style}>
      {nivel}
    </span>
  );
}
