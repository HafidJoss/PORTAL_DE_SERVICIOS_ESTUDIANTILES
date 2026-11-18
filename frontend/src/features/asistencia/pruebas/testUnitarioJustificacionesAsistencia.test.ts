// Spec: asistencia · Validaciones y elegibilidad pura para justificaciones escritas (RF20, RC08)
import { describe, expect, it } from "vitest";

import {
  MOTIVOS_JUSTIFICACION,
  puedeJustificarIncidencia,
  validarJustificacionTexto,
} from "../utilidades/justificacionesAsistencia";

describe("justificacionesAsistencia", () => {
  it("expone motivos predefinidos y habilita justificación solo para Apoderado en T/F pendientes", () => {
    expect(MOTIVOS_JUSTIFICACION.length).toBeGreaterThanOrEqual(4);

    expect(
      puedeJustificarIncidencia(
        {
          id: "inc-t1",
          fecha: "Mié 4 nov",
          codigo: "T",
          nombre_estado: "Tardanza",
          detalle: "Ingreso 08:09.",
          puede_justificar: true,
          justificacion_enviada: false,
        },
        true,
      ),
    ).toBe(true);

    // Estudiante nunca puede justificar (RC08)
    expect(
      puedeJustificarIncidencia(
        {
          id: "inc-t1",
          fecha: "Mié 4 nov",
          codigo: "T",
          nombre_estado: "Tardanza",
          detalle: "Ingreso 08:09.",
          puede_justificar: true,
          justificacion_enviada: false,
        },
        false,
      ),
    ).toBe(false);

    // Incidencia ya justificada o FJ no vuelve a habilitarse
    expect(
      puedeJustificarIncidencia(
        {
          id: "inc-fj1",
          fecha: "Vie 6 nov",
          codigo: "FJ",
          nombre_estado: "Falta justificada",
          detalle: "Cita médica.",
          puede_justificar: false,
          justificacion_enviada: true,
        },
        true,
      ),
    ).toBe(false);
  });

  it("valida motivo y longitud entre 5 y 500 caracteres", () => {
    expect(validarJustificacionTexto("", "Cita médica en Essalud.")).toMatch(/motivo/i);
    expect(validarJustificacionTexto("Transporte", "Hola")).toMatch(/5 caracteres/i);
    expect(validarJustificacionTexto("Transporte", "A".repeat(501))).toMatch(/500 caracteres/i);
    expect(
      validarJustificacionTexto("Salud / Cita médica", "Tuvo control médico temprano."),
    ).toBe("");
  });
});
