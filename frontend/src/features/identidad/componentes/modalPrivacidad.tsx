import { useEffect } from "react";
import { ShieldCheck, X } from "lucide-react";

import { useObtenerAvisoPrivacidadApiV1IdentidadAvisoPrivacidadGet } from "../../../api/generated/identidad/identidad";
import { Boton } from "../../../shared/componentes/boton";

interface ModalPrivacidadProps {
  abierto: boolean;
  onCerrar: () => void;
}

export function ModalPrivacidad({ abierto, onCerrar }: ModalPrivacidadProps) {
  const consulta = useObtenerAvisoPrivacidadApiV1IdentidadAvisoPrivacidadGet({
    query: { enabled: abierto },
  });

  useEffect(() => {
    if (!abierto) return;
    const manejarEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCerrar();
    };
    window.addEventListener("keydown", manejarEscape);
    return () => window.removeEventListener("keydown", manejarEscape);
  }, [abierto, onCerrar]);

  if (!abierto) return null;

  const aviso = consulta.data?.status === 200 ? consulta.data.data : null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        zIndex: 50,
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-privacidad"
        style={{
          width: "100%",
          maxWidth: 520,
          backgroundColor: "var(--bg-surface)",
          color: "var(--text-main)",
          borderRadius: "var(--radius-xl)",
          border: "1px solid var(--border-subtle)",
          overflow: "hidden",
          boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
        }}
      >
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ShieldCheck size={20} color="var(--color-primary)" />
            <h2
              id="titulo-privacidad"
              style={{
                fontFamily: "var(--font-heading)",
                fontWeight: 700,
                fontSize: 16,
                margin: 0,
              }}
            >
              {aviso?.titulo ?? "Aviso de Privacidad"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              border: "none",
              background: "transparent",
              color: "var(--text-muted)",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: 20, fontSize: 14, lineHeight: 1.6, color: "var(--text-secondary)" }}>
          {consulta.isLoading ? (
            <p style={{ margin: 0 }}>Cargando aviso institucional...</p>
          ) : consulta.isError ? (
            <p style={{ margin: 0, color: "var(--status-danger)" }}>
              No se pudo cargar el aviso de privacidad. Intenta nuevamente.
            </p>
          ) : (
            <>
              <p style={{ margin: 0 }}>{aviso?.contenido}</p>
              {aviso ? (
                <p style={{ margin: "12px 0 0", fontSize: 12, color: "var(--text-muted)" }}>
                  Versión {aviso.version} · Actualizado el {aviso.actualizado_el}
                </p>
              ) : null}
            </>
          )}
        </div>

        <div
          style={{
            padding: "12px 20px",
            borderTop: "1px solid var(--border-subtle)",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <Boton type="button" variant="primary" size="sm" onClick={onCerrar}>
            Entendido
          </Boton>
        </div>
      </div>
    </div>
  );
}
