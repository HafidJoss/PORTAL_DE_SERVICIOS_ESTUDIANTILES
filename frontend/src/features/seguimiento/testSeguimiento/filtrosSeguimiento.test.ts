// Spec: seguimiento · Requirement: Filtro de novedades y marcado como visto (RF01, RF26, HU10)
// Spec: seguimiento · Requirement: Tablero de inicio en tres variantes (RF01, HU10, AC01)
import { beforeEach, describe, expect, it } from "vitest";

import type { NovedadItemOut } from "../../../api/generated/model";
import { AVISOS_POR_DEFECTO } from "../../../shared/preferencias/preferenciasAvisos";
import {
  agruparNovedadesPorBloque,
  filtrarNovedadesPorPreferencias,
  obtenerInicialesTexto,
} from "../filtrosSeguimiento";
import {
  guardarVarianteInicio,
  leerVarianteInicio,
} from "../preferenciasInicio";

const NOVEDADES_DEMO: NovedadItemOut[] = [
  {
    id: "nov-1",
    grupo: "Hoy",
    tipo: "calificativo",
    etiqueta: "Calificativo",
    curso: "Matemática",
    titulo: "Práctica calificada",
    detalle: "Nivel A",
    nivel: "A",
    hora: "10:15",
    ruta_destino: "/cursos/mat",
  },
  {
    id: "nov-2",
    grupo: "Hoy",
    tipo: "asistencia",
    etiqueta: "Asistencia",
    curso: "Tutoría",
    titulo: "Tardanza registrada",
    detalle: "08:09",
    hora: "08:15",
    ruta_destino: "/asistencia",
  },
  {
    id: "nov-3",
    grupo: "Ayer",
    tipo: "recordatorio",
    etiqueta: "Recordatorio",
    curso: "Comunicación",
    titulo: "Ensayo argumentativo",
    detalle: "Entrega el viernes",
    hora: "14:00",
    ruta_destino: "/trabajos",
  },
  {
    id: "nov-4",
    grupo: "Ayer",
    tipo: "observacion",
    etiqueta: "Observación",
    curso: "Ciencia y Tecnología",
    titulo: "Participación destacada",
    detalle: "Excelente aporte",
    hora: "16:20",
    ruta_destino: "/mensajes",
  },
  {
    id: "nov-5",
    grupo: "Ayer",
    tipo: "mensaje",
    etiqueta: "Mensaje",
    curso: "Historia",
    titulo: "Material para clase",
    detalle: "Traer ficha impresa",
    hora: "17:00",
    ruta_destino: "/mensajes",
  },
];

describe("filtrosSeguimiento y preferenciasInicio", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("filtra novedades segun preferencias de avisos activas", () => {
    expect(filtrarNovedadesPorPreferencias(NOVEDADES_DEMO, AVISOS_POR_DEFECTO)).toHaveLength(5);

    const filtradas = filtrarNovedadesPorPreferencias(NOVEDADES_DEMO, {
      calif: false,
      tareas: true,
      asist: false,
      obs: true,
    });
    expect(filtradas.map((n) => n.id)).toEqual(["nov-3", "nov-4", "nov-5"]);

    const sinObs = filtrarNovedadesPorPreferencias(NOVEDADES_DEMO, {
      calif: true,
      tareas: true,
      asist: true,
      obs: false,
    });
    expect(sinObs.map((n) => n.id)).toEqual(["nov-1", "nov-2", "nov-3"]);
  });

  it("agrupa novedades manteniendo el orden de grupos", () => {
    const grupos = agruparNovedadesPorBloque(NOVEDADES_DEMO);
    expect(grupos.map((g) => g.grupo)).toEqual(["Hoy", "Ayer"]);
    expect(grupos[0]?.items.map((n) => n.id)).toEqual(["nov-1", "nov-2"]);
    expect(grupos[1]?.items.map((n) => n.id)).toEqual(["nov-3", "nov-4", "nov-5"]);
  });

  it("calcula iniciales legibles para asignaturas o nombres", () => {
    expect(obtenerInicialesTexto("Matemática")).toBe("MA");
    expect(obtenerInicialesTexto("Ciencia y Tecnología")).toBe("CT");
    expect(obtenerInicialesTexto("")).toBe("CU");
  });

  it("lee y persiste la variante de inicio A, B o C con respaldo seguro", () => {
    expect(leerVarianteInicio()).toBe("A");

    guardarVarianteInicio("C");
    expect(leerVarianteInicio()).toBe("C");

    localStorage.setItem("portal-est-inicio-variante", "Z");
    expect(leerVarianteInicio()).toBe("A");
  });
});
