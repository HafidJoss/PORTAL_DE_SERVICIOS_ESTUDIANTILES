import { CheckCircle2, Sparkles } from "lucide-react";
import { useState } from "react";

import type {
  CompetenciaCatalogoOut,
  EstudianteSeccionOut,
  NivelGuardadoDocenteOut,
  SesionClaseOut,
} from "../../../api/generated/model";
import { Boton } from "../../../shared/componentes/boton";
import { InsigniaNivel } from "../../../shared/componentes/insigniaNivel";
import { Tarjeta } from "../../../shared/componentes/tarjeta";
import {
  calcularSugerenciaCompetencia,
  requiereConclusionDescriptiva,
  validarCierreCompetencia,
  type CodigoCompetencia,
  type NivelEducativoDocente,
} from "../utilidades/calculoMediana";

interface PanelCierreCompetenciasProps {
  competencias: readonly CompetenciaCatalogoOut[];
  estudiantes: readonly EstudianteSeccionOut[];
  sesiones: readonly SesionClaseOut[];
  cierres: readonly NivelGuardadoDocenteOut[];
  nivelEducativo: NivelEducativoDocente;
  onCambiarNivel: (comp: CodigoCompetencia, estIdx: number, nivel: string) => void;
  onCambiarConclusion: (comp: CodigoCompetencia, estIdx: number, texto: string) => void;
  onAplicarSugeridos: (comp: CodigoCompetencia, nivelesPorEst: Record<string, string>) => void;
  onConfirmarCompetencia: (comp: CodigoCompetencia) => Promise<void> | void;
  guardando?: boolean;
}

