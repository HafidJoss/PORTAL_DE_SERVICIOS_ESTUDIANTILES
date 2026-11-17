// Spec: evaluacion · Requirement: Filtrado y resumen de actividades en Trabajos y pendientes (RF23, HU10, RC08)
// Spec: evaluacion · Requirement: Detalle expandible diferenciando trabajo y sesión de clase (RF23, HU10, AC06)
import { describe, expect, it } from "vitest";

import type { ActividadOut } from "../../../api/generated/model";
import {
  esSesionClase,
  etiquetaEstadoActividad,
  filtrarActividadesPorPestana,
} from "../utilidades/filtrosActividades";

const ACTIVIDADES_DEMO: ActividadOut[] = [
  {
    id: "act-1",
    tipo: "trabajo",
    titulo: "Ficha de ecuaciones",
    curso: "Matemática",
    asignada: "11 nov",
    fecha_entrega: "18 nov",
    estado: "pendiente",
    urgente: true,
    competencia: "Resuelve problemas de regularidad",
    capacidad: "Traduce datos",
  },
  {
    id: "act-2",
    tipo: "trabajo",
    titulo: "Mapa conceptual",
    curso: "Historia",
    asignada: "02 nov",
    fecha_entrega: "09 nov",
    estado: "vencido",
    urgente: false,
    competencia: "Construye interpretaciones históricas",
    capacidad: "Interpreta fuentes",
  },
  {
    id: "act-3",
    tipo: "trabajo",
    titulo: "Resumen de lectura",
    curso: "Comunicación",
    asignada: "05 nov",
    fecha_entrega: "12 nov",
    estado: "entregado",
    urgente: false,
    competencia: "Lee diversos tipos de textos",
    capacidad: "Obtiene información",
  },
  {
    id: "act-4",
    tipo: "sesion_clase",
    titulo: "Sesión 16: método de igualación",
    curso: "Matemática",
    asignada: "12 nov",
    fecha_entrega: null,
    estado: "calificado",
    urgente: false,
    competencia: "Resuelve problemas de regularidad",
    capacidad: "Usa estrategias",
    nivel: "AD",
  },
];

describe("filtrosActividades", () => {
  it("filtra correctamente por pendientes, entregados y todos", () => {
    expect(filtrarActividadesPorPestana(ACTIVIDADES_DEMO, "pendientes").map((a) => a.id)).toEqual([
      "act-1",
      "act-2",
    ]);
    expect(filtrarActividadesPorPestana(ACTIVIDADES_DEMO, "entregados").map((a) => a.id)).toEqual([
      "act-3",
      "act-4",
    ]);
    expect(filtrarActividadesPorPestana(ACTIVIDADES_DEMO, "todos")).toHaveLength(4);
  });

  it("distingue sesion_clase (nota del dia) de trabajo y etiqueta estados", () => {
    expect(esSesionClase(ACTIVIDADES_DEMO[0]!)).toBe(false);
    expect(esSesionClase(ACTIVIDADES_DEMO[3]!)).toBe(true);
    expect(etiquetaEstadoActividad("pendiente")).toBe("Pendiente");
    expect(etiquetaEstadoActividad("vencido")).toBe("Vencido");
    expect(etiquetaEstadoActividad("entregado")).toBe("Entregado");
    expect(etiquetaEstadoActividad("calificado")).toBe("Calificado");
  });
});
