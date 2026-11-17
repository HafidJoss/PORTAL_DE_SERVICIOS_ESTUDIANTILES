import { useState } from "react";

import { FormularioActivarCuenta } from "../componentes/formularioActivarCuenta";
import { FormularioIngreso } from "../componentes/formularioIngreso";

type TabAcceso = "ingresar" | "activar";

export function IngresoVista() {
  const [tab, setTab] = useState<TabAcceso>("ingresar");
  const [dniPrecargado, setDniPrecargado] = useState("");

  const titulo =
    tab === "ingresar" ? "Bienvenido al Portal Estudiantil" : "Activa tu cuenta";
  const subtitulo =
    tab === "ingresar"
      ? "Consulta tus calificativos, trabajos, asistencia y mensajes de tus docentes en un solo lugar."
      : "Usa el código de un solo uso que te entregó el colegio. Nadie más conocerá tu contraseña.";

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--color-secondary-slate)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 440,
          backgroundColor: "var(--bg-surface)",
          borderRadius: 24,
          overflow: "hidden",
          boxShadow: "0 30px 60px rgba(2, 6, 23, 0.45)",
        }}
      >
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            backgroundColor: "var(--color-secondary-slate)",
            color: "#FFFFFF",
            padding: "32px 28px 34px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              width: 76,
              height: 76,
              borderRadius: "50%",
              backgroundColor: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
            }}
          >
            <img
              src="/escudo.png"
              alt="Escudo G.U.E. Mariscal Cáceres"
              style={{ width: 52, height: 52, objectFit: "contain" }}
            />
          </div>
          <div>
            <h1
              style={{
                fontFamily: "var(--font-heading)",
                fontWeight: 700,
                fontSize: 24,
                lineHeight: 1.25,
                margin: 0,
              }}
            >
              {titulo}
            </h1>
            <p
              style={{
                fontSize: 13,
                lineHeight: 1.55,
                color: "#CBD5E1",
                margin: "8px auto 0",
                maxWidth: 320,
              }}
            >
              {subtitulo}
            </p>
          </div>
        </div>

        <div
          style={{
            padding: "24px 28px 28px",
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          <div
            role="tablist"
            aria-label="Opciones de acceso"
            style={{
              display: "flex",
              backgroundColor: "var(--bg-subtle)",
              borderRadius: "var(--radius-pill)",
              padding: 4,
              gap: 4,
            }}
          >
            <button
              type="button"
              role="tab"
              aria-selected={tab === "ingresar"}
              onClick={() => setTab("ingresar")}
              style={{
                flex: 1,
                height: 38,
                border: "none",
                borderRadius: "var(--radius-pill)",
                backgroundColor:
                  tab === "ingresar" ? "var(--bg-surface)" : "transparent",
                color:
                  tab === "ingresar"
                    ? "var(--color-primary)"
                    : "var(--text-muted)",
                fontFamily: "var(--font-button)",
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              Ingresar
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "activar"}
              onClick={() => setTab("activar")}
              style={{
                flex: 1,
                height: 38,
                border: "none",
                borderRadius: "var(--radius-pill)",
                backgroundColor:
                  tab === "activar" ? "var(--bg-surface)" : "transparent",
                color:
                  tab === "activar"
                    ? "var(--color-primary)"
                    : "var(--text-muted)",
                fontFamily: "var(--font-button)",
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              Activar cuenta
            </button>
          </div>

          {tab === "ingresar" ? (
            <FormularioIngreso dniInicial={dniPrecargado} />
          ) : (
            <FormularioActivarCuenta
              onCuentaActivada={(dni) => {
                setDniPrecargado(dni);
                setTab("ingresar");
              }}
            />
          )}
        </div>

        <div
          style={{
            padding: "14px 24px",
            borderTop: "1px solid var(--border-subtle)",
            backgroundColor: "var(--bg-canvas)",
            fontSize: 12,
            color: "var(--text-muted)",
            textAlign: "center",
          }}
        >
          G.U.E. «Mariscal Cáceres» · Ayacucho · Año escolar 2026
        </div>
      </div>
    </div>
  );
}
