// Spec: seguimiento · Requirement: Filtro de novedades y marcado como visto (RF01, RF26, HU10)
import { beforeEach, describe, expect, it } from "vitest";

import {
  AVISOS_POR_DEFECTO,
  guardarPreferenciasAvisos,
  leerPreferenciasAvisos,
} from "../preferencias/preferenciasAvisos";

describe("shared/preferenciasAvisos", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("devuelve valores por defecto cuando no hay datos o hay JSON invalido", () => {
    expect(leerPreferenciasAvisos()).toEqual(AVISOS_POR_DEFECTO);

    localStorage.setItem("portal-est-avisos", "{json-corrupto");
    expect(leerPreferenciasAvisos()).toEqual(AVISOS_POR_DEFECTO);
  });

  it("persiste y completa valores parciales en localStorage", () => {
    guardarPreferenciasAvisos({
      calif: false,
      tareas: true,
      asist: false,
      obs: true,
    });

    expect(leerPreferenciasAvisos()).toEqual({
      calif: false,
      tareas: true,
      asist: false,
      obs: true,
    });

    localStorage.setItem("portal-est-avisos", JSON.stringify({ calif: false }));
    expect(leerPreferenciasAvisos()).toEqual({
      calif: false,
      tareas: true,
      asist: true,
      obs: true,
    });
  });
});
