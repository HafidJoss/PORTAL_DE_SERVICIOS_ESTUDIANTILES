// Spec: seguimiento · Requirement: Detalle del curso y sus cuatro pestañas (RF04, RF23, HU12, RC08)
// Spec: seguimiento · Requirement: Adaptación móvil y navegación accesible en seguimiento (AC04, AC06, AC07)
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import type {
  CursoDetalleOut,
  ListaActividadesOut,
  UsuarioSesionOut,
} from "../../../api/generated/model";
import { ThemeProvider } from "../../../app/ThemeProvider";
import { CursoDetallePage } from "../CursoDetallePage";

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

const DETALLE_MAT: CursoDetalleOut = {
  asignatura_id: "mat",
  nombre: "Matemática",
  docente: "Prof. Julio Gamboa Rojas",
  rol_docente: "Docente titular",
  horario: "Lun y Mié 08:00 - 09:30",
  horas_semanales: 6,
  stream: [
    {
      titulo: "Práctica calificada: sistemas de ecuaciones",
      subtitulo: "Calificativo publicado",
      fecha: "12 nov",
      tipo: "calificativo",
      nivel: "A",
      cuerpo: "Buen planteamiento de ecuaciones.",
    },
  ],
  competencias: [
    {
      nombre: "Resuelve problemas de cantidad",
      trimestres: ["A", "A", "AD"],
    },
  ],
  equipo: [
    {
      nombre: "Prof. Julio Gamboa Rojas",
      rol: "Docente titular",
      grupo: "docente",
    },
    {
      nombre: "Prof. Rosa Cárdenas Palomino",
      rol: "Tutora de 3.° B",
      grupo: "equipo_seccion",
    },
  ],
};

const ACTIVIDADES_DEMO: ListaActividadesOut = {
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
      competencia: "Resuelve problemas de regularidad",
      capacidad: "Traduce datos",
      descripcion: "Resolver ejercicios 1 al 12.",
    },
    {
      id: "act-otra",
      tipo: "trabajo",
      titulo: "Ensayo literario",
      curso: "Comunicación",
      asignada: "10 nov",
      fecha_entrega: "20 nov",
      estado: "pendiente",
      urgente: false,
      competencia: "Escribe textos",
      capacidad: "Organiza ideas",
    },
  ],
};

function renderDetalle(rutaInicial: string) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <ThemeProvider>
        <MemoryRouter
          initialEntries={[rutaInicial]}
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <Routes>
            <Route path="/cursos/:asignaturaId" element={<CursoDetallePage usuario={ESTUDIANTE_DEMO} />} />
            <Route path="/cursos" element={<div>Listado de cursos</div>} />
          </Routes>
        </MemoryRouter>
      </ThemeProvider>
    </QueryClientProvider>,
  );
}

describe("CursoDetallePage", () => {
  it("navega entre Novedades, Trabajos, Calificaciones y Personas cumpliendo RC08", async () => {
    const user = userEvent.setup();
    server.use(
      http.get("*/api/v1/seguimiento/estudiantes/est-1/cursos/mat", () => {
        return HttpResponse.json(DETALLE_MAT);
      }),
      http.get("*/api/v1/evaluacion/estudiantes/est-1/actividades", () => {
        return HttpResponse.json(ACTIVIDADES_DEMO);
      }),
    );

    const { container } = renderDetalle("/cursos/mat");

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Matemática" })).toBeInTheDocument();
    });

    // Novedades (default)
    expect(screen.getByText("Práctica calificada: sistemas de ecuaciones")).toBeInTheDocument();
    expect(screen.getByText("Mi nivel actual")).toBeInTheDocument();

    // Trabajos: filtra solo Matemática y sin subida de archivos (RC08)
    await user.click(screen.getByRole("tab", { name: "Trabajos" }));
    expect(screen.getByText("Ficha: funciones lineales")).toBeInTheDocument();
    expect(screen.queryByText("Ensayo literario")).not.toBeInTheDocument();
    expect(container.querySelector('input[type="file"]')).toBeNull();
    expect(screen.getByText(/el portal no recibe archivos/i)).toBeInTheDocument();

    // Calificaciones
    await user.click(screen.getByRole("tab", { name: "Calificaciones" }));
    expect(screen.getAllByText("Resuelve problemas de cantidad").length).toBeGreaterThan(0);
    expect(screen.getByText(/III Trimestre en evaluación/i)).toBeInTheDocument();

    // Personas
    await user.click(screen.getByRole("tab", { name: "Personas" }));
    expect(screen.getByText("Prof. Rosa Cárdenas Palomino")).toBeInTheDocument();
    expect(
      screen.getByText(/Los docentes te escriben desde el portal; la comunicación es en un solo sentido/i),
    ).toBeInTheDocument();
  });

  it("abre directamente la pestana indicada por query param y maneja curso inexistente", async () => {
    server.use(
      http.get("*/api/v1/seguimiento/estudiantes/est-1/cursos/mat", () => {
        return HttpResponse.json(DETALLE_MAT);
      }),
      http.get("*/api/v1/evaluacion/estudiantes/est-1/actividades", () => {
        return HttpResponse.json(ACTIVIDADES_DEMO);
      }),
      http.get("*/api/v1/seguimiento/estudiantes/est-1/cursos/no-existe", () => {
        return HttpResponse.json(
          { type: "about:blank", title: "No encontrado", status: 404, detail: "Curso inexistente" },
          { status: 404 },
        );
      }),
    );

    const { unmount } = renderDetalle("/cursos/mat?tab=personas");
    await waitFor(() => {
      expect(screen.getByText(/comunicación es en un solo sentido/i)).toBeInTheDocument();
    });
    unmount();

    renderDetalle("/cursos/no-existe");
    await waitFor(() => {
      expect(screen.getByText(/No pudimos cargar este curso/i)).toBeInTheDocument();
    });
    expect(screen.getByRole("link", { name: /Volver a Mis cursos/i })).toHaveAttribute("href", "/cursos");
  });
});
