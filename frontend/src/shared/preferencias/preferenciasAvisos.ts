export interface PreferenciasAvisos {
  calif: boolean;
  tareas: boolean;
  asist: boolean;
  obs: boolean;
}

export const AVISOS_POR_DEFECTO: PreferenciasAvisos = {
  calif: true,
  tareas: true,
  asist: true,
  obs: true,
};

const KEY_AVISOS = "portal-est-avisos";

/** Lee las preferencias locales de avisos desde localStorage con fallback seguro. */
export function leerPreferenciasAvisos(): PreferenciasAvisos {
  try {
    const raw = localStorage.getItem(KEY_AVISOS);
    if (!raw) return { ...AVISOS_POR_DEFECTO };
    const parsed = JSON.parse(raw) as Partial<PreferenciasAvisos>;
    return {
      calif: parsed.calif ?? AVISOS_POR_DEFECTO.calif,
      tareas: parsed.tareas ?? AVISOS_POR_DEFECTO.tareas,
      asist: parsed.asist ?? AVISOS_POR_DEFECTO.asist,
      obs: parsed.obs ?? AVISOS_POR_DEFECTO.obs,
    };
  } catch {
    return { ...AVISOS_POR_DEFECTO };
  }
}

/** Guarda en localStorage las preferencias locales de avisos del portal. */
export function guardarPreferenciasAvisos(prefs: PreferenciasAvisos): void {
  try {
    localStorage.setItem(KEY_AVISOS, JSON.stringify(prefs));
  } catch {
    // Ignorar errores de cuota o privacidad
  }
}
