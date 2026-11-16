// Spec: seguimiento, evaluacion, asistencia · Enrutamiento autenticado en RutasApp
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { MemoryRouter } from "react-router-dom";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { RutasApp } from "../App";
import { ThemeProvider } from "../ThemeProvider";

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function mockSesionEstudiante() {
  return http.get("*/api/v1/identidad/sesion", () => {
    return HttpResponse.json({
      autenticado: true,
      usuario: {
        id: "est-1",
        dni: "72458193",
        nombres: "Luis Ángel",
        apellidos: "Quispe Huamán",
        rol: "Estudiante",
        estudiante_id: "est-1",
        codigo_estudiante: "05123487210042",
        grado_seccion: "3.° de Secundaria B",
        tutor: "Prof. Rosa Cárdenas Palomino",
      },
    });
  });
}

function renderRuta(ruta: string) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <ThemeProvider>
        <MemoryRouter
          initialEntries={[ruta]}
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <RutasApp />
        </MemoryRouter>
      </ThemeProvider>
    </QueryClientProvider>,
  );
}

describe("RutasApp · seguimiento-estudiante-web", () => {
  it("renderiza InicioPage real en /inicio", async () => {
    server.use(
      mockSesionEstudiante(),
      http.get("*/api/v1/seguimiento/estudiantes/est-1/inicio", () => {
        return HttpResponse.json({
          estudiante_id: "est-1",
          ultima_visita: "Hoy 08:00",
          novedades_sin_ver: 1,
          novedades: [],
          kpis: [],
          distribucion_niveles: [],
          agenda_semanal: [],
          proximas_entregas: [],
        });
      }),
    );

    renderRuta("/inicio");

    await waitFor(() => {
      expect(screen.getByText("¡Hola, Luis!")).toBeInTheDocument();
    });
  });

  it("renderiza CursosPage y CursoDetallePage en /cursos y /cursos/:asignaturaId", async () => {
    server.use(
      mockSesionEstudiante(),
      http.get("*/api/v1/seguimiento/estudiantes/est-1/cursos", () => {
        return HttpResponse.json({
          grado_seccion: "3.° de Secundaria B",
          total_pendientes: 0,
          cursos: [
            {
              asignatura_id: "mat",
              nombre: "Matemática",
              docente: "Prof. Julio Gamboa Rojas",
              rol_docente: "Docente titular",
              horario: "Lun 08:00",
              horas_semanales: 6,
              pendientes: 0,
              proximo_vencimiento: null,
              mini_niveles: ["A"],
            },
          ],
        });
      }),
      http.get("*/api/v1/seguimiento/estudiantes/est-1/cursos/mat", () => {
        return HttpResponse.json({
          asignatura_id: "mat",
          nombre: "Matemática",
          docente: "Prof. Julio Gamboa Rojas",
          rol_docente: "Docente titular",
          horario: "Lun 08:00",
          horas_semanales: 6,
          stream: [],
          competencias: [],
          equipo: [],
        });
      }),
      http.get("*/api/v1/evaluacion/estudiantes/est-1/actividades", () => {
        return HttpResponse.json({ pendientes: 0, vencen_pronto: 0, actividades: [] });
      }),
    );

    const { unmount } = renderRuta("/cursos");
    await waitFor(() => {
      expect(screen.getByText("Prof. Julio Gamboa Rojas")).toBeInTheDocument();
    });
    unmount();

    renderRuta("/cursos/mat");
    await waitFor(() => {
      expect(screen.getByRole("tab", { name: "Novedades" })).toBeInTheDocument();
    });
  });

  it("renderiza TrabajosPage en /trabajos y AsistenciaPage en /asistencia", async () => {
    server.use(
      mockSesionEstudiante(),
      http.get("*/api/v1/evaluacion/estudiantes/est-1/actividades", () => {
        return HttpResponse.json({
          pendientes: 0,
          vencen_pronto: 0,
          actividades: [],
        });
      }),
      http.get("*/api/v1/asistencia/estudiantes/est-1", () => {
        return HttpResponse.json({
          estudiante_id: "est-1",
          mes: 11,
          anio: 2026,
          seccion: "3.° B",
          kpis: {
            porcentaje: "100%",
            presentes: 10,
            tardanzas: 0,
            faltas: 0,
            justificadas: 0,
          },
          dias: [],
          incidencias: [],
        });
      }),
    );

    const { unmount } = renderRuta("/trabajos");
    await waitFor(() => {
      expect(screen.getByText(/el portal no recibe archivos/i)).toBeInTheDocument();
    });
    unmount();

    renderRuta("/asistencia");
    await waitFor(() => {
      expect(screen.getByText("100%")).toBeInTheDocument();
    });
  });

  it("renderiza CalificacionesPage, MensajesPage y LibretaPage en las rutas finales", async () => {
    server.use(
      mockSesionEstudiante(),
      http.get("*/api/v1/evaluacion/estudiantes/est-1/calificaciones", () => {
        return HttpResponse.json({
          trimestre_actual: 3,
          estado_trimestre: "En Evaluación",
          criterio_sugerencia: "mediana_capacidades",
          cursos: [],
        });
      }),
      http.get("*/api/v1/evaluacion/estudiantes/est-1/mensajes", () => {
        return HttpResponse.json({
          sin_leer: 0,
          mensajes: [],
        });
      }),
      http.get("*/api/v1/reportes/estudiantes/est-1/libretas", () => {
        return HttpResponse.json({
          estudiante_id: "est-1",
          anio_escolar: 2026,
          grado_seccion: "3.° B",
          trimestres: [],
          situacion_final: { calculada: false, codigo: null, etiqueta: null },
        });
      }),
    );

    const r1 = renderRuta("/calificaciones");
    await waitFor(() => {
      expect(screen.getByText(/Aún no hay asignaturas calificadas/i)).toBeInTheDocument();
    });
    r1.unmount();

    const r2 = renderRuta("/mensajes");
    await waitFor(() => {
      expect(screen.getByText(/No hay mensajes en esta categoría/i)).toBeInTheDocument();
    });
    r2.unmount();

    renderRuta("/libreta");
    await waitFor(() => {
      expect(screen.getByText(/Sin trimestres disponibles/i)).toBeInTheDocument();
    });
  });
});
