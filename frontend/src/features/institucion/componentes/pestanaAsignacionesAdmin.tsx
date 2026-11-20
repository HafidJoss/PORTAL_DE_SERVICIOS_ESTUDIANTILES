import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";

import {
  getListarAsignacionesDocentesApiV1InstitucionAsignacionesGetQueryKey,
  useActualizarAsignacionDocenteApiV1InstitucionAsignacionesPatch,
  useListarAsignacionesDocentesApiV1InstitucionAsignacionesGet,
} from "../../../api/generated/institucion/institucion";

const SECCIONES_RAPIDAS = [
  { id: "S2A", etiqueta: "2.° A" },
  { id: "S2B", etiqueta: "2.° B" },
  { id: "S3A", etiqueta: "3.° A" },
  { id: "S3B", etiqueta: "3.° B" },
  { id: "S4A", etiqueta: "4.° A" },
  { id: "S4C", etiqueta: "4.° C" },
];

export function PestanaAsignacionesAdmin() {
  const queryClient = useQueryClient();
  const [seccionId, setSeccionId] = useState("S2A");

  const consulta = useListarAsignacionesDocentesApiV1InstitucionAsignacionesGet({
    seccion_id: seccionId,
  });
  const actualizarMutation =
    useActualizarAsignacionDocenteApiV1InstitucionAsignacionesPatch();

  const datos = consulta.data?.status === 200 ? consulta.data.data : null;

  async function manejarCambio(
    asignatura: string,
    campo: "titular" | "suplente",
    valor: string,
  ) {
    await actualizarMutation.mutateAsync({
      data: {
        seccion_id: seccionId,
        asignatura,
        ...(campo === "titular" ? { titular: valor } : { suplente: valor }),
      },
    });
    await queryClient.invalidateQueries({
      queryKey: getListarAsignacionesDocentesApiV1InstitucionAsignacionesGetQueryKey({
        seccion_id: seccionId,
      }),
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {SECCIONES_RAPIDAS.map((sec) => {
            const on = seccionId === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => setSeccionId(sec.id)}
                style={{
                  height: 34,
                  padding: "0 14px",
                  borderRadius: "var(--radius-pill)",
                  border: `1px solid ${on ? "var(--color-primary)" : "var(--border-subtle)"}`,
                  backgroundColor: on ? "var(--color-primary-light)" : "var(--bg-surface)",
                  color: on ? "var(--color-primary)" : "var(--text-secondary)",
                  fontFamily: "var(--font-button)",
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                {sec.etiqueta}
              </button>
            );
          })}
        </div>
        {datos ? (
          <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
            Tutor(a): <strong>{datos.tutor}</strong> · Auxiliar: <strong>{datos.auxiliar}</strong>
          </div>
        ) : null}
      </div>

      {datos ? (
        <section
          style={{
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-card)",
            borderRadius: "var(--radius-xl)",
            overflowX: "auto",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 640 }}>
            <thead>
              <tr style={{ backgroundColor: "var(--bg-subtle)", textAlign: "left" }}>
                <th style={{ padding: "10px 14px", fontSize: 11 }}>Asignatura</th>
                <th style={{ padding: "10px 14px", fontSize: 11 }}>Docente titular</th>
                <th style={{ padding: "10px 14px", fontSize: 11 }}>Suplente</th>
              </tr>
            </thead>
            <tbody>
              {datos.asignaciones.map((fila) => (
                <tr key={fila.asignatura} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <td style={{ padding: "10px 14px" }}>
                    <div style={{ fontWeight: 500 }}>{fila.asignatura}</div>
                    {fila.alerta ? (
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          fontSize: 12,
                          color: "#B45309",
                          marginTop: 2,
                        }}
                      >
                        <AlertTriangle size={13} />
                        {fila.alerta}
                      </div>
                    ) : null}
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <select
                      aria-label={`Titular de ${fila.asignatura}`}
                      value={fila.titular}
                      onChange={(e) =>
                        void manejarCambio(fila.asignatura, "titular", e.target.value)
                      }
                      style={{
                        height: 36,
                        width: "100%",
                        minWidth: 200,
                        border: "1px solid var(--border-input)",
                        borderRadius: 10,
                        padding: "0 10px",
                      }}
                    >
                      <option value="">Sin asignar</option>
                      {datos.docentes_disponibles.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <select
                      aria-label={`Suplente de ${fila.asignatura}`}
                      value={fila.suplente}
                      onChange={(e) =>
                        void manejarCambio(fila.asignatura, "suplente", e.target.value)
                      }
                      style={{
                        height: 36,
                        width: "100%",
                        minWidth: 200,
                        border: "1px solid var(--border-input)",
                        borderRadius: 10,
                        padding: "0 10px",
                      }}
                    >
                      <option value="">Sin suplente</option>
                      {datos.docentes_disponibles.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : null}

      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
        Los cambios se guardan al instante y quedan registrados en la bitácora. Estudiantes y
        apoderados ven la plana docente actualizada.
      </div>
    </div>
  );
}
