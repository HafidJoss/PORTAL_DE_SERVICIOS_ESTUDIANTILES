import type {
  NovedadItemOut,
  NovedadItemOutTipo,
} from "../../../api/generated/model";
import type { PreferenciasAvisos } from "../../../shared/preferencias/preferenciasAvisos";

const PREFERENCIA_POR_TIPO: Record<NovedadItemOutTipo, keyof PreferenciasAvisos> = {
  calificativo: "calif",
  recordatorio: "tareas",
  asistencia: "asist",
  observacion: "obs",
  mensaje: "obs",
};

export interface BloqueNovedades {
  grupo: string;
  items: NovedadItemOut[];
}

/** Filtra las novedades visibles según las categorías habilitadas por el usuario. */
export function filtrarNovedadesPorPreferencias(
  novedades: NovedadItemOut[],
  preferencias: PreferenciasAvisos,
): NovedadItemOut[] {
  return novedades.filter((novedad) => {
    const clave = PREFERENCIA_POR_TIPO[novedad.tipo];
    return clave ? preferencias[clave] : true;
  });
}

/** Agrupa novedades preservando el orden de aparición de cada bloque temporal. */
export function agruparNovedadesPorBloque(novedades: NovedadItemOut[]): BloqueNovedades[] {
  const mapa = new Map<string, NovedadItemOut[]>();
  for (const item of novedades) {
    const actual = mapa.get(item.grupo);
    if (actual) {
      actual.push(item);
    } else {
      mapa.set(item.grupo, [item]);
    }
  }
  return Array.from(mapa.entries()).map(([grupo, items]) => ({ grupo, items }));
}

const PREPOSICIONES = new Set(["y", "de", "del", "la", "las", "los", "el", "en"]);

/** Obtiene dos iniciales legibles para asignaturas o nombres de persona. */
export function obtenerInicialesTexto(texto: string): string {
  const palabras = texto
    .trim()
    .split(/\s+/)
    .filter((p) => p.length > 0 && !PREPOSICIONES.has(p.toLowerCase()));
  if (palabras.length === 0) return "CU";
  if (palabras.length === 1) return palabras[0]!.slice(0, 2).toUpperCase();
  return `${palabras[0]![0]}${palabras[1]![0]}`.toUpperCase();
}
