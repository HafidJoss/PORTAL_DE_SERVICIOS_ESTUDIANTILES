import { useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, UserRoundSearch } from "lucide-react";

import {
  getListarSeccionesAdminApiV1InstitucionSeccionesGetQueryKey,
  useActualizarPersonalSeccionApiV1InstitucionSeccionesSeccionIdPatch,
  useCrearSeccionAdminApiV1InstitucionSeccionesPost,
  useEliminarSeccionAdminApiV1InstitucionSeccionesSeccionIdDelete,
  useListarSeccionesAdminApiV1InstitucionSeccionesGet,
} from "../../../api/generated/institucion/institucion";
import { useListarEstudiantesSinSeccionApiV1MatriculasSinSeccionGet } from "../../../api/generated/matriculas/matriculas";
import type { SeccionAdminOutNivel } from "../../../api/generated/model";
import { ProblemDetailError } from "../../../api/clienteHttp";

export interface PropsPanelNominaSeccion {
  seccionId: string | null;
  seccionNombre?: string;
  nivel?: string;
  grado?: number;
  poolAbierto: boolean;
  onCerrarPool: () => void;
  onCambioNomina?: () => void;
}

export function PestanaSeccionesAdmin({
  renderPanelNomina,
}: {
  renderPanelNomina?: (props: PropsPanelNominaSeccion) => ReactNode;
}) {
  const queryClient = useQueryClient();
  const [nivel, setNivel] = useState<SeccionAdminOutNivel>("Secundaria");
  const [grado, setGrado] = useState<number>(1);
  const [seccionSelId, setSeccionSelId] = useState<string | null>(null);
  const [poolAbierto, setPoolAbierto] = useState(false);
  const [formAbierto, setFormAbierto] = useState(false);
  const [letraElegida, setLetraElegida] = useState("");
  const [tutorNuevo, setTutorNuevo] = useState("");
  const [auxNuevo, setAuxNuevo] = useState("");
  const [confirmarEliminar, setConfirmarEliminar] = useState(false);
  const [errorUi, setErrorUi] = useState("");

  const consultaSecciones = useListarSeccionesAdminApiV1InstitucionSeccionesGet({
    nivel,
    grado,
  });
  const consultaPool = useListarEstudiantesSinSeccionApiV1MatriculasSinSeccionGet();

  const crearMutation = useCrearSeccionAdminApiV1InstitucionSeccionesPost();
  const actualizarPersonalMutation =
    useActualizarPersonalSeccionApiV1InstitucionSeccionesSeccionIdPatch();
  const eliminarMutation = useEliminarSeccionAdminApiV1InstitucionSeccionesSeccionIdDelete();

  const maxGrados = nivel === "Primaria" ? 6 : 5;
  const datos = consultaSecciones.data?.status === 200 ? consultaSecciones.data.data : null;
  const secciones = datos?.secciones ?? [];
  const letrasLibres = datos?.letras_disponibles ?? [];
  const docentesOpts = datos?.docentes_disponibles ?? [];
  const auxOpts = datos?.auxiliares_disponibles ?? [];

  const letraActiva = letrasLibres.includes(letraElegida)
    ? letraElegida
    : letrasLibres[0] ?? "";
  const seccionSel = secciones.find((s) => s.id === seccionSelId) ?? null;
  const totalPool = consultaPool.data?.status === 200 ? consultaPool.data.data.total : 0;

  async function refrescarSecciones() {
    await queryClient.invalidateQueries({
      queryKey: getListarSeccionesAdminApiV1InstitucionSeccionesGetQueryKey({ nivel, grado }),
    });
  }

  async function manejarCrearSeccion() {
    if (!letraActiva) return;
    setErrorUi("");
    try {
      const resp = await crearMutation.mutateAsync({
        data: {
          nivel,
          grado,
          letra: letraActiva,
          tutor: tutorNuevo || docentesOpts[0] || "Sin asignar",
          auxiliar: auxNuevo || auxOpts[0] || "Sin asignar",
        },
      });
      setFormAbierto(false);
      if (resp.status === 201) {
        setSeccionSelId(resp.data.id);
      }
      await refrescarSecciones();
    } catch (err) {
      setErrorUi(
        err instanceof ProblemDetailError ? err.detail || err.title : "No se pudo crear la sección.",
      );
    }
  }

  async function manejarCambiarPersonal(campo: "tutor" | "auxiliar", valor: string) {
    if (!seccionSel) return;
    setErrorUi("");
    try {
      await actualizarPersonalMutation.mutateAsync({
        seccionId: seccionSel.id,
        data: campo === "tutor" ? { tutor: valor } : { auxiliar: valor },
      });
      await refrescarSecciones();
    } catch (err) {
      setErrorUi(
        err instanceof ProblemDetailError ? err.detail || err.title : "No se pudo actualizar.",
      );
    }
  }

  async function manejarEliminarSeccion() {
    if (!seccionSel) return;
    setErrorUi("");
    try {
      await eliminarMutation.mutateAsync({ seccionId: seccionSel.id });
      setSeccionSelId(null);
      setConfirmarEliminar(false);
      await refrescarSecciones();
    } catch (err) {
      setErrorUi(
        err instanceof ProblemDetailError
          ? err.detail || err.title
          : "No se pudo eliminar la sección.",
      );
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {(["Primaria", "Secundaria"] as const).map((nv) => {
            const on = nivel === nv;
            return (
              <button
                key={nv}
                type="button"
                onClick={() => {
                  setNivel(nv);
                  setGrado(1);
                  setSeccionSelId(null);
                  setConfirmarEliminar(false);
                }}
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
                {nv}
              </button>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => {
              setPoolAbierto((v) => !v);
              setFormAbierto(false);
            }}
            style={{
              height: 38,
              padding: "0 16px",
              borderRadius: "var(--radius-pill)",
              border: "1px solid var(--color-primary)",
              backgroundColor: "var(--bg-surface)",
              color: "var(--color-primary)",
              fontFamily: "var(--font-button)",
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <UserRoundSearch size={15} />
            Sin sección ({totalPool})
          </button>
          <button
            type="button"
            onClick={() => {
              setFormAbierto((v) => !v);
              setPoolAbierto(false);
              setErrorUi("");
            }}
            style={{
              height: 38,
              padding: "0 16px",
              borderRadius: "var(--radius-pill)",
              border: "none",
              backgroundColor: "var(--color-primary)",
              color: "#FFFFFF",
              fontFamily: "var(--font-button)",
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Plus size={15} />
            Nueva sección
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {Array.from({ length: maxGrados }, (_, i) => i + 1).map((g) => {
          const on = grado === g;
          return (
            <button
              key={g}
              type="button"
              onClick={() => {
                setGrado(g);
                setSeccionSelId(null);
                setConfirmarEliminar(false);
              }}
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
              {g}.° grado
            </button>
          );
        })}
      </div>

      {errorUi ? (
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
          {errorUi}
        </div>
      ) : null}

      {formAbierto ? (
        <section
          style={{
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--color-primary)",
            borderRadius: "var(--radius-xl)",
            padding: "18px 20px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <h3 style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: 16 }}>
            Nueva sección · {grado}.° grado de {nivel}
          </h3>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {letrasLibres.map((l) => {
              const on = l === letraActiva;
              return (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLetraElegida(l)}
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    border: `1px solid ${on ? "var(--color-primary)" : "var(--border-subtle)"}`,
                    backgroundColor: on ? "var(--color-primary)" : "var(--bg-surface)",
                    color: on ? "#FFFFFF" : "var(--text-main)",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {l}
                </button>
              );
            })}
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 12,
            }}
          >
            <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13 }}>
              Tutor(a)
              <select
                value={tutorNuevo || docentesOpts[0] || ""}
                onChange={(e) => setTutorNuevo(e.target.value)}
                style={{
                  height: 38,
                  border: "1px solid var(--border-input)",
                  borderRadius: 10,
                  padding: "0 10px",
                }}
              >
                {docentesOpts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13 }}>
              Auxiliar
              <select
                value={auxNuevo || auxOpts[0] || ""}
                onChange={(e) => setAuxNuevo(e.target.value)}
                style={{
                  height: 38,
                  border: "1px solid var(--border-input)",
                  borderRadius: 10,
                  padding: "0 10px",
                }}
              >
                {auxOpts.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button
              type="button"
              onClick={() => setFormAbierto(false)}
              style={{
                height: 36,
                padding: "0 14px",
                border: "1px solid var(--color-primary)",
                borderRadius: "var(--radius-pill)",
                backgroundColor: "var(--bg-surface)",
                color: "var(--color-primary)",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={!letraActiva || crearMutation.isPending}
              onClick={() => void manejarCrearSeccion()}
              style={{
                height: 36,
                padding: "0 16px",
                border: "none",
                borderRadius: "var(--radius-pill)",
                backgroundColor: "var(--color-primary)",
                color: "#FFFFFF",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Crear sección {grado}.° {letraActiva}
            </button>
          </div>
        </section>
      ) : null}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 190px), 1fr))",
          gap: 12,
        }}
      >
        {secciones.map((sec) => {
          const on = sec.id === seccionSelId;
          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => {
                setSeccionSelId(on ? null : sec.id);
                setConfirmarEliminar(false);
              }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 8,
                padding: "14px 16px",
                borderRadius: "var(--radius-xl)",
                border: `1px solid ${on ? "var(--color-primary)" : "var(--border-card)"}`,
                backgroundColor: on ? "var(--color-primary-light)" : "var(--bg-surface)",
                textAlign: "left",
                cursor: "pointer",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    backgroundColor: on ? "var(--color-primary)" : "#1E293B",
                    color: "#FFFFFF",
                    fontWeight: 700,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {sec.letra}
                </span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{sec.nombre}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    {sec.cantidad_estudiantes} estudiantes
                  </div>
                </div>
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: sec.tutor === "Sin asignar" ? "#B45309" : "var(--text-muted)",
                }}
              >
                {sec.tutor === "Sin asignar" ? "Sin tutor(a) asignado" : sec.tutor}
              </div>
            </button>
          );
        })}
      </div>

      {seccionSel ? (
        <section
          style={{
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-card)",
            borderRadius: "var(--radius-xl)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid var(--border-subtle)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: 18 }}>
                {seccionSel.nombre} · {seccionSel.nivel}
              </h3>
              <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
                Tutor(a): {seccionSel.tutor} · Auxiliar: {seccionSel.auxiliar} ·{" "}
                {seccionSel.cantidad_estudiantes} estudiantes
              </div>
            </div>
            <button
              type="button"
              onClick={() => setConfirmarEliminar(true)}
              style={{
                height: 32,
                padding: "0 12px",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-pill)",
                backgroundColor: "var(--bg-surface)",
                color: "#991B1B",
                fontWeight: 600,
                fontSize: 12,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Trash2 size={13} />
              Eliminar sección
            </button>
          </div>

          {confirmarEliminar ? (
            <div
              style={{
                padding: "14px 20px",
                backgroundColor: seccionSel.cantidad_estudiantes > 0 ? "#FFFBEB" : "#FEF2F2",
                color: seccionSel.cantidad_estudiantes > 0 ? "#92400E" : "#991B1B",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                flexWrap: "wrap",
                fontSize: 13,
              }}
            >
              <span>
                {seccionSel.cantidad_estudiantes > 0
                  ? `No se puede eliminar ${seccionSel.nombre}: tiene ${seccionSel.cantidad_estudiantes} estudiantes. Muévelos o quítalos primero.`
                  : `¿Eliminar la sección ${seccionSel.nombre}? Esta acción queda en la bitácora.`}
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setConfirmarEliminar(false)}
                  style={{
                    height: 32,
                    padding: "0 12px",
                    border: "1px solid var(--color-primary)",
                    borderRadius: "var(--radius-pill)",
                    backgroundColor: "#FFFFFF",
                    color: "var(--color-primary)",
                    fontWeight: 600,
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  Cancelar
                </button>
                {seccionSel.cantidad_estudiantes === 0 ? (
                  <button
                    type="button"
                    disabled={eliminarMutation.isPending}
                    onClick={() => void manejarEliminarSeccion()}
                    style={{
                      height: 32,
                      padding: "0 14px",
                      border: "none",
                      borderRadius: "var(--radius-pill)",
                      backgroundColor: "#991B1B",
                      color: "#FFFFFF",
                      fontWeight: 600,
                      fontSize: 12,
                      cursor: "pointer",
                    }}
                  >
                    Confirmar eliminación
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}

          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid var(--border-subtle)",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 12,
            }}
          >
            <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12 }}>
              Tutor(a) de la sección
              <select
                value={seccionSel.tutor}
                onChange={(e) => void manejarCambiarPersonal("tutor", e.target.value)}
                style={{
                  height: 36,
                  border: "1px solid var(--border-input)",
                  borderRadius: 10,
                  padding: "0 10px",
                }}
              >
                <option value="Sin asignar">Sin asignar</option>
                {docentesOpts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12 }}>
              Auxiliar · registra la asistencia
              <select
                value={seccionSel.auxiliar}
                onChange={(e) => void manejarCambiarPersonal("auxiliar", e.target.value)}
                style={{
                  height: 36,
                  border: "1px solid var(--border-input)",
                  borderRadius: 10,
                  padding: "0 10px",
                }}
              >
                <option value="Sin asignar">Sin asignar</option>
                {auxOpts.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {renderPanelNomina ? (
            <div style={{ padding: 16 }}>
              {renderPanelNomina({
                seccionId: seccionSel.id,
                seccionNombre: seccionSel.nombre,
                nivel: seccionSel.nivel,
                grado: seccionSel.grado,
                poolAbierto,
                onCerrarPool: () => setPoolAbierto(false),
                onCambioNomina: () => void refrescarSecciones(),
              })}
            </div>
          ) : null}
        </section>
      ) : poolAbierto && renderPanelNomina ? (
        renderPanelNomina({
          seccionId: null,
          poolAbierto,
          onCerrarPool: () => setPoolAbierto(false),
          onCambioNomina: () => void refrescarSecciones(),
        })
      ) : null}
    </div>
  );
}
