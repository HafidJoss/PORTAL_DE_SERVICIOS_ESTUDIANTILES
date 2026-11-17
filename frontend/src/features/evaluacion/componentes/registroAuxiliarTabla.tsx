import { Download } from "lucide-react";
import { useState } from "react";

import type {
  CompetenciaCatalogoOut,
  EstudianteSeccionOut,
  SesionClaseOut,
} from "../../../api/generated/model";
import { Boton } from "../../../shared/componentes/boton";
import { EstadoVacio } from "../../../shared/componentes/estadoVacio";
import { InsigniaNivel } from "../../../shared/componentes/insigniaNivel";
import { Tarjeta } from "../../../shared/componentes/tarjeta";
import {
  calcularNivelCapacidad,
  calcularNotaDelDia,
  calcularSugerenciaCompetencia,
  type CodigoCompetencia,
  type MetodoCalculoCneb,
} from "../utilidades/calculoMediana";
import {
  descargarArchivoCsv,
  serializarRegistroAuxiliarCsv,
} from "../utilidades/exportadorCsvAuxiliar";

interface RegistroAuxiliarTablaProps {
  seccionId: string;
  competencias: readonly CompetenciaCatalogoOut[];
  estudiantes: readonly EstudianteSeccionOut[];
  sesiones: readonly SesionClaseOut[];
}

