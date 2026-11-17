// Spec: evaluacion · Cuadrícula de criterios K1..K4, llenado masivo y nota del día
import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { EstudianteSeccionOut, SesionClaseOut } from "../../../api/generated/model";
import { FichaClaseCuadricula } from "../componentes/fichaClaseCuadricula";

const ESTUDIANTES: EstudianteSeccionOut[] = [
  { indice: 0, codigo: "05120001", nombre: "Quispe Huamán, Luis Ángel", iniciales: "LQ", observaciones_total: 0 },
  { indice: 1, codigo: "05120002", nombre: "Cárdenas Rojas, Diego", iniciales: "DC", observaciones_total: 0 },
];

const SESION_BASE: SesionClaseOut = {
  id: "3Bs16",
  competencia: "C2",
  capacidad_idx: 3,
  tema: "Pendiente y razón de cambio",
  evidencia: "Explicación de la pendiente",
  fecha: "12 nov",
  criterios: [
    "Plantea una afirmación",
    "La justifica con ejemplos",
    "Usa propiedades para sustentarla",
    "Identifica errores en otros razonamientos",
  ],
  notas_por_estudiante: {
    "0": ["AD", "A", "", ""],
    "1": ["", "", "", ""],
  },
  ajustes_manuales: {},
  estado: "pendiente",
};

function EnvoltorioFicha({
  onPublicar,
  onGuardarBorrador,
}: {
  onPublicar: (sesionId: string) => void;
  onGuardarBorrador: (sesionId: string) => void;
}) {
  const [sesion, setSesion] = useState<SesionClaseOut>(SESION_BASE);

  return (
    <FichaClaseCuadricula
      sesion={sesion}
      estudiantes={ESTUDIANTES}
      competenciaNombre="Regularidad, equivalencia y cambio"
      capacidadNombre="Argumenta afirmaciones sobre relaciones de cambio y equivalencia"
      onCambiarCriterio={(sesionId, estIdx, critIdx, valor) => {
        setSesion((prev) => {
          if (prev.id !== sesionId) return prev;
          const actual = [...(prev.notas_por_estudiante[String(estIdx)] ?? ["", "", "", ""])];
          actual[critIdx] = valor;
          return {
            ...prev,
            notas_por_estudiante: { ...prev.notas_por_estudiante, [String(estIdx)]: actual },
          };
        });
      }}
      onCompletarVacios={(sesionId, nivel) => {
        setSesion((prev) => {
          if (prev.id !== sesionId) return prev;
          const siguiente: Record<string, string[]> = { ...prev.notas_por_estudiante };
          for (const est of ESTUDIANTES) {
            const actual = [...(siguiente[String(est.indice)] ?? ["", "", "", ""])];
            siguiente[String(est.indice)] = actual.map((v) => (v ? v : nivel));
          }
          return { ...prev, notas_por_estudiante: siguiente };
        });
      }}
      onAjustarNotaDia={(sesionId, estIdx, valor) => {
        setSesion((prev) => {
          if (prev.id !== sesionId) return prev;
          const ajustes = { ...prev.ajustes_manuales };
          if (!valor) delete ajustes[String(estIdx)];
          else ajustes[String(estIdx)] = valor;
          return { ...prev, ajustes_manuales: ajustes };
        });
      }}
      onGuardarBorrador={onGuardarBorrador}
      onPublicarSesion={onPublicar}
    />
  );
}

describe("FichaClaseCuadricula", () => {
  it("carga K1..K4, permite edición individual, llenado masivo con A y AD, y actualiza pendientes", async () => {
    const user = userEvent.setup();
    const onGuardarBorrador = vi.fn();
    const onPublicar = vi.fn();

    render(<EnvoltorioFicha onGuardarBorrador={onGuardarBorrador} onPublicar={onPublicar} />);

    expect(screen.getByText(/K1 · Plantea una afirmación/i)).toBeInTheDocument();
    expect(screen.getByText(/2 estudiante\(s\) pendientes/i)).toBeInTheDocument();

    // Edita individualmente el criterio K3 de Luis Ángel
    await user.selectOptions(
      screen.getByLabelText("K3 · Quispe Huamán, Luis Ángel"),
      "B",
    );
    expect(screen.getByText(/2 estudiante\(s\) pendientes/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Guardar notas/i }));
    expect(onGuardarBorrador).toHaveBeenCalledWith("3Bs16");

    // Llenado masivo de vacíos con A completa los criterios faltantes y deja 0 pendientes
    await user.click(screen.getByRole("button", { name: /^Completar vacíos con A$/i }));
    expect(screen.getByText(/Todos completos/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Guardar y publicar/i }));
    expect(onPublicar).toHaveBeenCalledWith("3Bs16");
  });

  it("permite completar vacíos con AD masivo en un clic", async () => {
    const user = userEvent.setup();
    render(<EnvoltorioFicha onGuardarBorrador={vi.fn()} onPublicar={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: /Completar vacíos con AD/i }));
    expect(screen.getByText(/Todos completos/i)).toBeInTheDocument();
  });
});
