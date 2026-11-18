// Spec: seguimiento · Requirement: Listado resumen de mis cursos (RF04, HU12)
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { MemoryRouter } from "react-router-dom";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import type { ListaCursosOut, UsuarioSesionOut } from "../../../api/generated/model";
import { ProveedorTema } from "../../../app/proveedorTema";
import { CursosVista } from "../vistas/cursosVista";

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

const CURSOS_DEMO: ListaCursosOut = {
  grado_seccion: "3.° de Secundaria B",
  total_pendientes: 1,
  cursos: [
    {
      asignatura_id: "mat",
      nombre: "Matemática",
      docente: "Prof. Julio Gamboa Rojas",
      rol_docente: "Docente titular",
      horario: "Lun y Mié 08:00 - 09:30",
      horas_semanales: 6,
      pendientes: 1,
      proximo_vencimiento: "Vence 18 nov · Ficha: funciones lineales",
      mini_niveles: ["A", "A", "AD"],
    },
    {
      asignatura_id: "com",
      nombre: "Comunicación",
      docente: "Prof. Elena Ayala Quispe",
      rol_docente: "Docente titular",
      horario: "Mar y Jue 09:45 - 11:15",
      horas_semanales: 5,
      pendientes: 0,
      proximo_vencimiento: null,
      mini_niveles: ["AD", "A", "A"],
    },
  ],
};

function renderCursos(usuario: UsuarioSesionOut = ESTUDIANTE_DEMO) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <ProveedorTema>
        <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <CursosVista usuario={usuario} />
        </MemoryRouter>
      </ProveedorTema>
    </QueryClientProvider>,
  );
}

describe("CursosVista", () => {
  it("muestra la grilla de asignaturas, totales y accesos directos por curso", async () => {
    server.use(
      http.get("*/api/v1/seguimiento/estudiantes/est-1/cursos", () => {
        return HttpResponse.json(CURSOS_DEMO);
      }),
    );

    renderCursos();

    await waitFor(() => {
      expect(screen.getByText("Matemática")).toBeInTheDocument();
    });

    expect(screen.getByText("Comunicación")).toBeInTheDocument();
    expect(screen.getByText("Prof. Julio Gamboa Rojas")).toBeInTheDocument();
    expect(screen.getByText("Vence 18 nov · Ficha: funciones lineales")).toBeInTheDocument();
    expect(
      screen.getByText(/¡Excelente! No tienes entregas pendientes\./i),
    ).toBeInTheDocument();

    const enlacesTrabajos = screen.getAllByRole("link", { name: /Trabajos del curso/i });
    expect(enlacesTrabajos[0]).toHaveAttribute("href", "/cursos/mat?tab=trabajos");
  });

  it("maneja lista vacia, error con reintento y restriccion de perfil", async () => {
    const user = userEvent.setup();
    let fallo = true;
    server.use(
      http.get("*/api/v1/seguimiento/estudiantes/est-1/cursos", () => {
        if (fallo) {
          return HttpResponse.json(
            { type: "about:blank", title: "Error", status: 500, detail: "Error temporal" },
            { status: 500 },
          );
        }
        return HttpResponse.json({
          grado_seccion: "3.° de Secundaria B",
          total_pendientes: 0,
          cursos: [],
        });
      }),
    );

    renderCursos();

    await waitFor(() => {
      expect(screen.getByText(/No pudimos cargar tus cursos/i)).toBeInTheDocument();
    });

    fallo = false;
    await user.click(screen.getByRole("button", { name: /Reintentar/i }));

    await waitFor(() => {
      expect(screen.getByText(/Aún no tienes cursos asignados/i)).toBeInTheDocument();
    });

    const { unmount } = renderCursos({
      id: "dir-1",
      dni: "40009988",
      nombres: "Carlos",
      apellidos: "Medina",
      rol: "Dirección",
      estudiante_id: null,
    });
    expect(screen.getByText(/Vista disponible solo para estudiantes/i)).toBeInTheDocument();
    unmount();
  });

  // Spec: seguimiento · Requirement: Consulta multi-hijo de cursos y detalle de curso para el apoderado (RF04, HU12, DA05, RC08)
  it("renderiza los cursos del menor activo y actualiza al cambiar hijoActivoId", async () => {
    const apoderado: UsuarioSesionOut = {
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
    };

    server.use(
      http.get("*/api/v1/seguimiento/estudiantes/est-demo-1/cursos", ({ request }) => {
        const url = new URL(request.url);
        expect(url.searchParams.get("apoderado_id")).toBe("apo-demo-1");
        return HttpResponse.json(CURSOS_DEMO);
      }),
      http.get("*/api/v1/seguimiento/estudiantes/est-demo-2/cursos", ({ request }) => {
        const url = new URL(request.url);
        expect(url.searchParams.get("apoderado_id")).toBe("apo-demo-1");
        return HttpResponse.json({
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
              mini_niveles: ["AD", "AD", "A"],
            },
          ],
        });
      }),
    );

    const qc = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    const { rerender } = render(
      <QueryClientProvider client={qc}>
        <ProveedorTema>
          <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <CursosVista usuario={apoderado} hijoActivoId="est-demo-1" />
          </MemoryRouter>
        </ProveedorTema>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("Matemática")).toBeInTheDocument();
    });

    rerender(
      <QueryClientProvider client={qc}>
        <ProveedorTema>
          <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <CursosVista usuario={apoderado} hijoActivoId="est-demo-2" />
          </MemoryRouter>
        </ProveedorTema>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("Ciencia y Tecnología")).toBeInTheDocument();
    });
    expect(screen.getByText("Prof. Ana Lucía Torres")).toBeInTheDocument();
  });
});
