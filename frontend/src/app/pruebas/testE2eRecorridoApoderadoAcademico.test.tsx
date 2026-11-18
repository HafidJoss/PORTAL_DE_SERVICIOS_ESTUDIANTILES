// Spec: identidad, plataforma-web, seguimiento, evaluacion, reportes · Recorrido académico multi-hijo de Apoderado
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { MemoryRouter } from "react-router-dom";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { RutasApp } from "../aplicacion";
import { ProveedorTema } from "../proveedorTema";

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  localStorage.clear();
  server.resetHandlers();
});
afterAll(() => server.close());

const SESION_APODERADO = {
  autenticado: true,
  usuario: {
    id: "apo-demo-1",
    dni: "40871256",
    nombres: "Rosa",
    apellidos: "Huamán Ccori",
    rol: "Apoderado",
    apoderado_id: "apo-demo-1",
    hijos_vinculados: [
      {
        estudiante_id: "est-demo-1",
        codigo: "20260001",
        nombres: "Luis Ángel",
        apellidos: "Quispe Huamán",
        grado_seccion: "3.° de Secundaria B",
        iniciales: "LQ",
        tutor: "Prof. Carlos Mendoza",
      },
      {
        estudiante_id: "est-demo-2",
        codigo: "20260002",
        nombres: "Sofía",
        apellidos: "Quispe Huamán",
        grado_seccion: "1.° de Secundaria A",
        iniciales: "SQ",
        tutor: "Prof. Ana Lucía Torres",
      },
    ],
  },
};

function renderRutas(rutaInicial: string) {
  const qc = new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: 60_000 },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={qc}>
      <ProveedorTema>
        <MemoryRouter
          initialEntries={[rutaInicial]}
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <RutasApp />
        </MemoryRouter>
      </ProveedorTema>
    </QueryClientProvider>,
  );
}

