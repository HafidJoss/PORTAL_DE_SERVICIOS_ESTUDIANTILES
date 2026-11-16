import { Link } from "react-router-dom";

import type {
  DistribucionNivelItemOut,
  EntregaProximaOut,
  KpiInicioOut,
  NovedadItemOut,
} from "../../../api/generated/model";
import { BadgeNivel } from "../../../shared/components/BadgeNivel";
import { Card } from "../../../shared/components/Card";

interface VarianteResumenModulosProps {
  kpis: KpiInicioOut[];
  proximasEntregas: EntregaProximaOut[];
  novedades: NovedadItemOut[];
  distribucionNiveles: DistribucionNivelItemOut[];
}

/** Variante B del inicio: resumen modular con 4 KPIs, entregas, últimos avisos y niveles. */
export function VarianteResumenModulos({
  kpis,
  proximasEntregas,
  novedades,
  distribucionNiveles,
}: VarianteResumenModulosProps) {
  const ultimosCalificativos = novedades.filter((n) => n.tipo === "calificativo");
  const mensajesRecientes = novedades.filter(
    (n) => n.tipo === "mensaje" || n.tipo === "observacion" || n.tipo === "recordatorio",
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
          gap: 12,
        }}
      >
        {kpis.map((kpi) => (
          <Card key={kpi.clave} style={{ padding: 16 }}>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{kpi.etiqueta}</div>
            <div
              style={{
                fontFamily: "var(--font-heading)",
                fontWeight: 700,
                fontSize: 26,
                marginTop: 6,
                color: "var(--text-main)",
              }}
            >
              {kpi.valor}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{kpi.subtitulo}</div>
          </Card>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
          gap: 16,
        }}
      >
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 16, margin: 0 }}>
              Próximas entregas
            </h2>
            <Link to="/trabajos" style={{ fontSize: 13, color: "var(--color-primary)" }}>
              Ver todas
            </Link>
          </div>
          {proximasEntregas.length === 0 ? (
            <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)" }}>
              No tienes entregas pendientes.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {proximasEntregas.map((e) => (
                <div key={e.id} style={{ fontSize: 13 }}>
                  <div style={{ fontWeight: 600, color: "var(--text-main)" }}>{e.titulo}</div>
                  <div style={{ color: "var(--text-muted)", fontSize: 12 }}>
                    {e.curso} · {e.estado_etiqueta} ({e.fecha_entrega})
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 16, margin: 0 }}>
              Últimos calificativos
            </h2>
            <Link to="/calificaciones" style={{ fontSize: 13, color: "var(--color-primary)" }}>
              Ver notas
            </Link>
          </div>
          {ultimosCalificativos.length === 0 ? (
            <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)" }}>
              Sin calificativos recientes según tus preferencias de avisos.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {ultimosCalificativos.map((n) => (
                <div
                  key={n.id}
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-main)" }}>{n.titulo}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{n.curso}</div>
                  </div>
                  {n.nivel ? <BadgeNivel nivel={n.nivel} /> : null}
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 16, margin: 0 }}>
              Mensajes recientes
            </h2>
            <Link to="/mensajes" style={{ fontSize: 13, color: "var(--color-primary)" }}>
              Ir a mensajes
            </Link>
          </div>
          {mensajesRecientes.length === 0 ? (
            <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)" }}>
              No hay mensajes recientes visibles.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {mensajesRecientes.map((m) => (
                <div key={m.id}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-main)" }}>{m.titulo}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    {m.curso} · {m.detalle}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card>
        <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 16, margin: "0 0 14px" }}>
          Mis niveles · III Trimestre
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {distribucionNiveles.map((item) => (
            <div
              key={item.nivel}
              style={{ display: "flex", alignItems: "center", gap: 12 }}
            >
              <BadgeNivel nivel={item.nivel} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                  <span style={{ color: "var(--text-main)", fontWeight: 500 }}>{item.nombre}</span>
                  <span style={{ color: "var(--text-muted)" }}>
                    {item.cantidad} ({Math.round(item.porcentaje)}%)
                  </span>
                </div>
                <div
                  style={{
                    height: 8,
                    borderRadius: "var(--radius-pill)",
                    backgroundColor: "var(--bg-subtle)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${Math.min(100, Math.max(0, item.porcentaje))}%`,
                      height: "100%",
                      backgroundColor: "var(--color-primary)",
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
