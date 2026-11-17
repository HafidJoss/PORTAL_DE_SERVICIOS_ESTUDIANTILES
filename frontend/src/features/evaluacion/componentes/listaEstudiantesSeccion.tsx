import { MessageSquarePlus, Search } from "lucide-react";
import { useState, type FormEvent } from "react";

import type {
  EstudianteSeccionOut,
  ObservacionDocenteCreateIn,
  SesionClaseOut,
} from "../../../api/generated/model";
import { AvatarIniciales } from "../../../shared/componentes/avatarIniciales";
import { Boton } from "../../../shared/componentes/boton";
import { EstadoVacio } from "../../../shared/componentes/estadoVacio";
import { InsigniaNivel } from "../../../shared/componentes/insigniaNivel";
import { Tarjeta } from "../../../shared/componentes/tarjeta";
import { calcularNotaDelDia } from "../utilidades/calculoMediana";

interface ListaEstudiantesSeccionProps {
  estudiantes: readonly EstudianteSeccionOut[];
  sesiones: readonly SesionClaseOut[];
  onPublicarObservacion: (datos: ObservacionDocenteCreateIn) => Promise<void> | void;
  guardando?: boolean;
}

export function ListaEstudiantesSeccion({
  estudiantes,
  sesiones,
  onPublicarObservacion,
  guardando = false,
}: ListaEstudiantesSeccionProps) {
  const [busqueda, setBusqueda] = useState("");
  const [seleccionadoIdx, setSeleccionadoIdx] = useState<number | null>(null);
  const [tipo, setTipo] = useState<"Positiva" | "Por mejorar">("Positiva");
  const [texto, setTexto] = useState("");
  const [error, setError] = useState("");

  const sesionesRegistradas = sesiones.filter((s) => s.estado === "registrada");
  const ultimaSesion = sesionesRegistradas[sesionesRegistradas.length - 1];

  const filtrados = estudiantes.filter((e) => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return true;
    return e.nombre.toLowerCase().includes(q) || e.codigo.toLowerCase().includes(q);
  });

  async function manejarPublicar(evento: FormEvent) {
    evento.preventDefault();
    if (seleccionadoIdx === null) return;
    if (texto.trim().length < 5) {
      setError("La observación debe tener al menos 5 caracteres.");
      return;
    }
    setError("");
    await onPublicarObservacion({
      estudiante_idx: seleccionadoIdx,
      tipo,
      texto: texto.trim(),
    });
    setTexto("");
    setSeleccionadoIdx(null);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Tarjeta style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <Search size={18} color="var(--text-muted)" />
        <input
          type="search"
          placeholder="Buscar estudiante por nombre o código..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{
            flex: 1,
            height: 36,
            border: "none",
            outline: "none",
            backgroundColor: "transparent",
            color: "var(--text-main)",
            fontSize: 14,
          }}
        />
      </Tarjeta>

      {filtrados.length === 0 ? (
        <EstadoVacio
          titulo="Sin coincidencias"
          descripcion="No hay estudiantes que coincidan con tu búsqueda."
        />
      ) : (
        <Tarjeta style={{ padding: 0, overflow: "hidden" }}>
          {filtrados.map((est) => {
            const key = String(est.indice);
            const ultimoNivel = ultimaSesion
              ? calcularNotaDelDia(
                  ultimaSesion.notas_por_estudiante[key] ?? [],
                  ultimaSesion.ajustes_manuales[key],
                )
              : "";
            const abierto = seleccionadoIdx === est.indice;

            return (
              <div
                key={est.codigo}
                style={{
                  padding: "12px 18px",
                  borderBottom: "1px solid var(--border-subtle)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <AvatarIniciales nombre={est.nombre} iniciales={est.iniciales} size={36} inverted />
                  <div style={{ flex: 1, minWidth: 180 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{est.nombre}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      Código {est.codigo} · {est.observaciones_total} observación(es)
                    </div>
                  </div>
                  <InsigniaNivel nivel={ultimoNivel || "—"} />
                  <Boton
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSeleccionadoIdx(abierto ? null : est.indice);
                      setError("");
                    }}
                  >
                    <MessageSquarePlus size={14} /> Nueva observación
                  </Boton>
                </div>

                {abierto ? (
                  <form
                    onSubmit={manejarPublicar}
                    style={{
                      padding: 12,
                      borderRadius: "var(--radius-md)",
                      backgroundColor: "var(--bg-subtle)",
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                      <span style={{ fontSize: 12, fontWeight: 600 }}>Tipo:</span>
                      {(["Positiva", "Por mejorar"] as const).map((opcion) => (
                        <button
                          key={opcion}
                          type="button"
                          onClick={() => setTipo(opcion)}
                          style={{
                            height: 30,
                            padding: "0 12px",
                            borderRadius: "var(--radius-pill)",
                            border: `1px solid ${tipo === opcion ? "var(--color-primary)" : "var(--border-input)"}`,
                            backgroundColor:
                              tipo === opcion ? "var(--color-primary-light)" : "var(--bg-surface)",
                            color: tipo === opcion ? "var(--color-primary)" : "var(--text-main)",
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          {opcion}
                        </button>
                      ))}
                    </div>

                    <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12 }}>
                      <span>Detalle de observación (visible para estudiante y apoderado)</span>
                      <textarea
                        rows={2}
                        value={texto}
                        onChange={(e) => setTexto(e.target.value)}
                        placeholder="Describe el avance o recomendación..."
                        style={{
                          width: "100%",
                          padding: 10,
                          borderRadius: "var(--radius-md)",
                          border: "1px solid var(--border-input)",
                        }}
                      />
                    </label>

                    {error ? (
                      <div role="alert" style={{ color: "var(--status-danger)", fontSize: 12 }}>
                        {error}
                      </div>
                    ) : null}

                    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                      <Boton
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSeleccionadoIdx(null)}
                      >
                        Cancelar
                      </Boton>
                      <Boton type="submit" size="sm" disabled={guardando}>
                        Publicar observación
                      </Boton>
                    </div>
                  </form>
                ) : null}
              </div>
            );
          })}
        </Tarjeta>
      )}
    </div>
  );
}
