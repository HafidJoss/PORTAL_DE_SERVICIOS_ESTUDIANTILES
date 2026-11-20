import { useState, type ReactNode } from "react";

import { BannerPortada } from "../../../shared/componentes/bannerPortada";
import { PestanaAsignacionesAdmin } from "../componentes/pestanaAsignacionesAdmin";
import { PestanaAsignaturasAdmin } from "../componentes/pestanaAsignaturasAdmin";
import {
  PestanaSeccionesAdmin,
  type PropsPanelNominaSeccion,
} from "../componentes/pestanaSeccionesAdmin";

type PestanaCatalogo = "secciones" | "asignaturas" | "asignaciones";

const METADATOS_PESTANA: Record<PestanaCatalogo, { titulo: string; subtitulo: string }> = {
  secciones: {
    titulo: "Secciones",
    subtitulo: "Niveles, grados y secciones del año escolar 2026, con su tutor(a) y auxiliar.",
  },
  asignaturas: {
    titulo: "Asignaturas y competencias",
    subtitulo:
      "Catálogo oficial de asignaturas por nivel y sus competencias, más las competencias transversales.",
  },
  asignaciones: {
    titulo: "Asignaciones docentes",
    subtitulo: "Docentes titulares y suplentes por asignatura en cada sección.",
  },
};

export function CatalogoAdminVista({
  renderPanelNomina,
}: {
  renderPanelNomina?: (props: PropsPanelNominaSeccion) => ReactNode;
} = {}) {
  const [pestana, setPestana] = useState<PestanaCatalogo>("secciones");
  const meta = METADATOS_PESTANA[pestana];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div
        style={{
          display: "flex",
          gap: 8,
          borderBottom: "1px solid var(--border-subtle)",
          overflowX: "auto",
        }}
      >
        {(
          [
            ["secciones", "Secciones"],
            ["asignaturas", "Asignaturas y competencias"],
            ["asignaciones", "Asignaciones docentes"],
          ] as const
        ).map(([id, label]) => {
          const on = pestana === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setPestana(id)}
              style={{
                height: 44,
                padding: "0 14px",
                background: "none",
                border: "none",
                borderBottom: `3px solid ${on ? "var(--color-primary)" : "transparent"}`,
                color: on ? "var(--color-primary)" : "var(--text-muted)",
                fontFamily: "var(--font-button)",
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      <BannerPortada titulo={meta.titulo} subtitulo={meta.subtitulo} />

      {pestana === "secciones" ? (
        <PestanaSeccionesAdmin renderPanelNomina={renderPanelNomina} />
      ) : null}
      {pestana === "asignaturas" ? <PestanaAsignaturasAdmin /> : null}
      {pestana === "asignaciones" ? <PestanaAsignacionesAdmin /> : null}
    </div>
  );
}
