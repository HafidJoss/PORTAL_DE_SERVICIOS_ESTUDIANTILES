// Spec: identidad · Scenario: Persistencia de preferencias de avisos en el navegador
import { beforeEach, describe, expect, it } from "vitest";

import {
  AVISOS_POR_DEFECTO,
  guardarDniRecordado,
  guardarPreferenciasAvisos,
  leerDniRecordado,
  leerPreferenciasAvisos,
} from "../utilidades/preferenciasIdentidad";

describe("preferenciasAvisos y DNI recordado", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("devuelve avisos activos por defecto y persiste cambios en localStorage", () => {
    expect(leerPreferenciasAvisos()).toEqual(AVISOS_POR_DEFECTO);

    guardarPreferenciasAvisos({
      ...AVISOS_POR_DEFECTO,
      asist: false,
    });

    expect(leerPreferenciasAvisos()).toEqual({
      calif: true,
      tareas: true,
      asist: false,
      obs: true,
    });
  });

  it("guarda y limpia el DNI recordado segun preferencia", () => {
    expect(leerDniRecordado()).toBe("");
    guardarDniRecordado("72458193", true);
    expect(leerDniRecordado()).toBe("72458193");

    guardarDniRecordado("72458193", false);
    expect(leerDniRecordado()).toBe("");
  });
});
