import type { MensajeBandejaApoderadoOut } from "../../../api/generated/model";

export type FiltroBandejaApoderado =
  | "todos"
  | "no_leidos"
  | "institucion"
  | "docentes";

/** Filtra los comunicados y mensajes del apoderado según la pestaña activa. */
export function filtrarBandejaApoderado(
  mensajes: readonly MensajeBandejaApoderadoOut[],
  filtro: FiltroBandejaApoderado,
): MensajeBandejaApoderadoOut[] {
  switch (filtro) {
    case "no_leidos":
      return mensajes.filter((m) => !m.leido);
    case "institucion":
      return mensajes.filter((m) => m.origen !== "docente");
    case "docentes":
      return mensajes.filter((m) => m.origen === "docente");
    default:
      return [...mensajes];
  }
}

/** Cuenta cuántos comunicados o mensajes permanecen sin leer en la bandeja familiar. */
export function contarNoLeidosApoderado(
  mensajes: readonly MensajeBandejaApoderadoOut[],
): number {
  return mensajes.reduce((acc, m) => acc + (m.leido ? 0 : 1), 0);
}
