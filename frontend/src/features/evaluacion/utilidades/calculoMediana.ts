export type CodigoCompetencia = "C1" | "C2" | "C3" | "C4";
export type NivelEducativoDocente = "Primaria" | "Secundaria";
export type NivelCneb = "AD" | "A" | "B" | "C";
export type MetodoCalculoCneb = "mediana" | "ultimo";

export interface SesionEvaluacionBase {
  id: string;
  competencia: CodigoCompetencia;
  capacidad_idx: number;
  estado: "pendiente" | "registrada";
  notas_por_estudiante: Record<string, string[]>;
  ajustes_manuales: Record<string, string>;
}

export interface FilaValidacionCierre {
  estudiante_idx: number;
  nivel: string;
  conclusion: string;
}

export interface ResultadoValidacionCierre {
  valido: boolean;
  sinNivel: number;
  sinConclusion: number;
}

const VALOR_NIVEL: Record<NivelCneb, number> = {
  C: 1,
  B: 2,
  A: 3,
  AD: 4,
};

const CLAVE_NIVEL: Record<number, NivelCneb> = {
  1: "C",
  2: "B",
  3: "A",
  4: "AD",
};

export function esNivelCneb(valor: string | undefined | null): valor is NivelCneb {
  return valor === "AD" || valor === "A" || valor === "B" || valor === "C";
}

/** Calcula la mediana cualitativa CNEB (índice medio superior en empates) sin promedios numéricos. */
export function calcularMedianaCneb(niveles: readonly (string | undefined | null)[]): NivelCneb | "" {
  const ordenados = niveles
    .filter((n): n is NivelCneb => esNivelCneb(n))
    .map((n) => VALOR_NIVEL[n])
    .sort((a, b) => a - b);

  if (ordenados.length === 0) return "";
  return CLAVE_NIVEL[ordenados[Math.floor(ordenados.length / 2)]];
}

/** Obtiene la nota del día priorizando el ajuste manual del docente si existe. */
export function calcularNotaDelDia(
  criterios: readonly (string | undefined | null)[],
  ajusteManual?: string | null,
): NivelCneb | "" {
  if (esNivelCneb(ajusteManual)) return ajusteManual;
  return calcularMedianaCneb(criterios);
}

/** Calcula el nivel de una capacidad desde sus sesiones publicadas según el método elegido. */
export function calcularNivelCapacidad(
  sesiones: readonly SesionEvaluacionBase[],
  estudianteKey: string,
  competencia: CodigoCompetencia,
  capacidadIdx: number,
  metodo: MetodoCalculoCneb = "mediana",
): NivelCneb | "" {
  const notasDia = sesiones
    .filter(
      (s) =>
        s.competencia === competencia &&
        s.capacidad_idx === capacidadIdx &&
        s.estado === "registrada",
    )
    .map((s) =>
      calcularNotaDelDia(s.notas_por_estudiante[estudianteKey] ?? [], s.ajustes_manuales[estudianteKey]),
    )
    .filter((n): n is NivelCneb => n !== "");

  if (notasDia.length === 0) return "";
  return metodo === "ultimo" ? notasDia[notasDia.length - 1] : calcularMedianaCneb(notasDia);
}

/** Sugiere el nivel trimestral de una competencia a partir de sus capacidades o últimas sesiones (RF07). */
export function calcularSugerenciaCompetencia(
  sesiones: readonly SesionEvaluacionBase[],
  estudianteKey: string,
  competencia: CodigoCompetencia,
  metodo: MetodoCalculoCneb = "mediana",
): NivelCneb | "" {
  if (metodo === "ultimo") {
    const notas = sesiones
      .filter((s) => s.competencia === competencia && s.estado === "registrada")
      .map((s) =>
        calcularNotaDelDia(s.notas_por_estudiante[estudianteKey] ?? [], s.ajustes_manuales[estudianteKey]),
      )
      .filter((n): n is NivelCneb => n !== "");
    return notas.length > 0 ? notas[notas.length - 1] : "";
  }

  const porCapacidades = [0, 1, 2, 3].map((capIdx) =>
    calcularNivelCapacidad(sesiones, estudianteKey, competencia, capIdx, "mediana"),
  );
  return calcularMedianaCneb(porCapacidades);
}

