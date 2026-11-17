// Spec: evaluacion · Validación pura y alcance de mensajería saliente docente
import { describe, expect, it } from "vitest";

import {
  describirAlcanceDestinatario,
  validarFormularioMensajeDocente,
} from "../utilidades/filtrosMensajesDocente";

describe("filtrosMensajesDocente", () => {
  it("valida asunto (>= 3 caracteres) y cuerpo (>= 5 caracteres)", () => {
    expect(validarFormularioMensajeDocente({ asunto: "  Ab  ", cuerpo: "Texto suficiente" })).toEqual({
      valido: false,
      error: "El asunto debe tener al menos 3 caracteres.",
    });

    expect(validarFormularioMensajeDocente({ asunto: "Traer compás", cuerpo: "  Hola " })).toEqual({
      valido: false,
      error: "El mensaje debe tener al menos 5 caracteres.",
    });

    expect(
      validarFormularioMensajeDocente({
        asunto: "Traer compás",
        cuerpo: "Recuerden traer compás y regla graduada.",
      }),
    ).toEqual({
      valido: true,
      error: "",
    });
  });

  it("describe el alcance para sección completa o estudiante y su apoderado", () => {
    expect(describirAlcanceDestinatario("3.° B", 30)).toBe(
      "Llegará a 30 estudiantes y sus apoderados (3.° B).",
    );
    expect(describirAlcanceDestinatario("3.° B", 30, "Quispe Huamán, Luis Ángel")).toBe(
      "Llegará a Quispe Huamán, Luis Ángel y su apoderado.",
    );
  });
});
