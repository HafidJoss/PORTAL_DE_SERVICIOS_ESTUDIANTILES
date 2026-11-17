import { useState, type CSSProperties, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Eye, EyeOff, IdCard, Info, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  getObtenerSesionApiV1IdentidadSesionGetQueryKey,
  useIniciarSesionApiV1IdentidadLoginPost,
} from "../../../api/generated/identidad/identidad";
import { ProblemDetailError } from "../../../api/clienteHttp";
import {
  guardarDniRecordado,
  leerDniRecordado,
} from "../utilidades/preferenciasIdentidad";
import { normalizarDni, validarLogin } from "../utilidades/validaciones";

const INPUT_STYLE: CSSProperties = {
  width: "100%",
  height: 48,
  border: "1.5px solid var(--border-subtle)",
  borderRadius: "var(--radius-pill)",
  backgroundColor: "var(--bg-canvas)",
  padding: "0 46px",
  fontSize: 14,
  fontFamily: "var(--font-body)",
  color: "var(--text-main)",
  outline: "none",
};

export function FormularioIngreso({ dniInicial = "" }: { dniInicial?: string }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [dni, setDni] = useState(() => dniInicial || leerDniRecordado());
  const [contrasena, setContrasena] = useState("");
  const [mostrarPass, setMostrarPass] = useState(false);
  const [recordar, setRecordar] = useState(true);
  const [mostrarAyuda, setMostrarAyuda] = useState(false);
  const [error, setError] = useState("");

  const loginMutation = useIniciarSesionApiV1IdentidadLoginPost();

  async function manejarEnvio(e: FormEvent) {
    e.preventDefault();
    const errorLocal = validarLogin(dni, contrasena);
    if (errorLocal) {
      setError(errorLocal);
      return;
    }

    setError("");
    try {
      const resp = await loginMutation.mutateAsync({
        data: { dni, contrasena, recordar },
      });
      guardarDniRecordado(dni, recordar);
      if (resp.status === 200) {
        queryClient.setQueryData(
          getObtenerSesionApiV1IdentidadSesionGetQueryKey(),
          resp,
        );
      }
      navigate("/inicio", { replace: true });
    } catch (err) {
      if (err instanceof ProblemDetailError) {
        setError(err.detail || err.title);
      } else {
        setError("No se pudo iniciar sesión. Intenta nuevamente.");
      }
    }
  }

  return (
    <form
      onSubmit={manejarEnvio}
      style={{ display: "flex", flexDirection: "column", gap: 14 }}
      noValidate
    >
      <div
        style={{
          fontFamily: "var(--font-button)",
          fontWeight: 600,
          fontSize: 12,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--text-secondary)",
          textAlign: "center",
        }}
      >
        Ingreso de estudiantes
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
          <IdCard size={18} />
        </span>
        <input
          aria-label="DNI"
          value={dni}
          onChange={(e) => {
            setDni(normalizarDni(e.target.value));
            setError("");
          }}
          inputMode="numeric"
          maxLength={8}
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
          <Lock size={18} />
        </span>
        <input
          aria-label="Contraseña"
          type={mostrarPass ? "text" : "password"}
          value={contrasena}
          onChange={(e) => {
            setContrasena(e.target.value);
            setError("");
          }}
          placeholder="Contraseña"
          style={INPUT_STYLE}
        />
        <button
          type="button"
          onClick={() => setMostrarPass((v) => !v)}
          aria-label="Mostrar contraseña"
          style={{
            position: "absolute",
            right: 8,
            width: 36,
            height: 36,
            border: "none",
            borderRadius: "50%",
            background: "transparent",
            color: "var(--text-muted)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          {mostrarPass ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
          padding: "0 6px",
        }}
      >
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 13,
            color: "var(--text-secondary)",
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={recordar}
            onChange={(e) => setRecordar(e.target.checked)}
            style={{ width: 16, height: 16, margin: 0, accentColor: "var(--color-primary)" }}
          />
          Recordarme
        </label>
        <button
          type="button"
          onClick={() => setMostrarAyuda((v) => !v)}
          style={{
            border: "none",
            background: "none",
            padding: 0,
            fontSize: 13,
            color: "var(--text-main)",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          ¿Olvidaste tu contraseña?
        </button>
      </div>

      {mostrarAyuda ? (
        <div
          style={{
            backgroundColor: "var(--bg-canvas)",
            border: "1px solid var(--border-subtle)",
            borderRadius: 16,
            padding: "12px 16px",
            fontSize: 13,
            lineHeight: 1.5,
            color: "var(--text-secondary)",
            display: "flex",
            gap: 10,
          }}
        >
          <Info size={16} style={{ flexShrink: 0, marginTop: 2 }} />
          <span>
            Solo el Administrador del colegio puede restablecerla. Acércate a
            Secretaría con tu DNI.
          </span>
        </div>
      ) : null}

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
        disabled={loginMutation.isPending}
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
          cursor: loginMutation.isPending ? "wait" : "pointer",
        }}
      >
        {loginMutation.isPending ? "Ingresando..." : "Ingresar"}
      </button>
    </form>
  );
}
