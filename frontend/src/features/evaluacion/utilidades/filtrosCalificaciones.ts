import type { CursoCalificacionesOut } from "../../../api/generated/model";
import type { NivelLogro } from "../../../shared/componentes/insigniaNivel";

export const LEYENDA_NIVELES_LOGRO: ReadonlyArray<{
  nivel: Exclude<NivelLogro, "—">;
  nombre: string;
}> = [
  { nivel: "AD", nombre: "Logro destacado" },
  { nivel: "A", nombre: "Logro esperado" },
  { nivel: "B", nombre: "En proceso" },
  { nivel: "C", nombre: "En inicio" },
];

/** Extrae hasta 4 mini-niveles recientes de las competencias del curso. */
export function obtenerMiniNivelesCurso(curso: CursoCalificacionesOut): NivelLogro[] {
  return curso.competencias
    .slice(0, 4)
    .map((comp) => comp.trimestres[comp.trimestres.length - 1] ?? "—");
}

/** Selecciona el curso solicitado o el primero disponible cuando no hay coincidencia. */
export function seleccionarCursoCalificaciones(
  cursos: CursoCalificacionesOut[],
  asignaturaId: string | null,
): CursoCalificacionesOut | undefined {
  if (cursos.length === 0) return undefined;
  return cursos.find((c) => c.asignatura_id === asignaturaId) ?? cursos[0];
}
