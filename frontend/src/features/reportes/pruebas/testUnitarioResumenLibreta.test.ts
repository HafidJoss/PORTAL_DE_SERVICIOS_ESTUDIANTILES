// Spec: reportes · Requirement: Consulta de libretas trimestrales y estado de publicación (RF27, RF28, HU06)
// Spec: reportes · Requirement: Descarga segura de libreta en PDF mediante enlace temporal firmado (RF15, RC05, ADR-002, AC01)
import { describe, expect, it } from "vitest";

import type { TrimestreLibretaOut } from "../../../api/generated/model";
import {
  contarPublicadas,
  etiquetaSituacionFinal,
  formatearMinutosVigencia,
  seleccionarTrimestreInicial,
} from "../utilidades/resumenLibreta";

const TRIMESTRES_DEMO: TrimestreLibretaOut[] = [
  {
    trimestre_id: 1,
    nombre: "I Trimestre",
    rango_fechas: "9 mar – 29 may",
    publicada: true,
    fecha_publicacion: "2026-06-05",
    areas: [],
  },
  {
    trimestre_id: 2,
    nombre: "II Trimestre",
    rango_fechas: "1 jun – 11 sep",
    publicada: true,
    fecha_publicacion: "2026-09-11",
    areas: [],
  },
  {
    trimestre_id: 3,
    nombre: "III Trimestre",
    rango_fechas: "14 sep – 18 dic",
    publicada: false,
    fecha_publicacion: null,
    areas: [],
  },
];

describe("resumenLibreta", () => {
  it("cuenta publicadas y elige por defecto el ultimo trimestre publicado", () => {
    expect(contarPublicadas(TRIMESTRES_DEMO)).toEqual({ publicadas: 2, total: 3 });
    expect(seleccionarTrimestreInicial(TRIMESTRES_DEMO)).toBe(2);
    expect(
      seleccionarTrimestreInicial([{ ...TRIMESTRES_DEMO[2]!, publicada: false }]),
    ).toBe(3);
    expect(seleccionarTrimestreInicial([])).toBeNull();
  });

  it("interpreta situacion final PRO/PER/RR y convierte segundos de TTL a minutos", () => {
    expect(etiquetaSituacionFinal("PRO")).toBe("Promovido de grado");
    expect(etiquetaSituacionFinal("PER")).toBe("Permanece en el grado");
    expect(etiquetaSituacionFinal("RR")).toBe("Requiere recuperación");
    expect(formatearMinutosVigencia(900)).toBe(15);
    expect(formatearMinutosVigencia(60)).toBe(1);
  });
});
