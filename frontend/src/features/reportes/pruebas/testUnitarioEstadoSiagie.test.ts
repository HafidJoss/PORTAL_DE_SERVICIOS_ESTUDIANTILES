// Spec: reportes · Estado de preparación SIAGIE y reglas por trimestre
import { describe, expect, it } from "vitest";

import {
  esSeccionListaSiagie,
  obtenerEtiquetaEstadoSiagie,
  obtenerNotaTrimestreSiagie,
} from "../utilidades/estadoSiagie";

describe("estadoSiagie", () => {
  it("determina si una sección está lista y genera su etiqueta exacta", () => {
    const lista = {
      seccion_id: "3A",
      nombre: "3.° A",
      estudiantes_total: 32,
      competencias_confirmadas: 4,
      competencias_total: 4,
      listo_para_exportar: true,
    };
    const pendiente = {
      seccion_id: "4A",
      nombre: "4.° A",
      estudiantes_total: 31,
      competencias_confirmadas: 1,
      competencias_total: 4,
      listo_para_exportar: false,
    };

    expect(esSeccionListaSiagie(lista)).toBe(true);
    expect(esSeccionListaSiagie(pendiente)).toBe(false);
    expect(obtenerEtiquetaEstadoSiagie(lista)).toBe("Listo para exportar");
    expect(obtenerEtiquetaEstadoSiagie(pendiente)).toBe("Faltan 3 competencias");
  });

  it("muestra la nota explicativa según el trimestre esté cerrado o en evaluación", () => {
    expect(obtenerNotaTrimestreSiagie(true)).toMatch(/Trimestre cerrado/i);
    expect(obtenerNotaTrimestreSiagie(false)).toMatch(/cuatro competencias/i);
  });
});