export function RegistroAuxiliarTabla({
  seccionId,
  competencias,
  estudiantes,
  sesiones,
}: RegistroAuxiliarTablaProps) {
  const [compActiva, setCompActiva] = useState<CodigoCompetencia>(
    competencias[1]?.codigo ?? competencias[0]?.codigo ?? "C1",
  );
  const [capFiltro, setCapFiltro] = useState<number | "todas">("todas");
  const [soloPendientes, setSoloPendientes] = useState(false);
  const [metodo, setMetodo] = useState<MetodoCalculoCneb>("mediana");

  const compMeta = competencias.find((c) => c.codigo === compActiva) ?? competencias[0];
  const sesionesComp = sesiones.filter((s) => {
    if (s.competencia !== compActiva) return false;
    if (capFiltro !== "todas" && s.capacidad_idx !== capFiltro) return false;
    if (soloPendientes && s.estado !== "pendiente") return false;
    return true;
  });

  function exportarCsv() {
    const encabezados = [
      "Estudiante",
      ...sesionesComp.map((s) => `${s.fecha} - ${s.tema}`),
      ...(compMeta?.capacidades ?? []).map((_, idx) => `Cap. ${idx + 1}`),
      "Sugerido competencia",
    ];

    const filas = estudiantes.map((est) => {
      const key = String(est.indice);
      const notasSesiones = sesionesComp.map(
        (s) =>
          calcularNotaDelDia(s.notas_por_estudiante[key] ?? [], s.ajustes_manuales[key]) || "—",
      );
      const notasCaps = [0, 1, 2, 3].map(
        (idx) => calcularNivelCapacidad(sesiones, key, compActiva, idx, metodo) || "—",
      );
      const sug = calcularSugerenciaCompetencia(sesiones, key, compActiva, metodo) || "—";
      return [est.nombre, ...notasSesiones, ...notasCaps, sug];
    });

    const csv = serializarRegistroAuxiliarCsv(encabezados, filas);
    descargarArchivoCsv(`registro-auxiliar-${seccionId}-${compActiva}.csv`, csv);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Tarjeta>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: 17, fontFamily: "var(--font-heading)" }}>
              Registro auxiliar cualitativo
            </h3>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text-secondary)" }}>
              Escala CNEB AD/A/B/C por capacidades sin promedios numéricos.
            </p>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
            <select
              aria-label="Método de cálculo de competencia"
              value={metodo}
              onChange={(e) => setMetodo(e.target.value as MetodoCalculoCneb)}
              style={{
                height: 34,
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-input)",
                padding: "0 10px",
                fontSize: 13,
              }}
            >
              <option value="mediana">Mediana de capacidades</option>
              <option value="ultimo">Último nivel registrado</option>
            </select>
            <Boton type="button" variant="outline" size="sm" onClick={exportarCsv}>
              <Download size={14} /> Descargar registro
            </Boton>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
          {competencias.map((comp) => {
            const activa = comp.codigo === compActiva;
            return (
              <button
                key={comp.codigo}
                type="button"
                onClick={() => {
                  setCompActiva(comp.codigo);
                  setCapFiltro("todas");
                }}
                style={{
                  height: 34,
                  padding: "0 14px",
                  borderRadius: "var(--radius-pill)",
                  border: `1px solid ${activa ? "var(--color-primary)" : "var(--border-subtle)"}`,
                  backgroundColor: activa ? "var(--color-primary-light)" : "var(--bg-surface)",
                  color: activa ? "var(--color-primary)" : "var(--text-secondary)",
                  fontFamily: "var(--font-button)",
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                {comp.codigo} · {comp.nombre}
              </button>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <select
            aria-label="Filtrar por capacidad"
            value={capFiltro === "todas" ? "todas" : String(capFiltro)}
            onChange={(e) =>
              setCapFiltro(e.target.value === "todas" ? "todas" : Number(e.target.value))
            }
            style={{
              height: 34,
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-input)",
              padding: "0 10px",
              fontSize: 13,
            }}
          >
            <option value="todas">Todas las capacidades</option>
            {(compMeta?.capacidades ?? []).map((cap, idx) => (
              <option key={cap} value={idx}>
                Capacidad {idx + 1}: {cap}
              </option>
            ))}
          </select>

          <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13 }}>
            <input
              type="checkbox"
              checked={soloPendientes}
              onChange={(e) => setSoloPendientes(e.target.checked)}
            />
            Solo sesiones pendientes
          </label>
        </div>
      </Tarjeta>

      {sesionesComp.length === 0 ? (
        <EstadoVacio
          titulo="Sin clases para este filtro"
          descripcion="No hay sesiones registradas que coincidan con la competencia o capacidad elegida."
        />
      ) : (
        <Tarjeta style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 740, fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-subtle)", textAlign: "left" }}>
                  <th
                    style={{
                      position: "sticky",
                      left: 0,
                      backgroundColor: "var(--bg-surface)",
                      padding: "10px 16px",
                      zIndex: 1,
                    }}
                  >
                    Estudiante
                  </th>
                  {sesionesComp.map((s) => (
                    <th key={s.id} style={{ padding: "8px 10px", textAlign: "center", minWidth: 96 }}>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{s.fecha}</div>
                      <div style={{ fontSize: 12 }}>{s.tema}</div>
                    </th>
                  ))}
                  {[0, 1, 2, 3].map((idx) => (
                    <th key={idx} style={{ padding: "8px 10px", textAlign: "center" }}>
                      Cap. {idx + 1}
                    </th>
                  ))}
                  <th style={{ padding: "8px 12px", textAlign: "center" }}>Sugerido comp.</th>
                </tr>
              </thead>
              <tbody>
                {estudiantes.map((est) => {
                  const key = String(est.indice);
                  const sug = calcularSugerenciaCompetencia(sesiones, key, compActiva, metodo);

                  return (
                    <tr key={est.codigo} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                      <td
                        style={{
                          position: "sticky",
                          left: 0,
                          backgroundColor: "var(--bg-surface)",
                          padding: "8px 16px",
                          fontWeight: 500,
                          zIndex: 1,
                        }}
                      >
                        {est.nombre}
                      </td>
                      {sesionesComp.map((s) => {
                        const nota = calcularNotaDelDia(
                          s.notas_por_estudiante[key] ?? [],
                          s.ajustes_manuales[key],
                        );
                        return (
                          <td key={s.id} style={{ padding: "6px 10px", textAlign: "center" }}>
                            <InsigniaNivel
                              nivel={nota || "—"}
                              preliminar={Boolean(s.ajustes_manuales[key])}
                            />
                          </td>
                        );
                      })}
                      {[0, 1, 2, 3].map((idx) => {
                        const nivelCap = calcularNivelCapacidad(
                          sesiones,
                          key,
                          compActiva,
                          idx,
                          metodo,
                        );
                        return (
                          <td key={idx} style={{ padding: "6px 10px", textAlign: "center" }}>
                            <InsigniaNivel nivel={nivelCap || "—"} preliminar />
                          </td>
                        );
                      })}
                      <td style={{ padding: "6px 12px", textAlign: "center" }}>
                        <InsigniaNivel nivel={sug || "—"} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Tarjeta>
      )}
    </div>
  );
}
