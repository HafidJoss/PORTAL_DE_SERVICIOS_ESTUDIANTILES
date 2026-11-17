// Spec: evaluacion · Requirement: Consulta de calificaciones por competencia y escala cualitativa (RF08, RF22, RF23, HU06, HU10)
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { MemoryRouter } from "react-router-dom";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import type {
  CalificacionesEstudianteOut,
  UsuarioSesionOut,
} from "../../../api/generated/model";
import { ThemeProvider } from "../../../app/ThemeProvider";
import { CalificacionesPage } from "../CalificacionesPage";

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const ESTUDIANTE_DEMO: UsuarioSesionOut = {
  id: "est-1",
  dni: "72458193",
  nombres: "Luis Ángel",
  apellidos: "Quispe Huamán",
  rol: "Estudiante",
  estudiante_id: "est-1",
  codigo_estudiante: "05123487210042",
  grado_seccion: "3.° de Secundaria B",
  tutor: "Prof. Rosa Cárdenas Palomino",
};

const CALIFICACIONES_DEMO: CalificacionesEstudianteOut = {
  trimestre_actual: 3,
  estado_trimestre: "En Evaluación",
  criterio_sugerencia: "mediana_capacidades",
  cursos: [
    {
      asignatura_id: "mat",
      nombre: "Matemática",
      docente: "Prof. Julio Gamboa Rojas",
      competencias: [
        {
          nombre: "Resuelve problemas de cantidad",
          trimestres: ["A", "A", "AD"],
          en_evaluacion_t3: true,
        },
      ],
      conclusiones: [
        {
          trimestre: "I Trimestre",
          competencia: "Resuelve problemas de regularidad, equivalencia y cambio",
          nivel: "B",
          texto: "Resuelve ecuaciones sencillas; practicar problemas de contexto.",
        },
      ],
      calificativos_publicados: [
        {
          id: "act-1",
          tipo: "trabajo",
          titulo: "Práctica calificada: sistemas de ecuaciones",
          fecha: "12 nov",
          competencia: "Regularidad, equivalencia y cambio",
          nivel: "A",
          comentario: "Planteas bien las ecuaciones; revisa los signos al despejar.",
        },
        {
          id: "act-2",
          tipo: "sesion_clase",
          titulo: "Sesión 16: método de igualación",
          fecha: "14 nov",
          competencia: "Regularidad, equivalencia y cambio",
          nivel: "AD",
          comentario: "",
        },
      ],
    },
    {
      asignatura_id: "com",
      nombre: "Comunicación",
      docente: "Prof. Elena Ayala Quispe",
      competencias: [
        {
          nombre: "Lee diversos tipos de textos escritos",
          trimestres: ["AD", "AD", "A"],
          en_evaluacion_t3: true,
        },
      ],
      conclusiones: [],
      calificativos_publicados: [],
    },
  ],
};

function renderCalificaciones(usuario: UsuarioSesionOut = ESTUDIANTE_DEMO) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <ThemeProvider>
        <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <CalificacionesPage usuario={usuario} />
        </MemoryRouter>
      </ThemeProvider>
    </QueryClientProvider>,
  );
}

describe("CalificacionesPage", () => {
  it("muestra leyenda cualitativa, tabla I/II/III*, conclusiones, calificativos y cambia entre cursos", async () => {
    const user = userEvent.setup();
    server.use(
      http.get("*/api/v1/evaluacion/estudiantes/est-1/calificaciones", () => {
        return HttpResponse.json(CALIFICACIONES_DEMO);
      }),
    );

    renderCalificaciones();

    await waitFor(() => {
      expect(screen.getByText("Resuelve problemas de cantidad")).toBeInTheDocument();
    });

    // Enlace a libreta y leyenda cualitativa (sin escala vigesimal ni promedio aritmético)
    expect(screen.getByRole("link", { name: /Ver libreta/i })).toHaveAttribute("href", "/libreta");
    expect(screen.getByText("Logro destacado")).toBeInTheDocument();
    expect(screen.getByText("Logro esperado")).toBeInTheDocument();
    expect(screen.queryByText(/Promedio general/i)).not.toBeInTheDocument();

    // Conclusiones y calificativos de Matemática
    expect(
      screen.getByText(/Resuelve ecuaciones sencillas; practicar problemas de contexto/i),
    ).toBeInTheDocument();
    expect(screen.getByText("Práctica calificada: sistemas de ecuaciones")).toBeInTheDocument();
    expect(screen.getByText("Sesión 16: método de igualación")).toBeInTheDocument();

    // Cambiar a Comunicación (sin calificativos publicados en el trimestre)
    await user.click(screen.getByRole("button", { name: /Comunicación/i }));
    expect(screen.getByText("Lee diversos tipos de textos escritos")).toBeInTheDocument();
    expect(
      screen.getByText(/Aún no hay calificativos publicados en este trimestre/i),
    ).toBeInTheDocument();
  });

  it("maneja fallo de carga con reintento y bloquea si no es estudiante", async () => {
    const user = userEvent.setup();
    let fallo = true;
    server.use(
      http.get("*/api/v1/evaluacion/estudiantes/est-1/calificaciones", () => {
        if (fallo) {
          return HttpResponse.json(
            { type: "about:blank", title: "Error", status: 500, detail: "Error de servidor" },
            { status: 500 },
          );
        }
        return HttpResponse.json(CALIFICACIONES_DEMO);
      }),
    );

    const { unmount } = renderCalificaciones();

    await waitFor(() => {
      expect(screen.getByText(/No pudimos cargar tus calificaciones/i)).toBeInTheDocument();
    });

    fallo = false;
    await user.click(screen.getByRole("button", { name: /Reintentar/i }));

    await waitFor(() => {
      expect(screen.getByText("Resuelve problemas de cantidad")).toBeInTheDocument();
    });
    unmount();

    renderCalificaciones({
      id: "aux-1",
      dni: "45001122",
      nombres: "Pedro",
      apellidos: "Soto",
      rol: "Auxiliar",
      estudiante_id: null,
    });
    expect(screen.getByText(/Vista disponible solo para estudiantes/i)).toBeInTheDocument();
  });

  it("alterna entre listado de cursos y detalle en viewport movil (< 1024 px)", async () => {
    const anchoOriginal = window.innerWidth;
    Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: 390 });
    try {
      const user = userEvent.setup();
      server.use(
        http.get("*/api/v1/evaluacion/estudiantes/est-1/calificaciones", () => {
          return HttpResponse.json(CALIFICACIONES_DEMO);
        }),
      );

      renderCalificaciones();

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /Matemática/i })).toBeInTheDocument();
      });

      // En móvil inicialmente solo se muestra la lista de cursos, sin el detalle
      expect(screen.queryByRole("heading", { name: "Matemática" })).not.toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: /Matemática/i }));
      expect(screen.getByRole("heading", { name: "Matemática" })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /Comunicación/i })).not.toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: /Volver a cursos/i }));
      expect(screen.getByRole("button", { name: /Comunicación/i })).toBeInTheDocument();
      expect(screen.queryByRole("heading", { name: "Matemática" })).not.toBeInTheDocument();
    } finally {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: anchoOriginal,
      });
    }
  });
});
