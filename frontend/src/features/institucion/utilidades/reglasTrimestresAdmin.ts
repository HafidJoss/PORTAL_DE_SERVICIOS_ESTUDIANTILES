import type {
  TransicionTrimestreInAccion,
  TrimestreAdminOutEstado,
} from "../../../api/generated/model";

export type TipoAccionPanelTrimestre = TransicionTrimestreInAccion | "publicar_libreta";

export interface AccionPanelTrimestre {
  tipo: TipoAccionPanelTrimestre;
  etiqueta: string;
  esPrimaria: boolean;
}

export interface EtapaTrimestre {
  estado: TrimestreAdminOutEstado;
  etiqueta: string;
  completada: boolean;
  actual: boolean;
}

export const ORDEN_ESTADOS_TRIMESTRE: readonly TrimestreAdminOutEstado[] = [
  "Aperturado",
  "En Evaluación",
  "Cierre Preliminar",
  "Cerrado",
];

export function etapasProgresoTrimestre(estadoActual: TrimestreAdminOutEstado): EtapaTrimestre[] {
  const indiceActual = ORDEN_ESTADOS_TRIMESTRE.indexOf(estadoActual);
  return ORDEN_ESTADOS_TRIMESTRE.map((estado, idx) => ({
    estado,
    etiqueta: estado,
    completada: idx <= indiceActual,
    actual: idx === indiceActual,
  }));
}

export function accionesDisponiblesTrimestre(
  estado: TrimestreAdminOutEstado,
  libretaPublicada: boolean,
): AccionPanelTrimestre[] {
  const acciones: AccionPanelTrimestre[] = [];
  if (estado === "Aperturado") {
    acciones.push({
      tipo: "iniciar_evaluacion",
      etiqueta: "Iniciar evaluación",
      esPrimaria: true,
    });
  }
  if (estado === "En Evaluación") {
    acciones.push({
      tipo: "cierre_preliminar",
      etiqueta: "Pasar a cierre preliminar",
      esPrimaria: true,
    });
  }
  if (estado === "Cierre Preliminar") {
    acciones.push({
      tipo: "cerrar",
      etiqueta: "Cerrar trimestre",
      esPrimaria: true,
    });
  }
  if (estado === "Cerrado" && !libretaPublicada) {
    acciones.push({
      tipo: "publicar_libreta",
      etiqueta: "Publicar libreta",
      esPrimaria: true,
    });
  }
  if (estado === "Cerrado") {
    acciones.push({
      tipo: "reabrir",
      etiqueta: "Reabrir",
      esPrimaria: false,
    });
  }
  return acciones;
}

export function validarFormularioReapertura(
  motivo: string,
  actaEmitidaSiagie: boolean,
  documentoUgel: string,
): string {
  if (motivo.trim().length < 15) {
    return "Describe el motivo de reapertura (mínimo 15 caracteres).";
  }
  if (actaEmitidaSiagie && documentoUgel.trim().length < 5) {
    return "Registra el número de documento de autorización de la UGEL (mínimo 5 caracteres).";
  }
  return "";
}