describe("RutasApp · apoderado-vistas-academicas-multi-hijo", () => {
  it("navega vistas académicas reales de Apoderado, cambia de menor en vivo y conserva puente en Asistencia", async () => {
    const user = userEvent.setup();

    server.use(
      http.get("*/api/v1/identidad/sesion", () => HttpResponse.json(SESION_APODERADO)),
      http.get("*/api/v1/seguimiento/apoderados/apo-demo-1/hijos/:estudianteId/inicio", ({ params }) =>
        HttpResponse.json({
          apoderado_id: "apo-demo-1",
          estudiante_id: params.estudianteId,
          estudiante_nombre:
            params.estudianteId === "est-demo-2"
              ? "Sofía Quispe Huamán"
              : "Luis Ángel Quispe Huamán",
          grado_seccion:
            params.estudianteId === "est-demo-2" ? "1.° de Secundaria A" : "3.° de Secundaria B",
          sin_leer: 0,
          pendientes_total: 1,
          asistencia_porcentaje: "96%",
          resumen_asistencia: { porcentaje: "96%", presentes: 48, tardanzas: 1, faltas: 1 },
          proximas_entregas: [],
          mensajes_bandeja: [],
        }),
      ),
      http.get("*/api/v1/seguimiento/estudiantes/est-demo-1/cursos", () =>
        HttpResponse.json({
          grado_seccion: "3.° de Secundaria B",
          total_pendientes: 1,
          cursos: [
            {
              asignatura_id: "mat",
              nombre: "Matemática",
              docente: "Prof. Julio Gamboa Rojas",
              rol_docente: "Docente titular",
              horario: "Lun · Mié · Vie",
              horas_semanales: 6,
              pendientes: 1,
              proximo_vencimiento: "Ficha: funciones lineales · 18 nov",
              mini_niveles: ["AD", "A"],
            },
          ],
        }),
      ),
      http.get("*/api/v1/seguimiento/estudiantes/est-demo-2/cursos", () =>
        HttpResponse.json({
          grado_seccion: "1.° de Secundaria A",
          total_pendientes: 1,
          cursos: [
            {
              asignatura_id: "cta",
              nombre: "Ciencia y Tecnología",
              docente: "Prof. Ana Lucía Torres",
              rol_docente: "Docente titular",
              horario: "Mar · Jue",
              horas_semanales: 5,
              pendientes: 1,
              proximo_vencimiento: "Maqueta del sistema solar · 17 nov",
              mini_niveles: ["AD", "AD"],
            },
          ],
        }),
      ),
      http.get("*/api/v1/seguimiento/estudiantes/est-demo-1/cursos/mat", () =>
        HttpResponse.json({
          asignatura_id: "mat",
          nombre: "Matemática",
          docente: "Prof. Julio Gamboa Rojas",
          rol_docente: "Docente titular",
          horario: "Lun · Mié · Vie",
          horas_semanales: 6,
          stream: [],
          competencias: [{ nombre: "Resuelve problemas de cantidad", trimestres: ["A", "A", "AD"] }],
          equipo: [{ nombre: "Prof. Julio Gamboa Rojas", rol: "Docente titular", grupo: "docente" }],
        }),
      ),
      http.get("*/api/v1/evaluacion/estudiantes/est-demo-1/calificaciones", () =>
        HttpResponse.json({
          trimestre_actual: 3,
          estado_trimestre: "En Evaluación",
          criterio_sugerencia: "mediana_capacidades",
          cursos: [
            {
              asignatura_id: "mat",
              nombre: "Matemática",
              docente: "Prof. Julio Gamboa Rojas",
              competencias: [{ nombre: "Resuelve problemas de cantidad", trimestres: ["A", "A", "AD"] }],
              conclusiones: [],
              calificativos_publicados: [],
            },
          ],
        }),
      ),
      http.get("*/api/v1/evaluacion/estudiantes/est-demo-1/actividades", () =>
        HttpResponse.json({
          pendientes: 1,
          vencen_pronto: 1,
          actividades: [
            {
              id: "act-t1",
              tipo: "trabajo",
              titulo: "Ficha: funciones lineales",
              curso: "Matemática",
              asignada: "11 nov",
              fecha_entrega: "18 nov",
              estado: "pendiente",
              urgente: true,
              competencia: "Regularidad",
              capacidad: "Traduce",
            },
          ],
        }),
      ),
      http.get("*/api/v1/evaluacion/estudiantes/est-demo-1/mensajes", () =>
        HttpResponse.json({
          sin_leer: 1,
          mensajes: [
            {
              id: "msg-1",
              tipo: "Tarea",
              remitente: "Prof. Julio Gamboa Rojas",
              curso: "Matemática",
              asunto: "Nueva ficha: funciones lineales",
              fecha: "Ayer",
              fecha_larga: "ayer, 19:05",
              destinatarios: "3.° B",
              cuerpo: "Resolver ejercicios 1 al 12.",
              actividad_id: "act-t1",
              no_leido: true,
              lectura_confirmada: false,
              respuestas: [],
            },
          ],
        }),
      ),
      http.get("*/api/v1/reportes/estudiantes/est-demo-1/libretas", () =>
        HttpResponse.json({
          estudiante_id: "est-demo-1",
          anio_escolar: 2026,
          grado_seccion: "3.° Secundaria · B",
          trimestres: [
            {
              trimestre_id: 2,
              nombre: "II Trimestre",
              rango_fechas: "1 jun – 11 sep",
              publicada: true,
              fecha_publicacion: "2026-09-11",
              areas: [
                {
                  nombre: "Matemática",
                  competencias: [{ competencia: "Cantidad", nivel: "A", conclusion: "" }],
                },
              ],
            },
          ],
          situacion_final: { calculada: false, codigo: null, etiqueta: null },
        }),
      ),
      http.get("*/api/v1/reportes/estudiantes/est-demo-2/libretas", () =>
        HttpResponse.json({
          estudiante_id: "est-demo-2",
          anio_escolar: 2026,
          grado_seccion: "1.° Secundaria · A",
          trimestres: [
            {
              trimestre_id: 2,
              nombre: "II Trimestre",
              rango_fechas: "1 jun – 11 sep",
              publicada: true,
              fecha_publicacion: "2026-09-11",
              areas: [
                {
                  nombre: "Ciencia y Tecnología",
                  competencias: [{ competencia: "Indaga", nivel: "AD", conclusion: "Destacado." }],
                },
              ],
            },
          ],
          situacion_final: { calculada: false, codigo: null, etiqueta: null },
        }),
      ),
      http.get("*/api/v1/asistencia/estudiantes/est-demo-2", () =>
        HttpResponse.json({
          estudiante_id: "est-demo-2",
          mes: 11,
          anio: 2026,
          seccion: "1.° A",
          kpis: {
            porcentaje: "98%",
            presentes: 10,
            tardanzas: 1,
            faltas: 0,
            justificadas: 0,
          },
          dias: [{ dia: 10, codigo: "T", nombre_estado: "Tardanza" }],
          incidencias: [
            {
              id: "inc-sof-t1",
              fecha: "Mar 10 nov",
              codigo: "T",
              nombre_estado: "Tardanza",
              detalle: "Ingreso 07:54 a primera hora.",
              puede_justificar: true,
              justificacion_enviada: false,
            },
          ],
        }),
      ),
    );

    const { container } = renderRutas("/cursos");

    // 1. Cursos reales (est-demo-1)
    await waitFor(() => {
      expect(screen.getByText("Cursos de su menor")).toBeInTheDocument();
      expect(screen.getByText("Matemática")).toBeInTheDocument();
    });

    const nav = screen.getByRole("navigation", { name: "Navegación principal" });

    // 2. Calificaciones
    await user.click(within(nav).getByRole("link", { name: /^Calificaciones$/i }));
    await waitFor(() => {
      expect(screen.getByText("Resuelve problemas de cantidad")).toBeInTheDocument();
    });

    // 3. Trabajos
    await user.click(within(nav).getByRole("link", { name: /^Trabajos$/i }));
    await waitFor(() => {
      expect(screen.getByText("Ficha: funciones lineales")).toBeInTheDocument();
    });

    // 4. Mensajes (informativo sin respuesta abierta)
    await user.click(within(nav).getByRole("link", { name: /^Mensajes$/i }));
    await waitFor(() => {
      expect(screen.getByText(/Mensaje informativo: no admite respuestas/i)).toBeInTheDocument();
    });

    // 5. Libreta + cambio de menor en vivo
    await user.click(within(nav).getByRole("link", { name: /^Libreta oficial$/i }));
    await waitFor(() => {
      expect(screen.getByText(/3\.° Secundaria · B/)).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /Cambiar de menor/i }));
    await user.click(screen.getByRole("button", { name: /Sofía Quispe Huamán/i }));

    await waitFor(() => {
      expect(screen.getByText(/1\.° Secundaria · A/)).toBeInTheDocument();
    });
    expect(screen.getByText("Ciencia y Tecnología")).toBeInTheDocument();

    // 6. Asistencia real (Bloque 3) y cumplimiento RC08 sin vistas puente
    await user.click(within(nav).getByRole("link", { name: /^Asistencia$/i }));
    await waitFor(() => {
      expect(screen.getByText("Ingreso 07:54 a primera hora.")).toBeInTheDocument();
    });
    expect(screen.queryByText(/Módulo en preparación/i)).not.toBeInTheDocument();
    expect(container.querySelector('input[type="file"]')).toBeNull();
  });
});
