// Spec: institucion · Requirement: Gestión del ciclo de vida de trimestres, publicación de libreta y reapertura excepcional (RF05, RF27, RF30)
import { describe, expect, it } from "vitest";

import {
  accionesDisponiblesTrimestre,
  etapasProgresoTrimestre,
  validarFormularioReapertura,
} from "../utilidades/reglasTrimestresAdmin";

describe("reglasTrimestresAdmin", () => {
  it("calcula las acciones disponibles según estado y publicación de libreta", () => {
    expect(accionesDisponiblesTrimestre("Aperturado", false).map((a) => a.tipo)).toEqual([
      "iniciar_evaluacion",
    ]);
    expect(accionesDisponiblesTrimestre("En Evaluación", false).map((a) => a.tipo)).toEqual([
      "cierre_preliminar",
    ]);
    expect(accionesDisponiblesTrimestre("Cierre Preliminar", false).map((a) => a.tipo)).toEqual([
      "cerrar",
    ]);
    expect(accionesDisponiblesTrimestre("Cerrado", false).map((a) => a.tipo)).toEqual([
      "publicar_libreta",
      "reabrir",
    ]);
    expect(accionesDisponiblesTrimestre("Cerrado", true).map((a) => a.tipo)).toEqual([
      "reabrir",
    ]);
  });

  it("construye el stepper de cuatro etapas marcando la actual y las completadas", () => {
    const etapas = etapasProgresoTrimestre("Cierre Preliminar");
    expect(etapas).toHaveLength(4);
    expect(etapas[0]).toMatchObject({ etiqueta: "Aperturado", completada: true, actual: false });
    expect(etapas[1]).toMatchObject({ etiqueta: "En Evaluación", completada: true, actual: false });
    expect(etapas[2]).toMatchObject({ etiqueta: "Cierre Preliminar", completada: true, actual: true });
    expect(etapas[3]).toMatchObject({ etiqueta: "Cerrado", completada: false, actual: false });
  });

  it("valida motivo mínimo de 15 caracteres y documento UGEL cuando el Acta Oficial fue emitida", () => {
    expect(validarFormularioReapertura("Corto", false, "")).toMatch(/15 caracteres/i);
    expect(
      validarFormularioReapertura(
        "Corrección del nivel de 2 estudiantes en 4.° C",
        false,
        "",
      ),
    ).toBe("");
    expect(
      validarFormularioReapertura(
        "Corrección del nivel de 2 estudiantes en 4.° C",
        true,
        "   ",
      ),
    ).toMatch(/UGEL/i);
    expect(
      validarFormularioReapertura(
        "Corrección del nivel de 2 estudiantes en 4.° C",
        true,
        "Oficio N.° 0345-2026-UGEL-HGA",
      ),
    ).toBe("");
  });
});
