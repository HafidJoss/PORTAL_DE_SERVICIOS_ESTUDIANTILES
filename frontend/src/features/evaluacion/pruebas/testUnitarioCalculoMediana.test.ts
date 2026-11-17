// Spec: evaluacion · Reglas puras de cálculo cualitativo CNEB, mediana, RF22 y CSV
import { describe, expect, it } from "vitest";

import {
  calcularMedianaCneb,
  calcularNivelCapacidad,
  calcularNotaDelDia,
  calcularSugerenciaCompetencia,
  contarDistribucionNiveles,
  requiereConclusionDescriptiva,
  validarCierreCompetencia,
} from "../utilidades/calculoMediana";
import { serializarRegistroAuxiliarCsv } from "../utilidades/exportadorCsvAuxiliar";

describe("calculoMediana (motor CNEB)", () => {
  it("calcula la mediana cualitativa excluyendo vacíos y usando el índice medio superior en empates", () => {
    expect(calcularMedianaCneb([])).toBe("");
    expect(calcularMedianaCneb(["", "NE", " "])).toBe("");
    expect(calcularMedianaCneb(["C", "C", "C"])).toBe("C");
    // Impar: [B, A, AD] -> A
    expect(calcularMedianaCneb(["AD", "B", "A"])).toBe("A");
    // Par [B, A]: sort [2, 3], floor(2/2)=1 -> A (criterio Portal Docente.dc.html)
    expect(calcularMedianaCneb(["B", "A"])).toBe("A");
    // Con valores vacíos o NE intercalados
    expect(calcularMedianaCneb(["A", "NE", "B", "A", ""])).toBe("A");
  });

  it("prioriza el ajuste manual en calcularNotaDelDia y usa la mediana cuando no hay ajuste", () => {
    expect(calcularNotaDelDia(["B", "B", "A", "A"])).toBe("A");
    expect(calcularNotaDelDia(["B", "B", "A", "A"], "AD")).toBe("AD");
    expect(calcularNotaDelDia(["", "", "", ""])).toBe("");
  });

  it("calcula el nivel por capacidad y sugerencia de competencia en modos mediana y ultimo", () => {
    const sesiones = [
      { id: "s1", competencia: "C2" as const, capacidad_idx: 0, estado: "registrada" as const, notas_por_estudiante: { "0": ["B", "B", "B", "B"] }, ajustes_manuales: {} },
      { id: "s2", competencia: "C2" as const, capacidad_idx: 0, estado: "registrada" as const, notas_por_estudiante: { "0": ["A", "A", "A", "A"] }, ajustes_manuales: {} },
      { id: "s3", competencia: "C2" as const, capacidad_idx: 2, estado: "registrada" as const, notas_por_estudiante: { "0": ["AD", "AD", "A", "A"] }, ajustes_manuales: {} },
      { id: "s4", competencia: "C2" as const, capacidad_idx: 2, estado: "pendiente" as const, notas_por_estudiante: { "0": ["C", "C", "C", "C"] }, ajustes_manuales: {} },
    ];

    expect(calcularNivelCapacidad(sesiones, "0", "C2", 0, "mediana")).toBe("A");
    expect(calcularNivelCapacidad(sesiones, "0", "C2", 0, "ultimo")).toBe("A");
    expect(calcularNivelCapacidad(sesiones, "0", "C2", 1, "mediana")).toBe("");
    expect(calcularSugerenciaCompetencia(sesiones, "0", "C2", "mediana")).toBe("AD");
    expect(calcularSugerenciaCompetencia(sesiones, "0", "C2", "ultimo")).toBe("AD");
  });

  it("valida RF22 diferenciando Primaria (B o C) y Secundaria (solo C)", () => {
    expect(requiereConclusionDescriptiva("B", "Primaria")).toBe(true);
    expect(requiereConclusionDescriptiva("C", "Primaria")).toBe(true);
    expect(requiereConclusionDescriptiva("A", "Primaria")).toBe(false);

    expect(requiereConclusionDescriptiva("B", "Secundaria")).toBe(false);
    expect(requiereConclusionDescriptiva("C", "Secundaria")).toBe(true);

    const errPrimaria = validarCierreCompetencia(
      [
        { estudiante_idx: 0, nivel: "B", conclusion: "Corto" },
        { estudiante_idx: 1, nivel: "", conclusion: "" },
      ],
      "Primaria",
    );
    expect(errPrimaria.valido).toBe(false);
    expect(errPrimaria.sinNivel).toBe(1);
    expect(errPrimaria.sinConclusion).toBe(1);

    const okSecundaria = validarCierreCompetencia(
      [
        { estudiante_idx: 0, nivel: "B", conclusion: "" },
        { estudiante_idx: 1, nivel: "C", conclusion: "Necesita reforzar planteamiento de ecuaciones." },
      ],
      "Secundaria",
    );
    expect(okSecundaria.valido).toBe(true);
    expect(okSecundaria.sinNivel).toBe(0);
    expect(okSecundaria.sinConclusion).toBe(0);
  });

  it("resume la distribución de niveles AD/A/B/C y serializa CSV RFC 4180 con BOM UTF-8", () => {
    const dist = contarDistribucionNiveles(["AD", "A", "A", "B", "C", ""]);
    expect(dist.AD).toBe(1);
    expect(dist.A).toBe(2);
    expect(dist.B).toBe(1);
    expect(dist.C).toBe(1);

    const csv = serializarRegistroAuxiliarCsv(
      ["Estudiante", "Cap. 1", "Observación"],
      [
        ['Quispe, "Luis"', "AD", "Buen avance;\nconstante"],
        ["Cárdenas, Diego", "A", "Correcto"],
      ],
    );
    expect(csv.startsWith("\uFEFF")).toBe(true);
    expect(csv).toContain('"Quispe, ""Luis""";AD;"Buen avance;\nconstante"');
  });
});
