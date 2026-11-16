import type { CSSProperties } from "react";

interface AvatarInicialesProps {
  nombre: string;
  iniciales?: string;
  size?: number;
  inverted?: boolean;
}

export function extraerIniciales(nombre: string): string {
  const partes = nombre.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "PE";
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase();
}

export function AvatarIniciales({
  nombre,
  iniciales: inicialesExplicitas,
  size = 40,
  inverted = false,
}: AvatarInicialesProps) {
  const iniciales = inicialesExplicitas || extraerIniciales(nombre);
  const style: CSSProperties = {
    width: size,
    height: size,
    borderRadius: "50%",
    backgroundColor: inverted ? "var(--color-primary-light)" : "var(--color-primary)",
    color: inverted ? "var(--color-primary)" : "#FFFFFF",
    fontFamily: "var(--font-heading)",
    fontWeight: 700,
    fontSize: Math.max(12, Math.round(size * 0.34)),
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    userSelect: "none",
  };

  return (
    <span role="img" aria-label={`Avatar de ${nombre}`} style={style}>
      {iniciales}
    </span>
  );
}
