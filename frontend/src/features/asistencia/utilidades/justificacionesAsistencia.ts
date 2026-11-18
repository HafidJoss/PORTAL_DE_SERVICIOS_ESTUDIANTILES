import type { IncidenciaAsistenciaOut } from "../../../api/generated/model";

export const MOTIVOS_JUSTIFICACION = [
  "Salud / Cita médica",
  "Motivo familiar",
  "Transporte",
  "Otro motivo",
] as const;

/** Determina si una incidencia admite envío de justificación escrita por el apoderado (RF20, RC08). */
export function puedeJustificarIncidencia(
  incidencia: IncidenciaAsistenciaOut,
  esApoderado: boolean,
): boolean {
  if (!esApoderado) {
    return false;
  }
  if (incidencia.justificacion_enviada) {
    return false;
  }
  const codigoElegible = incidencia.codigo === "T" || incidencia.codigo === "F";
  if (!codigoElegible) {
    return false;
  }
  return incidencia.puede_justificar ?? true;
}

/** Valida localmente motivo y detalle escrito de la justificación antes de enviarla al auxiliar. */
export function validarJustificacionTexto(motivo: string, detalle: string): string {
  if (!motivo.trim()) {
    return "Selecciona un motivo para enviar la justificación.";
  }
  const limpio = detalle.trim();
  if (limpio.length < 5) {
    return "Describe brevemente el motivo (mínimo 5 caracteres).";
  }
  if (limpio.length > 500) {
    return "La justificación no puede superar los 500 caracteres.";
  }
  return "";
}
