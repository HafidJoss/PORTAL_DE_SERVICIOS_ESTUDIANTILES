import { Download, ArrowLeft } from "lucide-react";

import type { EstudianteSeccionOut, SesionClaseOut } from "../../../api/generated/model";
import { Boton } from "../../../shared/componentes/boton";
import { InsigniaNivel } from "../../../shared/componentes/insigniaNivel";
import { Tarjeta } from "../../../shared/componentes/tarjeta";
import { calcularNotaDelDia, esNivelCneb } from "../utilidades/calculoMediana";

interface FichaClaseCuadriculaProps {
  sesion: SesionClaseOut;
  estudiantes: readonly EstudianteSeccionOut[];
  competenciaNombre: string;
  capacidadNombre: string;
  onCambiarCriterio: (sesionId: string, estIdx: number, critIdx: number, valor: string) => void;
  onCompletarVacios: (sesionId: string, nivel: "AD" | "A") => void;
  onAjustarNotaDia: (sesionId: string, estIdx: number, valor: string) => void;
  onGuardarBorrador?: (sesionId: string) => void | Promise<void>;
  onPublicarSesion: (sesionId: string) => void | Promise<void>;
  onDescargarCsv?: () => void;
  onVolver?: () => void;
  errorValidacion?: string;
  guardando?: boolean;
}

const OPCIONES_NIVEL = ["", "AD", "A", "B", "C"] as const;