/** Regla RF22: conclusión descriptiva obligatoria con B o C en Primaria y solo con C en Secundaria. */
export function requiereConclusionDescriptiva(
  nivel: string | undefined | null,
  nivelEducativo: NivelEducativoDocente,
): boolean {
  if (!esNivelCneb(nivel)) return false;
  if (nivelEducativo === "Primaria") return nivel === "B" || nivel === "C";
  return nivel === "C";
}

/** Valida que toda la nómina tenga nivel asignado y las conclusiones obligatorias tengan >= 10 caracteres. */
export function validarCierreCompetencia(
  filas: readonly FilaValidacionCierre[],
  nivelEducativo: NivelEducativoDocente,
): ResultadoValidacionCierre {
  let sinNivel = 0;
  let sinConclusion = 0;

  for (const fila of filas) {
    if (!esNivelCneb(fila.nivel)) {
      sinNivel += 1;
      continue;
    }
    if (
      requiereConclusionDescriptiva(fila.nivel, nivelEducativo) &&
      fila.conclusion.trim().length < 10
    ) {
      sinConclusion += 1;
    }
  }

  return {
    valido: sinNivel === 0 && sinConclusion === 0,
    sinNivel,
    sinConclusion,
  };
}

export function contarDistribucionNiveles(
  niveles: readonly (string | undefined | null)[],
): Record<NivelCneb, number> {
  const conteo: Record<NivelCneb, number> = { AD: 0, A: 0, B: 0, C: 0 };
  for (const nivel of niveles) {
    if (esNivelCneb(nivel)) conteo[nivel] += 1;
  }
  return conteo;
}

/** Actualiza un criterio individual K1..K4 de un estudiante dentro de una lista de sesiones. */
export function actualizarCriterioEnSesiones<T extends SesionEvaluacionBase>(
  sesiones: readonly T[],
  sesionId: string,
  estIdx: number,
  critIdx: number,
  valor: string,
): T[] {
  const key = String(estIdx);
  return sesiones.map((s) => {
    if (s.id !== sesionId) return s;
    const fila = [...(s.notas_por_estudiante[key] ?? ["", "", "", ""])];
    fila[critIdx] = valor;
    return {
      ...s,
      notas_por_estudiante: { ...s.notas_por_estudiante, [key]: fila },
    };
  });
}

/** Rellena las celdas vacías K1..K4 de todos los estudiantes indicados con `A` o `AD`. */
export function completarVaciosEnSesiones<T extends SesionEvaluacionBase>(
  sesiones: readonly T[],
  sesionId: string,
  totalEstudiantes: number,
  nivel: "AD" | "A",
): T[] {
  return sesiones.map((s) => {
    if (s.id !== sesionId) return s;
    const actualizado: Record<string, string[]> = { ...s.notas_por_estudiante };
    for (let idx = 0; idx < totalEstudiantes; idx += 1) {
      const key = String(idx);
      const fila = [...(actualizado[key] ?? ["", "", "", ""])];
      actualizado[key] = [0, 1, 2, 3].map((k) => (esNivelCneb(fila[k]) ? fila[k] : nivel));
    }
    return { ...s, notas_por_estudiante: actualizado };
  });
}

/** Registra o limpia un ajuste manual docente sobre la nota del día de un estudiante. */
export function ajustarNotaDiaEnSesiones<T extends SesionEvaluacionBase>(
  sesiones: readonly T[],
  sesionId: string,
  estIdx: number,
  valor: string,
): T[] {
  const key = String(estIdx);
  return sesiones.map((s) => {
    if (s.id !== sesionId) return s;
    const ajustes = { ...s.ajustes_manuales };
    if (!valor) delete ajustes[key];
    else ajustes[key] = valor;
    return { ...s, ajustes_manuales: ajustes };
  });
}

/** Cuenta cuántos estudiantes de la nómina aún tienen algún criterio K1..K4 sin registrar. */
export function contarIncompletosSesion(
  sesion: SesionEvaluacionBase,
  totalEstudiantes: number,
): number {
  let pendientes = 0;
  for (let idx = 0; idx < totalEstudiantes; idx += 1) {
    const fila = sesion.notas_por_estudiante[String(idx)] ?? [];
    if (fila.length < 4 || fila.slice(0, 4).some((n) => !esNivelCneb(n))) {
      pendientes += 1;
    }
  }
  return pendientes;
}

export const LONGITUD_MINIMA_CONCLUSION = 10;
