import type {
  DiaAsistenciaOut,
  DiaAsistenciaOutCodigo,
} from "../../api/generated/model";

export interface CeldaCalendarioAsistencia {
  dia: number | null;
  codigo: DiaAsistenciaOutCodigo;
  nombreEstado: string;
}

export interface ItemLeyendaAsistencia {
  codigo: Exclude<DiaAsistenciaOutCodigo, "">;
  etiqueta: string;
  bg: string;
  fg: string;
}

export const MESES_LECTIVOS_ASISTENCIA: ReadonlyArray<{
  mes: 9 | 10 | 11;
  etiqueta: string;
  nombreLargo: string;
}> = [
  { mes: 9, etiqueta: "Sep", nombreLargo: "Septiembre" },
  { mes: 10, etiqueta: "Oct", nombreLargo: "Octubre" },
  { mes: 11, etiqueta: "Nov", nombreLargo: "Noviembre" },
];

export const LEYENDA_ASISTENCIA: ReadonlyArray<ItemLeyendaAsistencia> = [
  { codigo: "P", etiqueta: "Presente", bg: "var(--status-success-bg)", fg: "var(--status-success-fg)" },
  { codigo: "T", etiqueta: "Tardanza", bg: "var(--status-warning-bg)", fg: "var(--status-warning-fg)" },
  { codigo: "F", etiqueta: "Falta injustificada", bg: "var(--status-danger-bg)", fg: "var(--status-danger)" },
  { codigo: "FJ", etiqueta: "Falta justificada", bg: "#EFF6FF", fg: "#1D4ED8" },
  { codigo: "TJ", etiqueta: "Tardanza justificada", bg: "#EFF6FF", fg: "#1D4ED8" },
  { codigo: "FE", etiqueta: "Feriado / evento", bg: "var(--bg-subtle)", fg: "var(--text-muted)" },
];

export const ESTILO_CODIGO_ASISTENCIA: Record<
  DiaAsistenciaOutCodigo,
  { bg: string; fg: string }
> = {
  P: { bg: "var(--status-success-bg)", fg: "var(--status-success-fg)" },
  T: { bg: "var(--status-warning-bg)", fg: "var(--status-warning-fg)" },
  F: { bg: "var(--status-danger-bg)", fg: "var(--status-danger)" },
  FJ: { bg: "#EFF6FF", fg: "#1D4ED8" },
  TJ: { bg: "#EFF6FF", fg: "#1D4ED8" },
  FE: { bg: "var(--bg-subtle)", fg: "var(--text-muted)" },
  "": { bg: "var(--bg-subtle)", fg: "var(--text-muted)" },
};

/** Construye la grilla laboral de lunes a viernes para el mes/año dados y cruza los registros recibidos. */
export function construirGrillaLaboral(
  mes: number,
  anio: number,
  diasRegistrados: DiaAsistenciaOut[],
): CeldaCalendarioAsistencia[] {
  const porDia = new Map<number, DiaAsistenciaOut>();
  for (const registro of diasRegistrados) {
    if (registro.dia !== null && registro.dia !== undefined) {
      porDia.set(registro.dia, registro);
    }
  }

  const totalDiasMes = new Date(anio, mes, 0).getDate();
  const celdas: CeldaCalendarioAsistencia[] = [];
  let primerDiaEncontrado = false;

  for (let dia = 1; dia <= totalDiasMes; dia += 1) {
    const diaSemana = new Date(anio, mes - 1, dia).getDay(); // 0=Dom .. 6=Sab
    if (diaSemana === 0 || diaSemana === 6) continue;

    if (!primerDiaEncontrado) {
      primerDiaEncontrado = true;
      const huecos = diaSemana - 1; // Lunes(1)->0 .. Viernes(5)->4
      for (let i = 0; i < huecos; i += 1) {
        celdas.push({ dia: null, codigo: "", nombreEstado: "" });
      }
    }

    const registro = porDia.get(dia);
    celdas.push({
      dia,
      codigo: registro?.codigo ?? "",
      nombreEstado: registro?.nombre_estado ?? "Sin registro",
    });
  }

  return celdas;
}
