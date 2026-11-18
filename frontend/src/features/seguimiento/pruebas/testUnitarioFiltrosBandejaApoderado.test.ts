// Spec: seguimiento · Filtros puros de la bandeja familiar del apoderado
import { describe, expect, it } from "vitest";

import type { MensajeBandejaApoderadoOut } from "../../../api/generated/model";
import {
  contarNoLeidosApoderado,
  filtrarBandejaApoderado,
} from "../utilidades/filtrosBandejaApoderado";

const MENSAJES: MensajeBandejaApoderadoOut[] = [
  {
    id: "i1",
    origen: "institucion",
    remitente: "Dirección",
    asunto: "Entrega de libretas",
    cuerpo: "Desde las 10:00 a.m.",
    fecha: "Hoy, 09:00",
    leido: false,
    requiere_confirmacion: true,
    lectura_confirmada: false,
    etiqueta: "Institución",
  },
  {
    id: "i2",
    origen: "asistencia",
    remitente: "Asistencia",
    asunto: "Tardanza registrada",
    cuerpo: "Ingreso 07:52.",
    fecha: "Hoy, 08:15",
    leido: false,
    etiqueta: "Asistencia",
  },
  {
    id: "m1",
    origen: "docente",
    remitente: "Prof. Carlos Mendoza",
    curso: "Matemática",
    asunto: "Avance positivo",
    cuerpo: "Participación destacada.",
    fecha: "Ayer",
    leido: true,
    etiqueta: "Docente",
  },
];

describe("filtrosBandejaApoderado", () => {
  it("filtra por todos, no leídos, institución y docentes", () => {
    expect(filtrarBandejaApoderado(MENSAJES, "todos")).toHaveLength(3);
    expect(filtrarBandejaApoderado(MENSAJES, "no_leidos").map((m) => m.id)).toEqual([
      "i1",
      "i2",
    ]);
    expect(filtrarBandejaApoderado(MENSAJES, "institucion").map((m) => m.id)).toEqual([
      "i1",
      "i2",
    ]);
    expect(filtrarBandejaApoderado(MENSAJES, "docentes").map((m) => m.id)).toEqual([
      "m1",
    ]);
  });

  it("cuenta correctamente los comunicados y mensajes sin leer", () => {
    expect(contarNoLeidosApoderado(MENSAJES)).toBe(2);
    expect(contarNoLeidosApoderado([])).toBe(0);
  });
});
