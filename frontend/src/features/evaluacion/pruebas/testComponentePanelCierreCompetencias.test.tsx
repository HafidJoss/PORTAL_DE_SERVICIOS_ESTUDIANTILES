// Spec: evaluacion · Cierre trimestral RF22 y observaciones por estudiante RF24
import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type {
  CompetenciaCatalogoOut,
  EstudianteSeccionOut,
  NivelGuardadoDocenteOut,
  SesionClaseOut,
} from "../../../api/generated/model";
import { ListaEstudiantesSeccion } from "../componentes/listaEstudiantesSeccion";
import { PanelCierreCompetencias } from "../componentes/panelCierreCompetencias";

const COMPETENCIAS: CompetenciaCatalogoOut[] = [
  {
    codigo: "C1",
    nombre: "Resuelve problemas de cantidad",
    capacidades: ["Traduce", "Comunica", "Usa estrategias", "Argumenta"],
  },
];

const ESTUDIANTES: EstudianteSeccionOut[] = [
  { indice: 0, codigo: "05120001", nombre: "Quispe Huamán, Luis Ángel", iniciales: "LQ", observaciones_total: 0 },
  { indice: 1, codigo: "05120002", nombre: "Cárdenas Rojas, Diego", iniciales: "DC", observaciones_total: 1 },
];

const SESIONES: SesionClaseOut[] = [
  {
    id: "s1",
    competencia: "C1",
    capacidad_idx: 0,
    tema: "Porcentajes",
    evidencia: "Ficha",
    fecha: "9 oct",
    criterios: ["K1", "K2", "K3", "K4"],
    notas_por_estudiante: {
      "0": ["C", "C", "C", "C"],
      "1": ["A", "A", "AD", "A"],
    },
    ajustes_manuales: {},
    estado: "registrada",
  },
];

function EnvoltorioCierre({
  onConfirmar,
  nivelEducativo = "Secundaria",
}: {
  onConfirmar: (comp: string) => void;
  nivelEducativo?: "Primaria" | "Secundaria";
}) {
  const [cierres, setCierres] = useState<NivelGuardadoDocenteOut[]>([
    {
      competencia: "C1",
      confirmada: false,
      niveles_por_estudiante: { "0": "", "1": "" },
      conclusiones_por_estudiante: { "0": "", "1": "" },
    },
  ]);

  return (
    <PanelCierreCompetencias
      competencias={COMPETENCIAS}
      estudiantes={ESTUDIANTES}
      sesiones={SESIONES}
      cierres={cierres}
      nivelEducativo={nivelEducativo}
      onCambiarNivel={(comp, estIdx, nivel) => {
        setCierres((prev) =>
          prev.map((c) =>
            c.competencia === comp
              ? { ...c, niveles_por_estudiante: { ...c.niveles_por_estudiante, [String(estIdx)]: nivel } }
              : c,
          ),
        );
      }}
      onCambiarConclusion={(comp, estIdx, texto) => {
        setCierres((prev) =>
          prev.map((c) =>
            c.competencia === comp
              ? { ...c, conclusiones_por_estudiante: { ...c.conclusiones_por_estudiante, [String(estIdx)]: texto } }
              : c,
          ),
        );
      }}
      onAplicarSugeridos={(comp, mapa) => {
        setCierres((prev) =>
          prev.map((c) =>
            c.competencia === comp ? { ...c, niveles_por_estudiante: { ...c.niveles_por_estudiante, ...mapa } } : c,
          ),
        );
      }}
      onConfirmarCompetencia={async (comp) => {
        onConfirmar(comp);
      }}
    />
  );
}

describe("PanelCierreCompetencias y ListaEstudiantesSeccion", () => {
  it("muestra sugerencia por mediana, aplica sugeridos en un clic y bloquea confirmación sin conclusión obligatoria (RF22)", async () => {
    const user = userEvent.setup();
    const onConfirmar = vi.fn();

    render(<EnvoltorioCierre onConfirmar={onConfirmar} />);

    // Muestra el cálculo de sugerencia por mediana (C para Luis Ángel, A para Diego)
    expect(screen.getByText(/Sugerencia por mediana/i)).toBeInTheDocument();

    // Un clic adopta todos los niveles sugeridos
    await user.click(screen.getByRole("button", { name: /Usar sugeridos/i }));

    // Intentar confirmar con nivel C y conclusión vacía debe bloquearse (RF22)
    await user.click(screen.getByRole("button", { name: /Confirmar niveles/i }));
    expect(onConfirmar).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent(/conclusión descriptiva/i);

    // Completar conclusión < 10 caracteres sigue bloqueado
    const inputConcl = screen.getByLabelText("Conclusión · Quispe Huamán, Luis Ángel");
    await user.type(inputConcl, "Corto");
    await user.click(screen.getByRole("button", { name: /Confirmar niveles/i }));
    expect(onConfirmar).not.toHaveBeenCalled();

    // Completar conclusión >= 10 caracteres habilita confirmación
    await user.clear(inputConcl);
    await user.type(inputConcl, "Requiere apoyo continuo en lectura y resolución.");
    await user.click(screen.getByRole("button", { name: /Confirmar niveles/i }));
    expect(onConfirmar).toHaveBeenCalledWith("C1");
  });

  it("filtra la nómina y valida longitud mínima en Publicar observación (RF24)", async () => {
    const user = userEvent.setup();
    const onPublicarObs = vi.fn();

    render(
      <ListaEstudiantesSeccion
        estudiantes={ESTUDIANTES}
        sesiones={SESIONES}
        onPublicarObservacion={onPublicarObs}
      />,
    );

    await user.type(screen.getByPlaceholderText(/Buscar estudiante/i), "Quispe");
    expect(screen.getByText("Quispe Huamán, Luis Ángel")).toBeInTheDocument();
    expect(screen.queryByText("Cárdenas Rojas, Diego")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Nueva observación/i }));
    await user.click(screen.getByRole("button", { name: /Publicar observación/i }));
    expect(onPublicarObs).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent(/al menos 5 caracteres/i);

    await user.type(
      screen.getByLabelText(/Detalle de observación/i),
      "Mostró avance notable resolviendo problemas.",
    );
    await user.click(screen.getByRole("button", { name: /Publicar observación/i }));
    expect(onPublicarObs).toHaveBeenCalledWith({
      estudiante_idx: 0,
      tipo: "Positiva",
      texto: "Mostró avance notable resolviendo problemas.",
    });
  });
});