export function PanelCierreCompetencias({
  competencias,
  estudiantes,
  sesiones,
  cierres,
  nivelEducativo,
  onCambiarNivel,
  onCambiarConclusion,
  onAplicarSugeridos,
  onConfirmarCompetencia,
  guardando = false,
}: PanelCierreCompetenciasProps) {
  const [compActiva, setCompActiva] = useState<CodigoCompetencia>(
    competencias[0]?.codigo ?? "C1",
  );
  const [errorValidacion, setErrorValidacion] = useState("");
  const [avisoOk, setAvisoOk] = useState("");

  const compMeta = competencias.find((c) => c.codigo === compActiva) ?? competencias[0];
  const cierreActual = cierres.find((c) => c.competencia === compActiva) ?? {
    competencia: compActiva,
    confirmada: false,
    niveles_por_estudiante: {},
    conclusiones_por_estudiante: {},
  };

  function aplicarTodosSugeridos() {
    const sugeridos: Record<string, string> = {};
    for (const est of estudiantes) {
      const sug = calcularSugerenciaCompetencia(
        sesiones,
        String(est.indice),
        compActiva,
        "mediana",
      );
      if (sug) sugeridos[String(est.indice)] = sug;
    }
    onAplicarSugeridos(compActiva, sugeridos);
    setErrorValidacion("");
  }

  async function manejarConfirmar() {
    const nivelesMap = cierreActual.niveles_por_estudiante as Record<string, string>;
    const conclMap = cierreActual.conclusiones_por_estudiante as Record<string, string>;
    const filas = estudiantes.map((est) => ({
      estudiante_idx: est.indice,
      nivel: nivelesMap[String(est.indice)] ?? "",
      conclusion: conclMap[String(est.indice)] ?? "",
    }));

    const resultado = validarCierreCompetencia(filas, nivelEducativo);
    if (!resultado.valido) {
      const partes: string[] = [];
      if (resultado.sinNivel > 0) {
        partes.push(`${resultado.sinNivel} estudiante(s) sin nivel asignado`);
      }
      if (resultado.sinConclusion > 0) {
        partes.push(
          `${resultado.sinConclusion} estudiante(s) con conclusión descriptiva pendiente (mín. 10 caracteres)`,
        );
      }
      setErrorValidacion(`No se puede confirmar ${compActiva}: ${partes.join(" y ")}.`);
      setAvisoOk("");
      return;
    }

    setErrorValidacion("");
    await onConfirmarCompetencia(compActiva);
    setAvisoOk(`${compActiva} · Niveles y conclusiones confirmados.`);
  }

  const obligatoriosTexto =
    nivelEducativo === "Primaria" ? "niveles B o C" : "nivel C";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Tarjeta>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: 17, fontFamily: "var(--font-heading)" }}>
              Cierre trimestral de competencias
            </h3>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text-secondary)" }}>
              Sugerencia por mediana de capacidades (sin promedios numéricos). En {nivelEducativo}, la conclusión descriptiva es obligatoria para {obligatoriosTexto}.
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Boton type="button" variant="outline" size="sm" onClick={aplicarTodosSugeridos}>
              <Sparkles size={15} /> Usar sugeridos
            </Boton>
            <Boton type="button" size="sm" disabled={guardando} onClick={() => void manejarConfirmar()}>
              <CheckCircle2 size={15} /> Confirmar niveles
            </Boton>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {competencias.map((comp) => {
            const estado = cierres.find((c) => c.competencia === comp.codigo);
            const activa = comp.codigo === compActiva;
            return (
              <button
                key={comp.codigo}
                type="button"
                onClick={() => {
                  setCompActiva(comp.codigo);
                  setErrorValidacion("");
                  setAvisoOk("");
                }}
                style={{
                  height: 36,
                  padding: "0 14px",
                  borderRadius: "var(--radius-pill)",
                  border: `1px solid ${activa ? "var(--color-primary)" : "var(--border-subtle)"}`,
                  backgroundColor: activa ? "var(--color-primary-light)" : "var(--bg-surface)",
                  color: activa ? "var(--color-primary)" : "var(--text-secondary)",
                  fontFamily: "var(--font-button)",
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span>{comp.codigo}</span>
                {estado?.confirmada ? <span>✓</span> : null}
              </button>
            );
          })}
        </div>
      </Tarjeta>

      {errorValidacion ? (
        <div
          role="alert"
          style={{
            padding: "12px 16px",
            borderRadius: "var(--radius-md)",
            backgroundColor: "var(--status-danger-bg)",
            color: "var(--status-danger)",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {errorValidacion}
        </div>
      ) : null}

      {avisoOk ? (
        <div
          role="status"
          style={{
            padding: "12px 16px",
            borderRadius: "var(--radius-md)",
            backgroundColor: "var(--status-success-bg)",
            color: "var(--status-success-fg)",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {avisoOk}
        </div>
      ) : null}

      <Tarjeta style={{ padding: 0, overflow: "hidden" }}>
        <div
          style={{
            padding: "12px 18px",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <strong>
            {compMeta?.codigo} · {compMeta?.nombre}
          </strong>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: cierreActual.confirmada ? "var(--status-success-fg)" : "var(--text-muted)",
            }}
          >
            {cierreActual.confirmada ? "Competencia confirmada" : "Pendiente de confirmación"}
          </span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 680, fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)", textAlign: "left" }}>
                <th style={{ padding: "10px 16px" }}>Estudiante</th>
                <th style={{ padding: "10px 12px", textAlign: "center" }}>Sugerido</th>
                <th style={{ padding: "10px 12px", textAlign: "center" }}>Nivel final</th>
                <th style={{ padding: "10px 16px" }}>Conclusión descriptiva (RF22)</th>
              </tr>
            </thead>
            <tbody>
              {estudiantes.map((est) => {
                const key = String(est.indice);
                const sugerido = calcularSugerenciaCompetencia(
                  sesiones,
                  key,
                  compActiva,
                  "mediana",
                );
                const nivelesMap = cierreActual.niveles_por_estudiante as Record<string, string>;
                const conclMap = cierreActual.conclusiones_por_estudiante as Record<string, string>;
                const nivelFinal = nivelesMap[key] ?? "";
                const conclusion = conclMap[key] ?? "";
                const obligatoria = requiereConclusionDescriptiva(nivelFinal, nivelEducativo);

                return (
                  <tr key={est.codigo} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td style={{ padding: "10px 16px", fontWeight: 500 }}>{est.nombre}</td>
                    <td style={{ padding: "10px 12px", textAlign: "center" }}>
                      <InsigniaNivel nivel={sugerido || "—"} preliminar />
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "center" }}>
                      <select
                        aria-label={`Nivel final · ${est.nombre}`}
                        value={nivelFinal}
                        onChange={(e) => onCambiarNivel(compActiva, est.indice, e.target.value)}
                        style={{
                          height: 34,
                          minWidth: 74,
                          borderRadius: "var(--radius-md)",
                          border: "1px solid var(--border-input)",
                          padding: "0 8px",
                          fontWeight: 600,
                        }}
                      >
                        <option value="">Sin definir</option>
                        <option value="AD">AD</option>
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                      </select>
                    </td>
                    <td style={{ padding: "8px 16px" }}>
                      <input
                        type="text"
                        aria-label={`Conclusión · ${est.nombre}`}
                        placeholder={
                          obligatoria
                            ? "Obligatoria (mín. 10 caracteres)"
                            : "Conclusión descriptiva opcional"
                        }
                        value={conclusion}
                        onChange={(e) => onCambiarConclusion(compActiva, est.indice, e.target.value)}
                        style={{
                          width: "100%",
                          height: 34,
                          padding: "0 10px",
                          borderRadius: "var(--radius-md)",
                          border: `1px solid ${
                            obligatoria && conclusion.trim().length < 10
                              ? "var(--status-danger)"
                              : "var(--border-input)"
                          }`,
                        }}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Tarjeta>
    </div>
  );
}
