// Spec: evaluacion · Requirement: Bandeja de mensajes filtrable y vista maestro-detalle (RF24, RF25, HU15, AC04)
// Spec: evaluacion · Requirement: Confirmación de lectura y respuesta acotada en hilo (RF25, RC08, HU15)
import { describe, expect, it } from "vitest";

import type { MensajeOut } from "../../../api/generated/model";
import {
  META_TIPO_MENSAJE,
  filtrarMensajesPorPestana,
  validarRespuestaHilo,
} from "../filtrosMensajes";

const MENSAJES_DEMO: MensajeOut[] = [
  {
    id: "m1",
    tipo: "Tarea",
    remitente: "Prof. Julio Gamboa",
    curso: "Matemática",
    asunto: "Ficha 4",
    fecha: "Hoy",
    fecha_larga: "Hoy 09:00",
    destinatarios: "3.° B",
    cuerpo: "Resolver ficha.",
    actividad_id: "act-1",
    no_leido: true,
    lectura_confirmada: false,
    respuestas: [],
  },
  {
    id: "m2",
    tipo: "Recordatorio",
    remitente: "Prof. Elena Ayala",
    curso: "Comunicación",
    asunto: "Traer obra",
    fecha: "Ayer",
    fecha_larga: "Ayer 16:00",
    destinatarios: "3.° B",
    cuerpo: "Traer libro.",
    no_leido: false,
    lectura_confirmada: true,
    respuestas: [],
  },
  {
    id: "m3",
    tipo: "ObsPos",
    remitente: "Prof. Rosa Cárdenas",
    curso: "Tutoría",
    asunto: "Felicitación",
    fecha: "Lun",
    fecha_larga: "Lunes",
    destinatarios: "Estudiante",
    cuerpo: "Buen trabajo.",
    no_leido: false,
    lectura_confirmada: true,
    respuestas: [],
  },
  {
    id: "m4",
    tipo: "ObsMej",
    remitente: "Prof. Julio Gamboa",
    curso: "Matemática",
    asunto: "Refuerzo",
    fecha: "Vie",
    fecha_larga: "Viernes",
    destinatarios: "Estudiante",
    cuerpo: "Repasar signos.",
    no_leido: true,
    lectura_confirmada: false,
    respuestas: [],
  },
];

describe("filtrosMensajes", () => {
  it("filtra por todos, tareas, recordatorios y observaciones", () => {
    expect(filtrarMensajesPorPestana(MENSAJES_DEMO, "todos")).toHaveLength(4);
    expect(filtrarMensajesPorPestana(MENSAJES_DEMO, "tareas").map((m) => m.id)).toEqual(["m1"]);
    expect(filtrarMensajesPorPestana(MENSAJES_DEMO, "recordatorios").map((m) => m.id)).toEqual([
      "m2",
    ]);
    expect(filtrarMensajesPorPestana(MENSAJES_DEMO, "observaciones").map((m) => m.id)).toEqual([
      "m3",
      "m4",
    ]);
    expect(META_TIPO_MENSAJE.ObsPos.etiqueta).toBe("Observación positiva");
  });

  it("valida longitud de respuesta en hilo entre 1 y 2000 caracteres", () => {
    expect(validarRespuestaHilo("   ")).toBe("Escribe una respuesta antes de enviarla.");
    expect(validarRespuestaHilo("a".repeat(2001))).toBe(
      "La respuesta no puede superar los 2000 caracteres.",
    );
    expect(validarRespuestaHilo("  Entendido profesor, gracias.  ")).toBeNull();
  });
});
