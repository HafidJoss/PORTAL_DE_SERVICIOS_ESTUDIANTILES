import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { IdCard, UserPlus, X } from "lucide-react";

import {
  getListarEstudiantesSeccionApiV1MatriculasSeccionesSeccionIdEstudiantesGetQueryKey,
  getListarEstudiantesSinSeccionApiV1MatriculasSinSeccionGetQueryKey,
  useAsignarEstudianteDesdePoolApiV1MatriculasAsignarPost,
  useCambiarEstadoEstudianteApiV1MatriculasEstudiantesEstudianteIdEstadoPatch,
  useListarEstudiantesSeccionApiV1MatriculasSeccionesSeccionIdEstudiantesGet,
  useListarEstudiantesSinSeccionApiV1MatriculasSinSeccionGet,
  useMoverEstudianteSeccionApiV1MatriculasEstudiantesEstudianteIdMoverPatch,
} from "../../../api/generated/matriculas/matriculas";
import type { EstudianteNominaSeccionOutEstado } from "../../../api/generated/model";
import { ProblemDetailError } from "../../../api/clienteHttp";

interface PanelNominaSeccionAdminProps {
  seccionId: string | null;
  seccionNombre?: string;
  nivel?: string;
  grado?: number;
  poolAbierto: boolean;
  onCerrarPool: () => void;
  onCambioNomina?: () => void;
}

const ESTILO_ESTADO: Record<EstudianteNominaSeccionOutEstado, { bg: string; fg: string }> = {
  Activo: { bg: "#ECFDF5", fg: "#047857" },
  Retirado: { bg: "#F1F5F9", fg: "#475569" },
  Trasladado: { bg: "#FFFBEB", fg: "#B45309" },
};

const ESTILO_NIVEL: Record<string, { bg: string; fg: string }> = {
  AD: { bg: "#1E293B", fg: "#FFFFFF" },
  A: { bg: "#ECFDF5", fg: "#047857" },
  B: { bg: "#FFFBEB", fg: "#B45309" },
  C: { bg: "#FEF2F2", fg: "#991B1B" },
};

