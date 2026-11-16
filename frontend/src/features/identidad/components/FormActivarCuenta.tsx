import { useState, type CSSProperties, type FormEvent } from "react";
import {
  AlertCircle,
  CheckCircle2,
  IdCard,
  KeyRound,
  Lock,
  LockKeyhole,
} from "lucide-react";

import { useActivarCuentaApiV1IdentidadActivarPost } from "../../../api/generated/identidad/identidad";
import { ProblemDetailError } from "../../../api/http";
import {
  normalizarCodigoActivacion,
  normalizarDni,
  validarActivacion,
} from "../validaciones";
import { ModalPrivacidad } from "./ModalPrivacidad";

const INPUT_STYLE: CSSProperties = {
  width: "100%",
  height: 48,
  border: "1.5px solid var(--border-subtle)",
  borderRadius: "var(--radius-pill)",
  backgroundColor: "var(--bg-canvas)",
  padding: "0 20px 0 46px",
  fontSize: 14,
  fontFamily: "var(--font-body)",
  color: "var(--text-main)",
  outline: "none",
};

export function FormActivarCuenta({
  onCuentaActivada,
}: {
  onCuentaActivada: (dni: string) => void;
}) {
  const [dni, setDni] = useState("");
  const [codigo, setCodigo] = useState("");
  const [nuevaPass, setNuevaPass] = useState("");
  const [confirmarPass, setConfirmarPass] = useState("");
  const [aceptaPrivacidad, setAceptaPrivacidad] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [completada, setCompletada] = useState(false);
  const [error, setError] = useState("");

  const activarMutation = useActivarCuentaApiV1IdentidadActivarPost();

  async function manejarEnvio(e: FormEvent) {
    e.preventDefault();
    const errorLocal = validarActivacion(
      dni,
      codigo,
      nuevaPass,
      confirmarPass,
      aceptaPrivacidad,
    );
    if (errorLocal) {
      setError(errorLocal);
      return;
    }

    setError("");
    try {
      await activarMutation.mutateAsync({
        data: {
          dni,
          codigo_activacion: codigo,
          nueva_contrasena: nuevaPass,
          acepta_privacidad: aceptaPrivacidad,
        },
      });
      setCompletada(true);
    } catch (err) {
      if (err instanceof ProblemDetailError) {
        setError(err.detail || err.title);
      } else {
        setError("No se pudo activar la cuenta. Intenta nuevamente.");
      }
    }
  }

  if (completada) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: 12,
          padding: "8px 0",
        }}
      >
        <span
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            backgroundColor: "var(--status-success-bg)",
            color: "var(--status-success-fg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CheckCircle2 size={28} />
        </span>
        <div>
          <div
            style={{
              fontFamily: "var(--font-heading)",
              fontWeight: 600,
              fontSize: 17,
              color: "var(--text-main)",
            }}
          >
            Cuenta activada
          </div>
          <div
            style={{
              fontSize: 14,
              color: "var(--text-secondary)",
              marginTop: 4,
              lineHeight: 1.5,
            }}
          >
            Ya puedes ingresar con tu DNI y tu nueva contraseña.
          </div>
        </div>
        <button
          type="button"
          onClick={() => onCuentaActivada(dni)}
          style={{
            alignSelf: "center",
            minWidth: 180,
            height: 46,
            padding: "0 28px",
            border: "none",
            borderRadius: "var(--radius-pill)",
            backgroundColor: "var(--color-primary)",
            color: "#FFFFFF",
            fontFamily: "var(--font-button)",
            fontWeight: 600,
            fontSize: 15,
            cursor: "pointer",
          }}
        >
          Ir a ingresar
        </button>
      </div>
    );
  }

  return (
    <>
      <form
        onSubmit={manejarEnvio}
        style={{ display: "flex", flexDirection: "column", gap: 12 }}
        noValidate
      >
        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              left: 16,
              color: "var(--text-muted)",
              display: "flex",
              pointerEvents: "none",
            }}
          >
            <IdCard size={18} />
          </span>
          <input
            aria-label="DNI"
            value={dni}
            onChange={(e) => {
              setDni(normalizarDni(e.target.value));
              setError("");
            }}
            maxLength={8}
            inputMode="numeric"
            placeholder="DNI (8 dígitos)"
            style={INPUT_STYLE}
          />
        </div>

        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              left: 16,
              color: "var(--text-muted)",
              display: "flex",
              pointerEvents: "none",
            }}
          >
            <KeyRound size={18} />
          </span>
          <input
            aria-label="Código de activación"
            value={codigo}
            onChange={(e) => {
              setCodigo(normalizarCodigoActivacion(e.target.value));
              setError("");
            }}
            maxLength={6}
            placeholder="Código de activación"
            style={INPUT_STYLE}
          />
        </div>

        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              left: 16,
              color: "var(--text-muted)",
              display: "flex",
              pointerEvents: "none",
            }}
          >
            <Lock size={18} />
          </span>
          <input
            aria-label="Nueva contraseña"
            type="password"
            value={nuevaPass}
            onChange={(e) => {
              setNuevaPass(e.target.value);
              setError("");
            }}
            placeholder="Nueva contraseña (mín. 8)"
            style={INPUT_STYLE}
          />
        </div>

        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              left: 16,
              color: "var(--text-muted)",
              display: "flex",
              pointerEvents: "none",
            }}
          >
            <LockKeyhole size={18} />
          </span>
          <input
            aria-label="Confirmar contraseña"
            type="password"
            value={confirmarPass}
            onChange={(e) => {
              setConfirmarPass(e.target.value);
              setError("");
            }}
            placeholder="Confirmar contraseña"
            style={INPUT_STYLE}
          />
        </div>

        <label
          style={{
            display: "flex",
            gap: 10,
            alignItems: "flex-start",
            fontSize: 13,
            lineHeight: 1.5,
            color: "var(--text-secondary)",
            cursor: "pointer",
            padding: "0 6px",
          }}
        >
          <input
            type="checkbox"
            checked={aceptaPrivacidad}
            onChange={(e) => {
              setAceptaPrivacidad(e.target.checked);
              setError("");
            }}
            style={{
              width: 16,
              height: 16,
              margin: "2px 0 0",
              accentColor: "var(--color-primary)",
              flexShrink: 0,
            }}
          />
          <span>
            He leído y acepto el{" "}
            <button
              type="button"
              onClick={() => setModalAbierto(true)}
              style={{
                border: "none",
                background: "none",
                padding: 0,
                color: "var(--status-info)",
                textDecoration: "underline",
                fontSize: "inherit",
                cursor: "pointer",
              }}
            >
              Aviso de privacidad
            </button>
            .
          </span>
        </label>

        {error ? (
          <div
            role="alert"
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              color: "var(--status-danger)",
              textAlign: "center",
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={activarMutation.isPending}
          style={{
            alignSelf: "center",
            minWidth: 180,
            height: 46,
            padding: "0 28px",
            border: "none",
            borderRadius: "var(--radius-pill)",
            backgroundColor: "var(--color-primary)",
            color: "#FFFFFF",
            fontFamily: "var(--font-button)",
            fontWeight: 600,
            fontSize: 15,
            letterSpacing: "0.02em",
            cursor: activarMutation.isPending ? "wait" : "pointer",
          }}
        >
          {activarMutation.isPending ? "Activando..." : "Activar cuenta"}
        </button>
      </form>

      <ModalPrivacidad
        abierto={modalAbierto}
        onCerrar={() => setModalAbierto(false)}
      />
    </>
  );
}
