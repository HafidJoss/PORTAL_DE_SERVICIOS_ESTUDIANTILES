import { Link } from "react-router-dom";

import type { EntregaProximaOut, NovedadItemOut } from "../../../api/generated/model";
import { InsigniaNivel } from "../../../shared/componentes/insigniaNivel";
import { Tarjeta } from "../../../shared/componentes/tarjeta";
import { EstadoVacio } from "../../../shared/componentes/estadoVacio";
import { agruparNovedadesPorBloque } from "../utilidades/filtrosSeguimiento";

interface VarianteFeedNovedadesProps {
  novedades: NovedadItemOut[];
  proximasEntregas: EntregaProximaOut[];
}

/** Variante A del inicio: feed cronológico de novedades + columna lateral de pendientes. */
export function VarianteFeedNovedades({
  novedades,
  proximasEntregas,
}: VarianteFeedNovedadesProps) {
  const bloques = agruparNovedadesPorBloque(novedades);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
        gap: 20,
        alignItems: "start",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {bloques.length === 0 ? (
          <EstadoVacio
            titulo="No tienes novedades recientes"
            descripcion="Cuando tus docentes publiquen calificativos, recordatorios o avisos aparecerán aquí."
          />
        ) : (
          bloques.map((bloque) => (
            <section key={bloque.grupo} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <h2
                style={{
                  fontFamily: "var(--font-button)",
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "var(--text-muted)",
                  margin: 0,
                }}
              >
                {bloque.grupo}
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {bloque.items.map((item) => (
                  <Tarjeta key={item.id} style={{ padding: "14px 18px" }}>
                    <Link
                      to={item.ruta_destino}
                      style={{
                        textDecoration: "none",
                        color: "inherit",
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        gap: 12,
                      }}
                    >
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>
                          {item.etiqueta} · {item.curso} · {item.hora}
                        </div>
                        <div
                          style={{
                            fontFamily: "var(--font-heading)",
                            fontWeight: 600,
                            fontSize: 14,
                            color: "var(--text-main)",
                          }}
                        >
                          {item.titulo}
                        </div>
                        <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text-muted)" }}>
                          {item.detalle}
                        </p>
                      </div>
                      {item.nivel ? <InsigniaNivel nivel={item.nivel} /> : null}
                    </Link>
                  </Tarjeta>
                ))}
              </div>
            </section>
          ))
        )}
      </div>

      <aside style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Tarjeta>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 16, margin: 0 }}>
              Próximas entregas
            </h2>
            <Link to="/trabajos" style={{ fontSize: 13, fontWeight: 600, color: "var(--color-primary)" }}>
              Ver todo
            </Link>
          </div>
          {proximasEntregas.length === 0 ? (
            <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)" }}>
              No tienes entregas pendientes próximas.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {proximasEntregas.map((entrega) => (
                <Link
                  key={entrega.id}
                  to="/trabajos"
                  style={{
                    textDecoration: "none",
                    color: "inherit",
                    paddingBottom: 10,
                    borderBottom: "1px solid var(--border-card)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: entrega.urgente ? "var(--color-primary)" : "var(--text-muted)",
                    }}
                  >
                    {entrega.estado_etiqueta} · {entrega.fecha_entrega}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 500, color: "var(--text-main)" }}>
                    {entrega.titulo}
                  </span>
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{entrega.curso}</span>
                </Link>
              ))}
            </div>
          )}
        </Tarjeta>

        <Tarjeta>
          <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 16, margin: "0 0 10px" }}>
            Accesos rápidos
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Link to="/asistencia" style={{ fontSize: 14, fontWeight: 500, color: "var(--color-primary)" }}>
              Revisar mi asistencia del mes
            </Link>
            <Link to="/cursos" style={{ fontSize: 14, fontWeight: 500, color: "var(--color-primary)" }}>
              Explorar mis cursos
            </Link>
            <Link to="/libreta" style={{ fontSize: 14, fontWeight: 500, color: "var(--color-primary)" }}>
              Consultar libreta de notas
            </Link>
          </div>
        </Tarjeta>
      </aside>
    </div>
  );
}