export function PanelNominaSeccionAdmin({
  seccionId,
  seccionNombre,
  nivel,
  grado,
  poolAbierto,
  onCerrarPool,
  onCambioNomina,
}: PanelNominaSeccionAdminProps) {
  const queryClient = useQueryClient();
  const [resumenAbiertoId, setResumenAbiertoId] = useState<string | null>(null);
  const [errorAccion, setErrorAccion] = useState("");

  const consultaPool = useListarEstudiantesSinSeccionApiV1MatriculasSinSeccionGet();
  const consultaNomina =
    useListarEstudiantesSeccionApiV1MatriculasSeccionesSeccionIdEstudiantesGet(
      seccionId ?? "",
      { query: { enabled: Boolean(seccionId) } },
    );

  const asignarMutation = useAsignarEstudianteDesdePoolApiV1MatriculasAsignarPost();
  const moverMutation =
    useMoverEstudianteSeccionApiV1MatriculasEstudiantesEstudianteIdMoverPatch();
  const estadoMutation =
    useCambiarEstadoEstudianteApiV1MatriculasEstudiantesEstudianteIdEstadoPatch();

  async function refrescar() {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: getListarEstudiantesSinSeccionApiV1MatriculasSinSeccionGetQueryKey(),
      }),
      ...(seccionId
        ? [
            queryClient.invalidateQueries({
              queryKey:
                getListarEstudiantesSeccionApiV1MatriculasSeccionesSeccionIdEstudiantesGetQueryKey(
                  seccionId,
                ),
            }),
          ]
        : []),
    ]);
    onCambioNomina?.();
  }

  async function manejarAsignar(estudianteId: string) {
    if (!seccionId) return;
    setErrorAccion("");
    try {
      await asignarMutation.mutateAsync({
        data: { estudiante_id: estudianteId, seccion_id: seccionId },
      });
      await refrescar();
    } catch (err) {
      setErrorAccion(
        err instanceof ProblemDetailError
          ? err.detail || err.title
          : "No se pudo asignar al estudiante.",
      );
    }
  }

  async function manejarMover(estudianteId: string, destinoId: string) {
    if (!seccionId || !destinoId) return;
    setErrorAccion("");
    try {
      await moverMutation.mutateAsync({
        estudianteId,
        data: { seccion_origen_id: seccionId, seccion_destino_id: destinoId },
      });
      setResumenAbiertoId(null);
      await refrescar();
    } catch (err) {
      setErrorAccion(
        err instanceof ProblemDetailError
          ? err.detail || err.title
          : "No se pudo mover al estudiante.",
      );
    }
  }

  async function manejarEstado(estudianteId: string, estado: EstudianteNominaSeccionOutEstado) {
    if (!seccionId) return;
    setErrorAccion("");
    try {
      await estadoMutation.mutateAsync({
        estudianteId,
        data: { seccion_id: seccionId, estado },
      });
      await refrescar();
    } catch (err) {
      setErrorAccion(
        err instanceof ProblemDetailError
          ? err.detail || err.title
          : "No se pudo actualizar el estado.",
      );
    }
  }

  const poolEstudiantes =
    consultaPool.data?.status === 200 ? consultaPool.data.data.estudiantes : [];
  const nomina = consultaNomina.data?.status === 200 ? consultaNomina.data.data : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {errorAccion ? (
        <div
          role="alert"
          style={{
            padding: "10px 14px",
            borderRadius: 12,
            backgroundColor: "#FEF2F2",
            color: "#991B1B",
            fontSize: 13,
          }}
        >
          {errorAccion}
        </div>
      ) : null}

      {poolAbierto ? (
        <section
          style={{
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--color-primary)",
            borderRadius: "var(--radius-xl)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "14px 20px",
              borderBottom: "1px solid var(--border-subtle)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: 16 }}>
                Estudiantes sin sección
              </h3>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                Nómina SIAGIE cargada por Secretaría ·{" "}
                {seccionNombre
                  ? `se asignarán a ${seccionNombre}`
                  : "elige primero una sección del grado"}
              </div>
            </div>
            <button
              type="button"
              aria-label="Cerrar sin sección"
              onClick={onCerrarPool}
              style={{
                width: 34,
                height: 34,
                border: "none",
                borderRadius: "50%",
                background: "transparent",
                color: "var(--text-secondary)",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <X size={18} />
            </button>
          </div>

          {poolEstudiantes.length === 0 ? (
            <div style={{ padding: 20, fontSize: 14, color: "var(--text-muted)" }}>
              Todos los estudiantes de la nómina tienen sección.
            </div>
          ) : (
            poolEstudiantes.map((est) => {
              const compatible =
                Boolean(seccionId) && nivel === est.nivel && grado === est.grado;
              return (
                <div
                  key={est.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 20px",
                    borderBottom: "1px solid var(--border-subtle)",
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ flex: "1 1 200px", minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{est.nombre}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      Código {est.codigo} · {est.nota}
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={!compatible || asignarMutation.isPending}
                    onClick={() => void manejarAsignar(est.id)}
                    style={{
                      height: 34,
                      padding: "0 14px",
                      border: "none",
                      borderRadius: "var(--radius-pill)",
                      backgroundColor: compatible ? "var(--color-primary)" : "#F1F5F9",
                      color: compatible ? "#FFFFFF" : "#94A3B8",
                      fontFamily: "var(--font-button)",
                      fontWeight: 600,
                      fontSize: 13,
                      cursor: compatible ? "pointer" : "not-allowed",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <UserPlus size={14} />
                    {compatible
                      ? `Asignar a ${seccionNombre}`
                      : seccionId
                        ? `Es de ${est.grado}.° grado`
                        : "Elige una sección"}
                  </button>
                </div>
              );
            })
          )}
        </section>
      ) : null}

      {seccionId && nomina ? (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 640 }}>
            <thead>
              <tr style={{ backgroundColor: "var(--bg-subtle)", textAlign: "left" }}>
                <th style={{ padding: "10px 14px", fontSize: 11 }}>N.°</th>
                <th style={{ padding: "10px 14px", fontSize: 11 }}>Estudiante</th>
                <th style={{ padding: "10px 14px", fontSize: 11 }}>Código</th>
                <th style={{ padding: "10px 14px", fontSize: 11 }}>Estado</th>
                <th style={{ padding: "10px 14px", fontSize: 11, textAlign: "right" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {nomina.estudiantes.map((est, idx) => {
                const abierto = resumenAbiertoId === est.id;
                const estiloEst = ESTILO_ESTADO[est.estado];
                return (
                  <FragmentoFilaEstudiante
                    key={est.id}
                    indice={idx + 1}
                    estudiante={est}
                    abierto={abierto}
                    estiloEstado={estiloEst}
                    opcionesMovimiento={nomina.opciones_movimiento}
                    onAlternar={() => setResumenAbiertoId(abierto ? null : est.id)}
                    onMover={(destino) => void manejarMover(est.id, destino)}
                    onCambiarEstado={(nuevo) => void manejarEstado(est.id, nuevo)}
                  />
                );
              })}
            </tbody>
          </table>
          {nomina.estudiantes.length === 0 ? (
            <div style={{ padding: "24px 20px", textAlign: "center", color: "var(--text-muted)" }}>
              Esta sección no tiene estudiantes. Usa «Sin sección» para asignar.
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function FragmentoFilaEstudiante({
  indice,
  estudiante,
  abierto,
  estiloEstado,
  opcionesMovimiento,
  onAlternar,
  onMover,
  onCambiarEstado,
}: {
  indice: number;
  estudiante: {
    id: string;
    nombre: string;
    codigo: string;
    estado: EstudianteNominaSeccionOutEstado;
    resumen: {
      codigo_siagie: string;
      dni: string;
      apoderado: string;
      tutor: string;
      asistencia_pct: number;
      pendientes: number;
      observaciones: number;
      areas: Array<{ area: string; nivel: string }>;
    };
  };
  abierto: boolean;
  estiloEstado: { bg: string; fg: string };
  opcionesMovimiento: Array<{ id: string; etiqueta: string }>;
  onAlternar: () => void;
  onMover: (destino: string) => void;
  onCambiarEstado: (estado: EstudianteNominaSeccionOutEstado) => void;
}) {
  return (
    <>
      <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        <td style={{ padding: "8px 14px", color: "var(--text-muted)" }}>{indice}</td>
        <td style={{ padding: "8px 14px", fontWeight: 500 }}>{estudiante.nombre}</td>
        <td style={{ padding: "8px 14px", color: "var(--text-muted)" }}>{estudiante.codigo}</td>
        <td style={{ padding: "8px 14px" }}>
          <span
            style={{
              height: 22,
              padding: "0 9px",
              borderRadius: "var(--radius-pill)",
              backgroundColor: estiloEstado.bg,
              color: estiloEstado.fg,
              fontSize: 12,
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            {estudiante.estado}
          </span>
        </td>
        <td style={{ padding: "8px 14px", textAlign: "right" }}>
          <div style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
            <select
              aria-label={`Mover a ${estudiante.nombre}`}
              value=""
              onChange={(e) => onMover(e.target.value)}
              style={{
                height: 32,
                border: "1px solid var(--border-input)",
                borderRadius: "var(--radius-pill)",
                padding: "0 10px",
                fontSize: 12,
                backgroundColor: "var(--bg-surface)",
                color: "var(--text-main)",
              }}
            >
              <option value="">Mover a…</option>
              {opcionesMovimiento.map((op) => (
                <option key={op.id} value={op.id}>
                  {op.etiqueta}
                </option>
              ))}
              <option value="__pool">Quitar de la sección</option>
            </select>
            <button
              type="button"
              onClick={onAlternar}
              style={{
                height: 32,
                padding: "0 12px",
                border: "1px solid var(--color-primary)",
                borderRadius: "var(--radius-pill)",
                backgroundColor: abierto ? "var(--color-primary)" : "var(--bg-surface)",
                color: abierto ? "#FFFFFF" : "var(--color-primary)",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <IdCard size={13} />
              Resumen
            </button>
          </div>
        </td>
      </tr>
      {abierto ? (
        <tr>
          <td colSpan={5} style={{ padding: "16px 20px", backgroundColor: "var(--bg-subtle)" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
              <div style={{ flex: "1 1 220px", display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase" }}>Datos</div>
                <div style={{ fontSize: 13 }}>DNI: <strong>{estudiante.resumen.dni}</strong></div>
                <div style={{ fontSize: 13 }}>Apoderado(a): <strong>{estudiante.resumen.apoderado}</strong></div>
                <div style={{ fontSize: 13 }}>Tutor(a): <strong>{estudiante.resumen.tutor}</strong></div>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, marginTop: 4 }}>
                  Estado en la sección
                  <select
                    aria-label="Estado en la sección"
                    value={estudiante.estado}
                    onChange={(e) =>
                      onCambiarEstado(e.target.value as EstudianteNominaSeccionOutEstado)
                    }
                    style={{
                      height: 30,
                      border: "1px solid var(--border-input)",
                      borderRadius: "var(--radius-pill)",
                      padding: "0 10px",
                      fontSize: 12,
                    }}
                  >
                    <option value="Activo">Activo</option>
                    <option value="Retirado">Retirado</option>
                    <option value="Trasladado">Trasladado</option>
                  </select>
                </label>
              </div>
              <div style={{ flex: "1 1 180px", display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase" }}>
                  III Trimestre
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 18 }}>
                      {estudiante.resumen.asistencia_pct}%
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Asistencia</div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 18 }}>
                      {estudiante.resumen.pendientes}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Pendientes</div>
                  </div>
                </div>
              </div>
              <div style={{ flex: "1 1 220px", display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase" }}>
                  Último nivel por área
                </div>
                {estudiante.resumen.areas.map((a) => {
                  const st = ESTILO_NIVEL[a.nivel] ?? { bg: "#F1F5F9", fg: "#0F172A" };
                  return (
                    <div
                      key={a.area}
                      style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}
                    >
                      <span>{a.area}</span>
                      <span
                        style={{
                          padding: "0 8px",
                          borderRadius: "var(--radius-pill)",
                          backgroundColor: st.bg,
                          color: st.fg,
                          fontWeight: 600,
                          fontSize: 12,
                        }}
                      >
                        {a.nivel}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </td>
        </tr>
      ) : null}
    </>
  );
}
