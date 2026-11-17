// Spec: seguimiento, evaluacion · Detalle de sección docente en 6 pestañas (ADR-008)
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import type {
  DetalleSeccionDocenteOut,
  PanelEvaluacionSeccionOut,
  UsuarioSesionOut,
} from "../../../api/generated/model";
import { ProveedorTema } from "../../../app/proveedorTema";
import { CursoDocenteDetalleVista } from "../vistas/cursoDocenteDetalleVista";

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
  secciones_a_cargo: ["3A", "3B"],
};

const DETALLE_3B: DetalleSeccionDocenteOut = {
  seccion_id: "3B",
  nombre: "3.° B",
  asignatura: "Matemática",
  nivel_educativo: "Secundaria",
  horario: "Lun · Mié · Vie",
  aula: "Aula 14",
  tutor: "Prof. Rosa Cárdenas",
  estudiantes_total: 2,
  clases_registradas: 1,
  competencias_confirmadas: 0,
  competencias_total: 4,
  distribucion_niveles: [
    { nivel: "AD", nombre: "Logro destacado", cantidad: 1, porcentaje: 50 },
    { nivel: "A", nombre: "Logro esperado", cantidad: 1, porcentaje: 50 },
    { nivel: "B", nombre: "En proceso", cantidad: 0, porcentaje: 0 },
    { nivel: "C", nombre: "En inicio", cantidad: 0, porcentaje: 0 },
  ],
  pendientes: [],
  stream: [
    {
      id: "st-1",
      tipo: "Actividad",
      titulo: "Ficha: funciones lineales",
      subtitulo: "Entrega 18 nov",
      fecha: "11 nov",
      cuerpo: "Ejercicios 1 al 12.",
    },
  ],
};

const PANEL_3B: PanelEvaluacionSeccionOut = {
  seccion_id: "3B",
  seccion_nombre: "3.° B",
  asignatura_nombre: "Matemática",
  nivel_educativo: "Secundaria",
  competencias: [
    {
      codigo: "C1",
      nombre: "Resuelve problemas de cantidad",
      capacidades: ["Traduce", "Comunica", "Usa estrategias", "Argumenta"],
    },
  ],
  estudiantes: [
    { indice: 0, codigo: "05120001", nombre: "Quispe Huamán, Luis Ángel", iniciales: "LQ", observaciones_total: 0 },
  ],
  sesiones: [
    {
      id: "3Bs0",
      competencia: "C1",
      capacidad_idx: 0,
      tema: "Porcentajes",
      evidencia: "Ficha",
      fecha: "9 oct",
      criterios: ["K1", "K2", "K3", "K4"],
      notas_por_estudiante: { "0": ["A", "A", "AD", "A"] },
      ajustes_manuales: {},
      estado: "registrada",
    },
  ],
  actividades: [],
  cierres: [
    {
      competencia: "C1",
      confirmada: false,
      niveles_por_estudiante: {},
      conclusiones_por_estudiante: {},
    },
  ],
  observaciones: [],
};

function renderDetalle(ruta = "/cursos/3B") {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <ProveedorTema>
        <MemoryRouter
          initialEntries={[ruta]}
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <Routes>
            <Route path="/cursos" element={<div>Grilla Mis cursos</div>} />
            <Route
              path="/cursos/:asignaturaId"
              element={<CursoDocenteDetalleVista usuario={DOCENTE_DEMO} />}
            />
          </Routes>
        </MemoryRouter>
      </ProveedorTema>
    </QueryClientProvider>,
  );
}

