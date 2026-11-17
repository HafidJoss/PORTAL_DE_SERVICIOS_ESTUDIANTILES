import { Plus, Send } from "lucide-react";
import { useState, type FormEvent } from "react";

import type {
  ActividadDocenteCreateIn,
  ActividadDocenteOut,
  CompetenciaCatalogoOut,
} from "../../../api/generated/model";
import type { CodigoCompetencia } from "../utilidades/calculoMediana";
import { Boton } from "../../../shared/componentes/boton";
import { Tarjeta } from "../../../shared/componentes/tarjeta";

interface FormularioActividadDocenteProps {
  actividades: readonly ActividadDocenteOut[];
  competencias: readonly CompetenciaCatalogoOut[];
  onCrearActividad: (datos: ActividadDocenteCreateIn) => Promise<void> | void;
  onPublicarBorrador: (actividadId: string) => Promise<void> | void;
  guardando?: boolean;
}

export function FormularioActividadDocente({
  actividades,
  competencias,
  onCrearActividad,
  onPublicarBorrador,
  guardando = false,
}: FormularioActividadDocenteProps) {
  const [abierto, setAbierto] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [fechaEntrega, setFechaEntrega] = useState("2026-11-26");
  const [competencia, setCompetencia] = useState<CodigoCompetencia>(
    competencias[0]?.codigo ?? "C1",
  );
  const [descripcion, setDescripcion] = useState("");
  const [filtroComp, setFiltroComp] = useState<CodigoCompetencia | "todas">("todas");
  const [error, setError] = useState("");

  async function enviarActividad(estado: "borrador" | "publicada", evento?: FormEvent) {
    if (evento) evento.preventDefault();
    if (titulo.trim().length < 4) {
      setError("El título de la actividad debe tener al menos 4 caracteres.");
      return;
    }
    if (!fechaEntrega.trim()) {
      setError("Indica la fecha de entrega.");
      return;
    }
    setError("");
    await onCrearActividad({
      titulo: titulo.trim(),
      fecha_entrega: fechaEntrega.trim(),
      competencia,
      descripcion: descripcion.trim(),
      estado,
    });
    setTitulo("");
    setDescripcion("");
    setAbierto(false);
  }

  const visibles = actividades.filter(
    (act) => filtroComp === "todas" || act.competencia === filtroComp,
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Tarjeta
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <button
            type="button"
            onClick={() => setFiltroComp("todas")}
            style={{
              height: 32,
              padding: "0 12px",
              borderRadius: "var(--radius-pill)",
              border: `1px solid ${filtroComp === "todas" ? "var(--color-primary)" : "var(--border-subtle)"}`,
              backgroundColor:
                filtroComp === "todas" ? "var(--color-primary-light)" : "var(--bg-surface)",
              color: filtroComp === "todas" ? "var(--color-primary)" : "var(--text-secondary)",
              fontWeight: 600,
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            Todas ({actividades.length})
          </button>
          {competencias.map((c) => (
            <button
              key={c.codigo}
              type="button"
              onClick={() => setFiltroComp(c.codigo)}
              style={{
                height: 32,
                padding: "0 12px",
                borderRadius: "var(--radius-pill)",
                border: `1px solid ${filtroComp === c.codigo ? "var(--color-primary)" : "var(--border-subtle)"}`,
                backgroundColor:
                  filtroComp === c.codigo ? "var(--color-primary-light)" : "var(--bg-surface)",
                color: filtroComp === c.codigo ? "var(--color-primary)" : "var(--text-secondary)",
                fontWeight: 600,
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              {c.codigo}
            </button>
          ))}
        </div>

        <Boton type="button" size="sm" onClick={() => setAbierto((prev) => !prev)}>
          <Plus size={15} /> {abierto ? "Cerrar formulario" : "Nueva actividad"}
        </Boton>
      </Tarjeta>

      {abierto ? (
        <Tarjeta>
          <form
            onSubmit={(e) => void enviarActividad("publicada", e)}
            style={{ display: "flex", flexDirection: "column", gap: 12 }}
          >
            <h3 style={{ margin: 0, fontSize: 16, fontFamily: "var(--font-heading)" }}>
              Registrar actividad (sin subida de archivos)
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
                gap: 10,
              }}
            >
              <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13 }}>
                <span>Título de la actividad</span>
                <input
                  type="text"
                  placeholder="Ej. Ficha de ecuaciones cuadráticas"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  style={{
                    height: 38,
                    padding: "0 10px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-input)",
                  }}
                />
              </label>

              <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13 }}>
                <span>Fecha de entrega</span>
                <input
                  type="date"
                  value={fechaEntrega}
                  onChange={(e) => setFechaEntrega(e.target.value)}
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
                  onChange={(e) => setCompetencia(e.target.value as CodigoCompetencia)}
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
            </div>

            <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13 }}>
              <span>Indicaciones</span>
              <textarea
                rows={2}
                placeholder="Indicaciones claras para el estudiante..."
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                style={{
                  padding: 10,
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-input)",
                }}
              />
            </label>

            {error ? (
              <div role="alert" style={{ color: "var(--status-danger)", fontSize: 13 }}>
                {error}
              </div>
            ) : null}

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
              <Boton
                type="button"
                variant="outline"
                disabled={guardando}
                onClick={() => void enviarActividad("borrador")}
              >
                Guardar borrador
              </Boton>
              <Boton type="submit" disabled={guardando}>
                <Send size={14} /> Publicar actividad
              </Boton>
            </div>
          </form>
        </Tarjeta>
      ) : null}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {visibles.map((act) => (
          <Tarjeta
            key={act.id}
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ flex: "1 1 260px", minWidth: 0 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: "var(--radius-pill)",
                    backgroundColor: "var(--bg-subtle)",
                    color: "var(--text-secondary)",
                  }}
                >
                  {act.competencia}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: "var(--radius-pill)",
                    backgroundColor:
                      act.estado === "borrador"
                        ? "var(--status-warning-bg)"
                        : "var(--status-success-bg)",
                    color:
                      act.estado === "borrador"
                        ? "var(--status-warning-fg)"
                        : "var(--status-success-fg)",
                  }}
                >
                  {act.estado === "borrador" ? "Borrador" : "Publicada"}
                </span>
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  Entrega: {act.fecha_entrega}
                </span>
              </div>
              <div style={{ fontWeight: 600, fontSize: 15, marginTop: 4 }}>{act.titulo}</div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>
                {act.descripcion}
              </div>
            </div>

            {act.estado === "borrador" ? (
              <Boton
                type="button"
                size="sm"
                disabled={guardando}
                onClick={() => void onPublicarBorrador(act.id)}
              >
                Publicar
              </Boton>
            ) : null}
          </Tarjeta>
        ))}
      </div>
    </div>
  );
}