export function FichaClaseCuadricula({
  sesion,
  estudiantes,
  competenciaNombre,
  capacidadNombre,
  onCambiarCriterio,
  onCompletarVacios,
  onAjustarNotaDia,
  onGuardarBorrador,
  onPublicarSesion,
  onDescargarCsv,
  onVolver,
  errorValidacion,
  guardando = false,
}: FichaClaseCuadriculaProps) {
  const pendientesCount = estudiantes.filter((est) => {
    const fila = sesion.notas_por_estudiante[String(est.indice)] ?? [];
    return fila.length < 4 || fila.slice(0, 4).some((n) => !esNivelCneb(n));
  }).length;

  return (
    <Tarjeta style={{ padding: 0, overflow: "hidden" }}>
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid var(--border-subtle)",
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, minWidth: 0, flex: "1 1 280px" }}>
          {onVolver ? (
            <Boton type="button" variant="outline" size="sm" onClick={onVolver} aria-label="Volver a clases">
              <ArrowLeft size={16} />
            </Boton>
          ) : null}
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>
              {sesion.fecha} · {sesion.competencia} · {competenciaNombre}
            </div>
            <h3 style={{ margin: "2px 0 4px", fontSize: 17, fontFamily: "var(--font-heading)" }}>
              {sesion.tema}
            </h3>
            <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
              Capacidad: {capacidadNombre} · Evidencia: {sesion.evidencia}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              padding: "4px 10px",
              borderRadius: "var(--radius-pill)",
              backgroundColor:
                pendientesCount === 0 ? "var(--status-success-bg)" : "var(--status-warning-bg)",
              color:
                pendientesCount === 0 ? "var(--status-success-fg)" : "var(--status-warning-fg)",
            }}
          >
            {pendientesCount === 0
              ? "Todos completos"
              : `${pendientesCount} estudiante(s) pendientes`}
          </span>

          <Boton
            type="button"
            variant="outline"
            size="sm"
            disabled={guardando}
            onClick={() => onCompletarVacios(sesion.id, "A")}
          >
            Completar vacíos con A
          </Boton>
          <Boton
            type="button"
            variant="outline"
            size="sm"
            disabled={guardando}
            onClick={() => onCompletarVacios(sesion.id, "AD")}
          >
            Completar vacíos con AD
          </Boton>
          {onDescargarCsv ? (
            <Boton type="button" variant="outline" size="sm" onClick={onDescargarCsv}>
              <Download size={14} /> Descargar CSV
            </Boton>
          ) : null}
        </div>
      </div>

      <div
        style={{
          padding: "10px 20px",
          backgroundColor: "var(--bg-subtle)",
          borderBottom: "1px solid var(--border-subtle)",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 8,
          fontSize: 12,
          color: "var(--text-secondary)",
        }}
      >
        {sesion.criterios.slice(0, 4).map((crit, idx) => (
          <div key={idx} style={{ fontWeight: 500 }}>
            {`K${idx + 1} · ${crit}`}
          </div>
        ))}
      </div>

      {errorValidacion ? (
        <div
          role="alert"
          style={{
            margin: "12px 20px 0",
            padding: "10px 14px",
            borderRadius: "var(--radius-md)",
            backgroundColor: "var(--status-danger-bg)",
            color: "var(--status-danger)",
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          {errorValidacion}
        </div>
      ) : null}

      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            minWidth: 680,
            fontSize: 13,
          }}
        >
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
              {[0, 1, 2, 3].map((k) => (
                <th key={k} style={{ padding: "10px 8px", textAlign: "center" }}>
                  K{k + 1}
                </th>
              ))}
              <th style={{ padding: "10px 12px", textAlign: "center" }}>Nota del día</th>
              <th style={{ padding: "10px 12px", textAlign: "center" }}>Ajuste manual</th>
            </tr>
          </thead>
          <tbody>
            {estudiantes.map((est) => {
              const key = String(est.indice);
              const criterios = sesion.notas_por_estudiante[key] ?? ["", "", "", ""];
              const ajuste = sesion.ajustes_manuales[key] ?? "";
              const notaDia = calcularNotaDelDia(criterios, ajuste);

              return (
                <tr key={est.codigo} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <td
                    style={{
                      position: "sticky",
                      left: 0,
                      backgroundColor: "var(--bg-surface)",
                      padding: "8px 16px",
                      fontWeight: 500,
                      color: "var(--text-main)",
                      zIndex: 1,
                    }}
                  >
                    {est.nombre}
                  </td>
                  {[0, 1, 2, 3].map((critIdx) => (
                    <td key={critIdx} style={{ padding: "6px 8px", textAlign: "center" }}>
                      <select
                        aria-label={`K${critIdx + 1} · ${est.nombre}`}
                        value={criterios[critIdx] ?? ""}
                        onChange={(e) =>
                          onCambiarCriterio(sesion.id, est.indice, critIdx, e.target.value)
                        }
                        style={{
                          height: 32,
                          minWidth: 58,
                          borderRadius: "var(--radius-md)",
                          border: "1px solid var(--border-input)",
                          backgroundColor: "var(--bg-surface)",
                          color: "var(--text-main)",
                          padding: "0 6px",
                          fontWeight: 600,
                        }}
                      >
                        {OPCIONES_NIVEL.map((op) => (
                          <option key={op || "vacio"} value={op}>
                            {op || "—"}
                          </option>
                        ))}
                      </select>
                    </td>
                  ))}
                  <td style={{ padding: "6px 12px", textAlign: "center" }}>
                    <InsigniaNivel nivel={notaDia || "—"} preliminar={Boolean(ajuste)} />
                  </td>
                  <td style={{ padding: "6px 12px", textAlign: "center" }}>
                    <select
                      aria-label={`Ajuste manual · ${est.nombre}`}
                      value={ajuste}
                      onChange={(e) => onAjustarNotaDia(sesion.id, est.indice, e.target.value)}
                      style={{
                        height: 32,
                        borderRadius: "var(--radius-md)",
                        border: "1px solid var(--border-input)",
                        backgroundColor: "var(--bg-surface)",
                        color: "var(--text-main)",
                        padding: "0 6px",
                      }}
                    >
                      <option value="">Mediana auto</option>
                      <option value="AD">AD</option>
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div
        style={{
          padding: "14px 20px",
          borderTop: "1px solid var(--border-subtle)",
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          justifyContent: "flex-end",
        }}
      >
        {onGuardarBorrador ? (
          <Boton
            type="button"
            variant="outline"
            disabled={guardando}
            onClick={() => void onGuardarBorrador(sesion.id)}
          >
            Guardar notas
          </Boton>
        ) : null}
        <Boton
          type="button"
          disabled={guardando}
          onClick={() => void onPublicarSesion(sesion.id)}
        >
          {sesion.estado === "registrada" ? "Actualizar publicación" : "Guardar y publicar"}
        </Boton>
      </div>
    </Tarjeta>
  );
}
