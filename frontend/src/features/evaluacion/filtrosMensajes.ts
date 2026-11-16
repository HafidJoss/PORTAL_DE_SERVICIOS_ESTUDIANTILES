import type {
  MensajeOut,
  MensajeOutTipo,
} from "../../api/generated/model";

export type PestanaMensajes = "todos" | "tareas" | "recordatorios" | "observaciones";

export const PESTANAS_MENSAJES: ReadonlyArray<{
  id: PestanaMensajes;
  etiqueta: string;
}> = [
  { id: "todos", etiqueta: "Todos" },
  { id: "tareas", etiqueta: "Tareas" },
  { id: "recordatorios", etiqueta: "Recordatorios" },
  { id: "observaciones", etiqueta: "Observaciones" },
];

export const META_TIPO_MENSAJE: Record<
  MensajeOutTipo,
  { etiqueta: string; bg: string; fg: string }
> = {
  Tarea: {
    etiqueta: "Tarea",
    bg: "var(--color-primary-light)",
    fg: "var(--color-primary)",
  },
  Recordatorio: {
    etiqueta: "Recordatorio",
    bg: "var(--status-warning-bg)",
    fg: "var(--status-warning-fg)",
  },
  ObsPos: {
    etiqueta: "Observación positiva",
    bg: "var(--status-success-bg)",
    fg: "var(--status-success-fg)",
  },
  ObsMej: {
    etiqueta: "Observación de mejora",
    bg: "#EFF6FF",
    fg: "#1D4ED8",
  },
};

const TIPOS_POR_PESTANA: Record<Exclude<PestanaMensajes, "todos">, Set<MensajeOutTipo>> = {
  tareas: new Set(["Tarea"]),
  recordatorios: new Set(["Recordatorio"]),
  observaciones: new Set(["ObsPos", "ObsMej"]),
};

/** Filtra mensajes docentes por categoría de pestaña. */
export function filtrarMensajesPorPestana(
  mensajes: MensajeOut[],
  pestana: PestanaMensajes,
): MensajeOut[] {
  if (pestana === "todos") return mensajes;
  const permitidos = TIPOS_POR_PESTANA[pestana];
  return mensajes.filter((m) => permitidos.has(m.tipo));
}

/** Valida que una respuesta en hilo cumpla la longitud acotada de 1 a 2000 caracteres. */
export function validarRespuestaHilo(texto: string): string | null {
  const limpio = texto.trim();
  if (limpio.length === 0) {
    return "Escribe una respuesta antes de enviarla.";
  }
  if (limpio.length > 2000) {
    return "La respuesta no puede superar los 2000 caracteres.";
  }
  return null;
}
