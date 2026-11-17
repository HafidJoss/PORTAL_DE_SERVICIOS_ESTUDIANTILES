import type { CSSProperties, ReactNode } from "react";

interface TarjetaProps {
  children: ReactNode;
  style?: CSSProperties;
}

export function Tarjeta({ children, style }: TarjetaProps) {
  return (
    <section
      style={{
        backgroundColor: "var(--bg-surface)",
        border: "1px solid var(--border-card)",
        borderRadius: "var(--radius-xl)",
        boxShadow: "var(--shadow-card)",
        padding: 20,
        ...style,
      }}
    >
      {children}
    </section>
  );
}
