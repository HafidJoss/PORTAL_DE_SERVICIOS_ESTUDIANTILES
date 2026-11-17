import type {
  SituacionFinalOutCodigo,
  TrimestreLibretaOut,
} from "../../../api/generated/model";

const ETIQUETAS_SITUACION: Record<Exclude<SituacionFinalOutCodigo, null>, string> = {
  PRO: "Promovido de grado",
  PER: "Permanece en el grado",
  RR: "Requiere recuperación",
};

/** Cuenta cuántas libretas trimestrales han sido publicadas sobre el total del año. */
export function contarPublicadas(trimestres: TrimestreLibretaOut[]): {
  publicadas: number;
  total: number;
} {
  return {
    publicadas: trimestres.filter((t) => t.publicada).length,
    total: trimestres.length,
  };
}

/** Elige el último trimestre publicado o, en su defecto, el primer trimestre listado. */
export function seleccionarTrimestreInicial(
  trimestres: TrimestreLibretaOut[],
): number | null {
  if (trimestres.length === 0) return null;
  const publicadas = trimestres.filter((t) => t.publicada);
  if (publicadas.length > 0) {
    return publicadas[publicadas.length - 1]!.trimestre_id;
  }
  return trimestres[0]!.trimestre_id;
}

/** Devuelve la etiqueta legible del código de situación final anual. */
export function etiquetaSituacionFinal(
  codigo: Exclude<SituacionFinalOutCodigo, null>,
): string {
  return ETIQUETAS_SITUACION[codigo] ?? codigo;
}

/** Convierte los segundos de expiración de la URL firmada a minutos redondeados. */
export function formatearMinutosVigencia(segundos: number): number {
  return Math.max(1, Math.round(segundos / 60));
}
