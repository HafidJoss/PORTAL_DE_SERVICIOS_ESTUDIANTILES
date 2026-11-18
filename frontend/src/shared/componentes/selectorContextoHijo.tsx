import { ChevronDown, Check } from "lucide-react";
import { useState } from "react";

import { AvatarIniciales } from "./avatarIniciales";

export interface OpcionSelectorContexto {
  id: string;
  etiqueta: string;
  detalle: string;
  iniciales?: string;
}

export interface SelectorContextoPortal {
  etiquetaAccion?: string;
  opciones: readonly OpcionSelectorContexto[];
  seleccionadoId: string;
  onSeleccionar: (id: string) => void;
}

interface SelectorContextoHijoProps {
  selector: SelectorContextoPortal;
  compacto?: boolean;
}

/** Selector contextual de menor vinculado para barra lateral (escritorio) o cabecera (móvil). */
export function SelectorContextoHijo({
  selector,
  compacto = false,
}: SelectorContextoHijoProps) {
  const [abierto, setAbierto] = useState(false);
  const activo =
    selector.opciones.find((op) => op.id === selector.seleccionadoId) ??
    selector.opciones[0];

  if (!activo) {
    return null;
  }

  const etiquetaAccion = selector.etiquetaAccion ?? "Cambiar de menor";
  const puedeCambiar = selector.opciones.length > 1;

  return (
    <div style={{ position: "relative" }}>
      <div
        style={{
          display: "flex",
          flexDirection: compacto ? "row" : "column",
          alignItems: compacto ? "center" : "stretch",
          gap: compacto ? 8 : 8,
          padding: compacto ? "4px 8px" : "10px 12px",
          borderRadius: "var(--radius-md)",
          backgroundColor: "var(--bg-subtle)",
          border: "1px solid var(--border-subtle)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
          <AvatarIniciales
            nombre={activo.etiqueta}
            iniciales={activo.iniciales}
            size={compacto ? 28 : 34}
          />
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontSize: compacto ? 12 : 13,
                fontWeight: 700,
                color: "var(--text-main)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {activo.etiqueta}
            </div>
            {!compacto ? (
              <div
                style={{
                  fontSize: 11,
                  color: "var(--text-muted)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {activo.detalle}
              </div>
            ) : null}
          </div>
        </div>

        {puedeCambiar ? (
          <button
            type="button"
            onClick={() => setAbierto((prev) => !prev)}
            aria-expanded={abierto}
            aria-haspopup="true"
            aria-label={etiquetaAccion}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              padding: compacto ? "5px 8px" : "6px 10px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-subtle)",
              backgroundColor: "var(--bg-surface)",
              color: "var(--color-primary)",
              fontFamily: "var(--font-button)",
              fontWeight: 600,
              fontSize: 11,
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <span>{compacto ? "Cambiar" : etiquetaAccion}</span>
            <ChevronDown size={13} />
          </button>
        ) : null}
      </div>

      {abierto && puedeCambiar ? (
        <div
          role="region"
          aria-label="Seleccionar menor vinculado"
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: compacto ? "auto" : 0,
            right: 0,
            minWidth: compacto ? 230 : "100%",
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
            boxShadow: "0 10px 24px rgba(15, 23, 42, 0.14)",
            padding: 6,
            display: "flex",
            flexDirection: "column",
            gap: 4,
            zIndex: 40,
          }}
        >
          {selector.opciones.map((op) => {
            const esActivo = op.id === activo.id;
            return (
              <button
                key={op.id}
                type="button"
                aria-pressed={esActivo}
                onClick={() => {
                  selector.onSeleccionar(op.id);
                  setAbierto(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  width: "100%",
                  textAlign: "left",
                  padding: "8px 10px",
                  borderRadius: "var(--radius-sm)",
                  border: "none",
                  backgroundColor: esActivo
                    ? "var(--color-primary-light)"
                    : "transparent",
                  color: "var(--text-main)",
                  cursor: "pointer",
                }}
              >
                <AvatarIniciales
                  nombre={op.etiqueta}
                  iniciales={op.iniciales}
                  size={28}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {op.etiqueta}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--text-muted)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {op.detalle}
                  </div>
                </div>
                {esActivo ? (
                  <Check size={14} color="var(--color-primary)" />
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
