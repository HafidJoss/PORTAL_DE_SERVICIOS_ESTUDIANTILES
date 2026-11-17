import { useState, type FormEvent } from "react";

import type {
  CompetenciaCatalogoOut,
  SesionClaseCreateIn,
} from "../../../api/generated/model";
import type { CodigoCompetencia } from "../utilidades/calculoMediana";
import { Boton } from "../../../shared/componentes/boton";
import { Tarjeta } from "../../../shared/componentes/tarjeta";

interface FormularioNuevaClaseProps {
  competencias: readonly CompetenciaCatalogoOut[];
  onCrearClase: (datos: SesionClaseCreateIn) => Promise<void> | void;
  onCancelar?: () => void;
  guardando?: boolean;
}

const CRITERIOS_DEFECTO = [
  "Identifica los datos del problema",
  "Traduce las condiciones a una expresión",
  "Aplica el procedimiento correctamente",
  "Verifica y justifica su resultado",
];

export function FormularioNuevaClase({
  competencias,
  onCrearClase,
  onCancelar,
  guardando = false,
}: FormularioNuevaClaseProps) {
  const [fecha, setFecha] = useState("2026-11-12");
  const [competencia, setCompetencia] = useState<CodigoCompetencia>(
    competencias[0]?.codigo ?? "C2",
  );
  const [capacidadIdx, setCapacidadIdx] = useState(0);
  const [tema, setTema] = useState("");
  const [evidencia, setEvidencia] = useState("");
  const [criterios, setCriterios] = useState<string[]>([...CRITERIOS_DEFECTO]);
  const [error, setError] = useState("");

  const compActiva = competencias.find((c) => c.codigo === competencia) ?? competencias[0];

  async function manejarEnvio(evento: FormEvent) {
    evento.preventDefault();
    if (tema.trim().length < 3) {
      setError("El tema de la clase debe tener al menos 3 caracteres.");
      return;
    }
    const limpios = criterios.map((c) => c.trim());
    if (limpios.length !== 4 || limpios.some((c) => c.length === 0)) {
      setError("Completa los cuatro criterios de evaluación (K1..K4).");
      return;
    }
    setError("");
    await onCrearClase({
      fecha,
      competencia,
      capacidad_idx: capacidadIdx,
      tema: tema.trim(),
      evidencia: evidencia.trim(),
      criterios: limpios,
    });
  }

  return (
    <Tarjeta>
      <form onSubmit={manejarEnvio} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <h3 style={{ margin: 0, fontSize: 17, fontFamily: "var(--font-heading)" }}>
          Nueva sesión de clase
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
            gap: 12,
          }}
        >
          <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13 }}>
            <span>Fecha</span>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              style={{
                height: 38,
                padding: "0 10px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-input)",
              }}
            />
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13 }}>
            <span>Competencia</span>
            <select
              value={competencia}
              onChange={(e) => {
                setCompetencia(e.target.value as CodigoCompetencia);
                setCapacidadIdx(0);
              }}
              style={{
                height: 38,
                padding: "0 10px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-input)",
              }}
            >
              {competencias.map((c) => (
                <option key={c.codigo} value={c.codigo}>
                  {c.codigo} · {c.nombre}
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13 }}>
            <span>Capacidad</span>
            <select
              value={capacidadIdx}
              onChange={(e) => setCapacidadIdx(Number(e.target.value))}
              style={{
                height: 38,
                padding: "0 10px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-input)",
              }}
            >
              {(compActiva?.capacidades ?? []).map((cap, idx) => (
                <option key={cap} value={idx}>
                  {cap}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 12,
          }}
        >
          <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13 }}>
            <span>Tema de la clase</span>
            <input
              type="text"
              placeholder="Ej. Ecuaciones de primer grado"
              value={tema}
              onChange={(e) => setTema(e.target.value)}
              style={{
                height: 38,
                padding: "0 10px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-input)",
              }}
            />
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13 }}>
            <span>Evidencia de aprendizaje</span>
            <input
              type="text"
              placeholder="Ej. Resolución de problemas en cuaderno"
              value={evidencia}
              onChange={(e) => setEvidencia(e.target.value)}
              style={{
                height: 38,
                padding: "0 10px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-input)",
              }}
            />
          </label>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 10,
          }}
        >
          {criterios.map((crit, idx) => (
            <label
              key={idx}
              style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12 }}
            >
              <span>Criterio K{idx + 1}</span>
              <input
                type="text"
                value={crit}
                onChange={(e) =>
                  setCriterios((prev) => prev.map((v, i) => (i === idx ? e.target.value : v)))
                }
                style={{
                  height: 36,
                  padding: "0 10px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-input)",
                }}
              />
            </label>
          ))}
        </div>

        {error ? (
          <div role="alert" style={{ color: "var(--status-danger)", fontSize: 13 }}>
            {error}
          </div>
        ) : null}

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
          {onCancelar ? (
            <Boton type="button" variant="outline" onClick={onCancelar}>
              Cancelar
            </Boton>
          ) : null}
          <Boton type="submit" disabled={guardando}>
            Crear clase
          </Boton>
        </div>
      </form>
    </Tarjeta>
  );
}
