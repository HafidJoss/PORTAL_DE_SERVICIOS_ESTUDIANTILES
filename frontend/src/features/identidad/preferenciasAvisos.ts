export {
  AVISOS_POR_DEFECTO,
  guardarPreferenciasAvisos,
  leerPreferenciasAvisos,
  type PreferenciasAvisos,
} from "../../shared/preferencias/preferenciasAvisos";

const KEY_DNI = "portal-est-dni";

export function leerDniRecordado(): string {
  try {
    return localStorage.getItem(KEY_DNI) ?? "";
  } catch {
    return "";
  }
}

export function guardarDniRecordado(dni: string, recordar: boolean): void {
  try {
    if (recordar && /^\d{8}$/.test(dni)) {
      localStorage.setItem(KEY_DNI, dni);
    } else {
      localStorage.removeItem(KEY_DNI);
    }
  } catch {
    // Ignorar errores de almacenamiento
  }
}
