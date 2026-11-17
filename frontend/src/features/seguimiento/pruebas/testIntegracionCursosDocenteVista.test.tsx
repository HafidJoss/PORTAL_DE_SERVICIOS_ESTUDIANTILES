// Spec: seguimiento · Requirement: Grilla de secciones asignadas al docente en Mis cursos (RF04, RF06, HU12)
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { MemoryRouter } from "react-router-dom";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import type { ListaSeccionesDocenteOut, UsuarioSesionOut } from "../../../api/generated/model";
import { ProveedorTema } from "../../../app/proveedorTema";
import { CursosDocenteVista } from "../vistas/cursosDocenteVista";

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const DOCENTE_DEMO: UsuarioSesionOut = {
  id: "doc-demo-1",
  dni: "41257836",
  nombres: "Julio",
  apellidos: "Gamboa Rojas",
  rol: "Docente",
  docente_id: "doc-demo-1",
  especialidad: "Matemática",
  nivel_educativo: "Secundaria",
  secciones_a_cargo: ["3.° A", "3.° B"],
};

const SECCIONES_DEMO: ListaSeccionesDocenteOut = {
  asignatura_nombre: "Matemática",
  nivel_educativo: "Secundaria",
  anio_escolar: 2026,
  total_estudiantes: 62,
  secciones: [
    {
      seccion_id: "3A",
      nombre: "3.° A",
      horario: "Lun · Mar · Jue",
      aula: "Aula 12",
      tutor: "Prof. Edwin Pariona",
      estudiantes_total: 32,
      competencias_confirmadas: 4,
      competencias_total: 4,
      notas_pendientes: [],
    },
    {
      seccion_id: "3B",
      nombre: "3.° B",
      horario: "Lun · Mié · Vie",
      aula: "Aula 14",
      tutor: "Prof. Rosa Cárdenas",
      estudiantes_total: 30,
      competencias_confirmadas: 0,
      competencias_total: 4,
      notas_pendientes: [
        {
          sesion_id: "3Bs16",
          titulo: "Clase: Pendiente y razón de cambio",
          registrados: 0,
          total: 30,
          porcentaje: 0,
        },
      ],
    },
  ],
};

function renderCursosDocente(usuario: UsuarioSesionOut = DOCENTE_DEMO) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <ProveedorTema>
        <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <CursosDocenteVista usuario={usuario} />
        </MemoryRouter>
      </ProveedorTema>
    </QueryClientProvider>,
  );
}

describe("CursosDocenteVista", () => {
  it("muestra tarjetas por seccion, notas pendientes y avance de cierre", async () => {
    server.use(
      http.get("*/api/v1/seguimiento/docentes/doc-demo-1/cursos", () => {
        return HttpResponse.json(SECCIONES_DEMO);
      }),
    );

    renderCursosDocente();

    await waitFor(() => {
      expect(screen.getByText("Matemática · 3.° A")).toBeInTheDocument();
    });

    expect(screen.getByText("Matemática · 3.° B")).toBeInTheDocument();
    expect(screen.getByText("Todo calificado.")).toBeInTheDocument();
    expect(screen.getByText("Clase: Pendiente y razón de cambio")).toBeInTheDocument();
    expect(screen.getByText("Cierre: 4/4 competencias confirmadas")).toBeInTheDocument();
    expect(screen.getByText("Cierre: 0/4 competencias confirmadas")).toBeInTheDocument();
  });

  it("muestra estado vacio cuando no hay secciones y permite reintentar ante error", async () => {
    const user = userEvent.setup();
    let ok = false;

    server.use(
      http.get("*/api/v1/seguimiento/docentes/doc-demo-1/cursos", () => {
        if (!ok) {
          return HttpResponse.json(
            { type: "about:blank", title: "Error", status: 500, detail: "Falla" },
            { status: 500 },
          );
        }
        return HttpResponse.json({
          ...SECCIONES_DEMO,
          total_estudiantes: 0,
          secciones: [],
        });
      }),
    );

    renderCursosDocente();

    await waitFor(() => {
      expect(screen.getByText(/No se pudieron cargar tus secciones/i)).toBeInTheDocument();
    });

    ok = true;
    await user.click(screen.getByRole("button", { name: /Reintentar/i }));

    await waitFor(() => {
      expect(screen.getByText(/Sin secciones asignadas/i)).toBeInTheDocument();
    });
  });
});
