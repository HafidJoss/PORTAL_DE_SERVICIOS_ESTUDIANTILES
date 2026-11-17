// Spec: evaluacion · Requirement: Consulta de calificaciones por competencia y escala cualitativa (RF08, RF22, RF23, HU06, HU10)
import { describe, expect, it } from "vitest";

import type { CursoCalificacionesOut } from "../../../api/generated/model";
import {
  LEYENDA_NIVELES_LOGRO,
  obtenerMiniNivelesCurso,
  seleccionarCursoCalificaciones,
} from "../filtrosCalificaciones";

const CURSOS_DEMO: CursoCalificacionesOut[] = [
  {
    asignatura_id: "mat",
    nombre: "Matemática",
    docente: "Prof. Julio Gamboa Rojas",
    competencias: [
      { nombre: "Resuelve problemas de cantidad", trimestres: ["A", "A", "AD"], en_evaluacion_t3: true },
      { nombre: "Resuelve problemas de regularidad", trimestres: ["B", "A", "A"], en_evaluacion_t3: true },
    ],
    conclusiones: [],
    calificativos_publicados: [],
  },
  {
    asignatura_id: "com",
    nombre: "Comunicación",
    docente: "Prof. Elena Ayala Quispe",
    competencias: [],
    conclusiones: [],
    calificativos_publicados: [],
  },
];

describe("filtrosCalificaciones", () => {
  it("expone la leyenda cualitativa AD, A, B y C sin escala vigesimal", () => {
    expect(LEYENDA_NIVELES_LOGRO.map((l) => l.nivel)).toEqual(["AD", "A", "B", "C"]);
  });

  it("deriva el ultimo nivel publicado por competencia y resuelve el curso activo", () => {
    expect(obtenerMiniNivelesCurso(CURSOS_DEMO[0]!)).toEqual(["AD", "A"]);
    expect(seleccionarCursoCalificaciones(CURSOS_DEMO, "com")?.nombre).toBe("Comunicación");
    expect(seleccionarCursoCalificaciones(CURSOS_DEMO, "no-existe")?.asignatura_id).toBe("mat");
    expect(seleccionarCursoCalificaciones([], "mat")).toBeUndefined();
  });
});
