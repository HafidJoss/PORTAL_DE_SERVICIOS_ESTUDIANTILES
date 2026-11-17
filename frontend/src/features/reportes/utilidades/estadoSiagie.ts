import type { SeccionSiagieEstadoOut } from "../../../api/generated/model";

export function esSeccionListaSiagie(seccion: SeccionSiagieEstadoOut): boolean {
  return (
    seccion.listo_para_exportar &&
    seccion.competencias_confirmadas >= seccion.competencias_total
  );
}

export function obtenerEtiquetaEstadoSiagie(seccion: SeccionSiagieEstadoOut): string {
  if (esSeccionListaSiagie(seccion)) return "Listo para exportar";
  const faltantes = Math.max(0, seccion.competencias_total - seccion.competencias_confirmadas);
  return `Faltan ${faltantes} ${faltantes === 1 ? "competencia" : "competencias"}`;
}

export function obtenerNotaTrimestreSiagie(cerrado: boolean): string {
  if (cerrado) {
    return "Trimestre cerrado. Puedes volver a descargar la plantilla Excel SIAGIE o el Acta preliminar.";
  }
  return "Solo se habilita la descarga cuando las cuatro competencias tienen nivel confirmado en el cierre.";
}
