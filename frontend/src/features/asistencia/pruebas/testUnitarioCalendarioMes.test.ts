// Spec: asistencia · Requirement: Calendario lunes a viernes, códigos e incidencias mensuales (RF20, HU16, RC08, AC04)
import { describe, expect, it } from "vitest";

import {
  LEYENDA_ASISTENCIA,
  MESES_LECTIVOS_ASISTENCIA,
  construirGrillaLaboral,
} from "../utilidades/calendarioMes";

describe("calendarioMes", () => {
  it("genera semanas lunes a viernes para noviembre 2026 y cruza codigos recibidos", () => {
    // 1 de noviembre 2026 es domingo, por lo que el lunes 2 es el primer día hábil sin huecos iniciales
    const celdas = construirGrillaLaboral(11, 2026, [
      { dia: 2, codigo: "P", nombre_estado: "Presente" },
      { dia: 4, codigo: "T", nombre_estado: "Tardanza" },
      { dia: 6, codigo: "FJ", nombre_estado: "Falta justificada" },
    ]);

    const habiles = celdas.filter((c) => c.dia !== null);
    expect(habiles).toHaveLength(21); // 2,3,4,5,6 | 9..13 | 16..20 | 23..27 | 30
    expect(celdas[0]?.dia).toBe(2);
    expect(celdas[0]?.codigo).toBe("P");
    expect(celdas[2]?.codigo).toBe("T");
    expect(celdas[4]?.codigo).toBe("FJ");
    expect(celdas[1]?.codigo).toBe("");
  });

  it("incluye huecos iniciales cuando el mes empieza a mitad de semana (octubre 2026: jueves 1)", () => {
    const celdas = construirGrillaLaboral(10, 2026, [
      { dia: 1, codigo: "P", nombre_estado: "Presente" },
    ]);

    // Lunes, martes, miércoles son huecos; jueves es día 1
    expect(celdas.slice(0, 3).map((c) => c.dia)).toEqual([null, null, null]);
    expect(celdas[3]?.dia).toBe(1);
    expect(celdas[3]?.codigo).toBe("P");
  });

  it("expone leyenda completa P/T/F/FJ/TJ/FE y selector sep/oct/nov", () => {
    expect(LEYENDA_ASISTENCIA.map((l) => l.codigo)).toEqual(["P", "T", "F", "FJ", "TJ", "FE"]);
    expect(MESES_LECTIVOS_ASISTENCIA.map((m) => m.mes)).toEqual([9, 10, 11]);
  });
});
