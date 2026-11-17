import type {
  ActividadOut,
  ActividadOutEstado,
} from "../../../api/generated/model";

export type PestanaTrabajos = "pendientes" | "entregados" | "todos";

const ESTADOS_PENDIENTES = new Set<ActividadOutEstado>(["pendiente", "vencido"]);
const ESTADOS_ENTREGADOS = new Set<ActividadOutEstado>(["entregado", "calificado"]);

const ETIQUETA_ESTADO: Record<ActividadOutEstado, string> = {
  pendiente: "Pendiente",
  vencido: "Vencido",
  entregado: "Entregado",
  calificado: "Calificado",
};

/** Filtra la lista de actividades según la pestaña activa de Trabajos y pendientes. */
export function filtrarActividadesPorPestana(
  actividades: ActividadOut[],
  pestana: PestanaTrabajos,
): ActividadOut[] {
  if (pestana === "pendientes") {
    return actividades.filter((act) => ESTADOS_PENDIENTES.has(act.estado));
  }
  if (pestana === "entregados") {
    return actividades.filter((act) => ESTADOS_ENTREGADOS.has(act.estado));
  }
  return actividades;
}

/** Indica si la actividad corresponde a una sesión de clase (nota del día). */
export function esSesionClase(actividad: ActividadOut): boolean {
  return actividad.tipo === "sesion_clase";
}

/** Devuelve la etiqueta legible de un estado de actividad. */
export function etiquetaEstadoActividad(estado: ActividadOutEstado): string {
  return ETIQUETA_ESTADO[estado] ?? estado;
}
