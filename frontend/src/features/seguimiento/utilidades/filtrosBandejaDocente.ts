import type { MensajeBandejaDocenteOut } from "../../../api/generated/model";

export type FiltroBandejaDocente =
  | "todos"
  | "no_leidos"
  | "institucion"
  | "estudiantes";

/** Filtra los mensajes de la bandeja docente según la categoría seleccionada. */
export function filtrarBandejaDocente(
  mensajes: readonly MensajeBandejaDocenteOut[],
  filtro: FiltroBandejaDocente,
): MensajeBandejaDocenteOut[] {
  switch (filtro) {
    case "no_leidos":
      return mensajes.filter((m) => !m.leido);
    case "institucion":
      return mensajes.filter((m) => m.origen !== "estudiante");
    case "estudiantes":
      return mensajes.filter((m) => m.origen === "estudiante");
    default:
      return [...mensajes];
  }
}

/** Cuenta cuántos mensajes de la bandeja permanecen sin leer. */
export function contarSinLeerBandeja(
  mensajes: readonly MensajeBandejaDocenteOut[],
): number {
  return mensajes.reduce((acc, m) => acc + (m.leido ? 0 : 1), 0);
}

/** Valida localmente una respuesta en hilo desde la bandeja docente (RF25, RC08). */
export function validarRespuestaBandeja(
  mensaje: MensajeBandejaDocenteOut,
  texto: string,
): string {
  if (!mensaje.puede_responder) {
    return "Los comunicados institucionales o de asistencia no admiten respuestas.";
  }
  if (texto.trim().length < 2) {
    return "Escribe tu respuesta (mínimo 2 caracteres).";
  }
  return "";
}
