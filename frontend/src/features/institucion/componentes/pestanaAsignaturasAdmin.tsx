import { useState } from "react";
import { BookOpen, ChevronDown, ChevronUp } from "lucide-react";

import { useListarAsignaturasCnebApiV1InstitucionAsignaturasGet } from "../../../api/generated/institucion/institucion";
import type { CatalogoAsignaturasOutNivel } from "../../../api/generated/model";

const NIVELES: readonly CatalogoAsignaturasOutNivel[] = [
  "Secundaria",
  "Primaria",
  "Transversales",
];

export function PestanaAsignaturasAdmin() {
  const [nivel, setNivel] = useState<CatalogoAsignaturasOutNivel>("Secundaria");
  const [abierta, setAbierta] = useState<string | null>(null);

  const consulta = useListarAsignaturasCnebApiV1InstitucionAsignaturasGet({ nivel });
  const datos = consulta.data?.status === 200 ? consulta.data.data : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 1040 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {NIVELES.map((nv) => {
          const on = nivel === nv;
          return (
            <button
              key={nv}
              type="button"
              onClick={() => {
                setNivel(nv);
                setAbierta(null);
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

      {datos?.asignaturas.map((asig) => {
        const esAbierta = abierta === asig.nombre;
        const esTransversal = nivel === "Transversales";
        return (
          <section
            key={asig.nombre}
            style={{
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border-card)",
              borderRadius: "var(--radius-xl)",
              overflow: "hidden",
            }}
          >
            <button
              type="button"
              onClick={() => setAbierta(esAbierta ? null : asig.nombre)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "14px 20px",
                border: "none",
                background: "transparent",
                textAlign: "left",
                cursor: "pointer",
              }}
            >
              <span
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  backgroundColor: esTransversal ? "#EFF6FF" : "#FEF2F2",
                  color: esTransversal ? "#1D4ED8" : "#C81E1E",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <BookOpen size={18} />
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontSize: 14, fontWeight: 600 }}>
                  {asig.nombre}
                </span>
                <span style={{ display: "block", fontSize: 12, color: "var(--text-muted)" }}>
                  {asig.competencias.length}{" "}
                  {asig.competencias.length === 1 ? "competencia" : "competencias"} ·{" "}
                  {esTransversal ? "no pertenecen a un área" : nivel}
                </span>
              </span>
              {esAbierta ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {esAbierta ? (
              <div
                style={{
                  padding: "0 20px 14px 74px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                {asig.competencias.map((c) => (
                  <div
                    key={c.codigo}
                    style={{
                      display: "flex",
                      gap: 10,
                      padding: "8px 12px",
                      borderRadius: 12,
                      backgroundColor: "var(--bg-subtle)",
                      fontSize: 13,
                    }}
                  >
                    <span style={{ fontWeight: 700, color: "var(--color-primary)" }}>
                      {c.codigo}
                    </span>
                    <span>{c.descripcion}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