describe("CursoDocenteDetalleVista", () => {
  it("navega las 6 pestañas, publica anuncio unidireccional y gestiona actividades sin adjuntos", async () => {
    const user = userEvent.setup();
    let actividadPublicada = false;

    server.use(
      http.get("*/api/v1/seguimiento/docentes/doc-demo-1/secciones/3B", () =>
        HttpResponse.json(DETALLE_3B),
      ),
      http.get("*/api/v1/evaluacion/docentes/doc-demo-1/secciones/3B/clases", () =>
        HttpResponse.json(PANEL_3B),
      ),
      http.post(
        "*/api/v1/seguimiento/docentes/doc-demo-1/secciones/3B/anuncios",
        async ({ request }) => {
          const body = (await request.json()) as { tipo: "Recordatorio"; texto: string };
          return HttpResponse.json(
            {
              id: "an-1",
              tipo: body.tipo,
              titulo: `${body.tipo} del docente`,
              subtitulo: "Comunicación unidireccional en la sección",
              fecha: "Ahora",
              cuerpo: body.texto,
            },
            { status: 201 },
          );
        },
      ),
      http.post(
        "*/api/v1/evaluacion/docentes/doc-demo-1/secciones/3B/actividades",
        async ({ request }) => {
          const body = (await request.json()) as {
            titulo: string;
            fecha_entrega: string;
            competencia: "C1";
            descripcion: string;
            estado: "borrador" | "publicada";
          };
          return HttpResponse.json({ id: "act-99", ...body }, { status: 201 });
        },
      ),
      http.post("*/api/v1/evaluacion/docentes/doc-demo-1/actividades/act-99/publicar", () => {
        actividadPublicada = true;
        return HttpResponse.json({
          id: "act-99",
          titulo: "Taller de funciones",
          fecha_entrega: "2026-11-26",
          competencia: "C1",
          descripcion: "Resolver puntos 1 al 5",
          estado: "publicada",
        });
      }),
    );

    const { container } = renderDetalle();

    await waitFor(() => {
      expect(screen.getByText("Matemática · 3.° B")).toBeInTheDocument();
    });

    // Publica anuncio unidireccional en Novedades (valida texto vacío primero)
    await user.click(screen.getByRole("button", { name: /^Publicar anuncio$/i }));
    expect(screen.getByRole("alert")).toHaveTextContent(/al menos 3 caracteres/i);

    await user.type(
      screen.getByLabelText(/Anuncio unidireccional para la sección/i),
      "Traer regla graduada para mañana.",
    );
    await user.click(screen.getByRole("button", { name: /^Publicar anuncio$/i }));
    await waitFor(() => {
      expect(screen.getByText("Traer regla graduada para mañana.")).toBeInTheDocument();
    });

    // Pestaña Clases
    await user.click(screen.getByRole("tab", { name: "Clases" }));
    expect(screen.getByText("Porcentajes")).toBeInTheDocument();

    // Pestaña Registro auxiliar
    await user.click(screen.getByRole("tab", { name: "Registro auxiliar" }));
    expect(screen.getByText(/Registro auxiliar cualitativo/i)).toBeInTheDocument();

    // Pestaña Actividades: sin input file (RC08), guarda borrador y publica
    await user.click(screen.getByRole("tab", { name: "Actividades" }));
    expect(container.querySelector('input[type="file"]')).toBeNull();
    await user.click(screen.getByRole("button", { name: /Nueva actividad/i }));
    await user.type(screen.getByLabelText(/Título de la actividad/i), "Taller de funciones");
    await user.click(screen.getByRole("button", { name: /Guardar borrador/i }));
    await waitFor(() => {
      expect(screen.getByText("Taller de funciones")).toBeInTheDocument();
    });
    await user.click(screen.getByRole("button", { name: /^Publicar$/i }));
    await waitFor(() => {
      expect(actividadPublicada).toBe(true);
    });

    // Pestaña Cierre
    await user.click(screen.getByRole("tab", { name: "Cierre" }));
    expect(screen.getByText(/Cierre trimestral de competencias/i)).toBeInTheDocument();

    // Pestaña Estudiantes
    await user.click(screen.getByRole("tab", { name: "Estudiantes" }));
    expect(screen.getByText("Quispe Huamán, Luis Ángel")).toBeInTheDocument();
  });

  it("abre pestaña inicial por query param ?tab=cierre y maneja sección inexistente 404", async () => {
    const user = userEvent.setup();

    server.use(
      http.get("*/api/v1/seguimiento/docentes/doc-demo-1/secciones/3B", () =>
        HttpResponse.json(DETALLE_3B),
      ),
      http.get("*/api/v1/evaluacion/docentes/doc-demo-1/secciones/3B/clases", () =>
        HttpResponse.json(PANEL_3B),
      ),
      http.get("*/api/v1/seguimiento/docentes/doc-demo-1/secciones/9Z", () =>
        HttpResponse.json(
          { type: "about:blank", title: "Sección no encontrada", status: 404, detail: "No existe" },
          { status: 404 },
        ),
      ),
      http.get("*/api/v1/evaluacion/docentes/doc-demo-1/secciones/9Z/clases", () =>
        HttpResponse.json(
          { type: "about:blank", title: "Sección no encontrada", status: 404, detail: "No existe" },
          { status: 404 },
        ),
      ),
    );

    const { unmount } = renderDetalle("/cursos/3B?tab=cierre");
    await waitFor(() => {
      expect(screen.getByText(/Cierre trimestral de competencias/i)).toBeInTheDocument();
    });
    unmount();

    renderDetalle("/cursos/9Z");
    await waitFor(() => {
      expect(screen.getByText(/Sección no encontrada/i)).toBeInTheDocument();
    });
    await user.click(screen.getByRole("button", { name: /Volver a Mis cursos/i }));
    expect(screen.getByText("Grilla Mis cursos")).toBeInTheDocument();
  });
});
