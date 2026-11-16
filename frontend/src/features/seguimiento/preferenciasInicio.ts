export type VarianteInicio = "A" | "B" | "C";

export const VARIANTES_INICIO: ReadonlyArray<{
  clave: VarianteInicio;
  etiqueta: string;
}> = [
  { clave: "A", etiqueta: "A · Feed de novedades" },
  { clave: "B", etiqueta: "B · Resumen por módulos" },
  { clave: "C", etiqueta: "C · Agenda semanal" },
];

const KEY_VARIANTE_INICIO = "portal-est-inicio-variante";

/** Lee la variante elegida para el tablero de inicio con respaldo seguro en "A". */
export function leerVarianteInicio(): VarianteInicio {
  try {
    const valor = localStorage.getItem(KEY_VARIANTE_INICIO);
    if (valor === "A" || valor === "B" || valor === "C") {
      return valor;
    }
    return "A";
  } catch {
    return "A";
  }
}

/** Persiste en localStorage la variante activa del tablero de inicio. */
export function guardarVarianteInicio(variante: VarianteInicio): void {
  try {
    localStorage.setItem(KEY_VARIANTE_INICIO, variante);
  } catch {
    // Ignorar errores de cuota o privacidad
  }
}
