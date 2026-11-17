// Spec: seguimiento · Requirement: Tablero de inicio docente y bandeja de entrada, Lectura y respuesta acotada (RF25, RF26)
import { describe, expect, it } from "vitest";

import type { MensajeBandejaDocenteOut } from "../../../api/generated/model";
import {
  contarSinLeerBandeja,
  filtrarBandejaDocente,
  validarRespuestaBandeja,
} from "../utilidades/filtrosBandejaDocente";

const MENSAJES_DEMO: MensajeBandejaDocenteOut[] = [
  {
    id: "m1",
    origen: "institucion",
    remitente: "Dirección",
    asunto: "Cierre preliminar",
    cuerpo: "Recordatorio del cierre.",
    fecha: "Hoy, 7:10",
    leido: false,
    puede_responder: false,
    respuestas: [],
  },
  {
    id: "m2",
    origen: "estudiante",
    remitente: "Diego Cárdenas Rojas",
    nombre_corto: "Diego",
    seccion_id: "3B",
    seccion_nombre: "3.° B",
    asunto: "Consulta ejercicio 7",
    cuerpo: "¿Cómo hallo la pendiente?",
    fecha: "Hoy, 6:52",
    leido: false,
    puede_responder: true,
    respuestas: [],
  },
  {
    id: "m5",
    origen: "asistencia",
    remitente: "Auxiliar",
    asunto: "Resumen asistencia 4.° C",
    cuerpo: "3 faltas registradas.",
    fecha: "Ayer",
    leido: true,
    puede_responder: false,
    respuestas: [],
  },
];

describe("filtrosBandejaDocente", () => {
  it("filtra por todos, no_leidos, institucion y estudiantes", () => {
    expect(filtrarBandejaDocente(MENSAJES_DEMO, "todos")).toHaveLength(3);
    expect(filtrarBandejaDocente(MENSAJES_DEMO, "no_leidos").map((m) => m.id)).toEqual([
      "m1",
      "m2",
    ]);
    expect(filtrarBandejaDocente(MENSAJES_DEMO, "institucion").map((m) => m.id)).toEqual([
      "m1",
      "m5",
    ]);
    expect(filtrarBandejaDocente(MENSAJES_DEMO, "estudiantes").map((m) => m.id)).toEqual([
      "m2",
    ]);
  });

  it("cuenta correctamente los mensajes no leidos", () => {
    expect(contarSinLeerBandeja(MENSAJES_DEMO)).toBe(2);
    expect(
      contarSinLeerBandeja(MENSAJES_DEMO.map((m) => ({ ...m, leido: true }))),
    ).toBe(0);
  });

  it("valida texto minimo y prohíbe responder comunicados de solo lectura", () => {
    expect(validarRespuestaBandeja(MENSAJES_DEMO[0], "Gracias")).toBe(
      "Los comunicados institucionales o de asistencia no admiten respuestas.",
    );
    expect(validarRespuestaBandeja(MENSAJES_DEMO[1], " ")).toBe(
      "Escribe tu respuesta (mínimo 2 caracteres).",
    );
    expect(validarRespuestaBandeja(MENSAJES_DEMO[1], "Lo revisamos en clase.")).toBe("");
  });
});
