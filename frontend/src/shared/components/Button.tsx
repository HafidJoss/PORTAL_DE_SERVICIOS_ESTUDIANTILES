import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "lg" | "md" | "sm";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}

const HEIGHT_BY_SIZE: Record<ButtonSize, { height: number; padding: string }> = {
  lg: { height: 44, padding: "0 20px" },
  md: { height: 38, padding: "0 16px" },
  sm: { height: 32, padding: "0 12px" },
};

const STYLE_BY_VARIANT: Record<ButtonVariant, CSSProperties> = {
  primary: {
    backgroundColor: "var(--color-primary)",
    color: "#FFFFFF",
    border: "none",
  },
  secondary: {
    backgroundColor: "var(--color-secondary-slate)",
    color: "#FFFFFF",
    border: "none",
  },
  outline: {
    backgroundColor: "var(--bg-surface)",
    color: "var(--text-main)",
    border: "1px solid var(--border-input)",
  },
  ghost: {
    backgroundColor: "transparent",
    color: "var(--text-muted)",
    border: "none",
  },
};

export function Button({
  variant = "primary",
  size = "md",
  style,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  const dims = HEIGHT_BY_SIZE[size];
  const baseStyle: CSSProperties = {
    height: dims.height,
    padding: dims.padding,
    borderRadius: "var(--radius-md)",
    fontFamily: "var(--font-button)",
    fontWeight: 600,
    fontSize: 14,
    letterSpacing: "0.02em",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.6 : 1,
    ...STYLE_BY_VARIANT[variant],
    ...style,
  };

  return (
    <button disabled={disabled} style={baseStyle} {...rest}>
      {children}
    </button>
  );
}
