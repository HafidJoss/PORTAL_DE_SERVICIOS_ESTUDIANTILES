// Spec: evaluacion · Nota del día (/nota-del-dia) en TDD integración
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { MemoryRouter } from "react-router-dom";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import type { PanelEvaluacionSeccionOut, UsuarioSesionOut } from "../../../api/generated/model";
import { ProveedorTema } from "../../../app/proveedorTema";
import { NotaDelDiaVista } from "../vistas/notaDelDiaVista";

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
  secciones_a_cargo: ["3A", "3B", "4A", "4C"],
};

function crearPanelStub(seccionId: string): PanelEvaluacionSeccionOut {
  return {
    seccion_id: seccionId,
    seccion_nombre: seccionId === "4A" ? "4.° A" : "3.° B",
    asignatura_nombre: "Matemática",
    nivel_educativo: "Secundaria",
    competencias: [
      {
        codigo: "C2",
        nombre: "Regularidad, equivalencia y cambio",
        capacidades: ["Traduce", "Comunica", "Usa estrategias", "Argumenta"],
      },
    ],
    estudiantes: [
      { indice: 0, codigo: "05120001", nombre: "Alarcón Medina, Lucero", iniciales: "LA", observaciones_total: 0 },
    ],
    sesiones: [
      {
        id: `${seccionId}s16`,
        competencia: "C2",
        capacidad_idx: 3,
        tema: "Pendiente y razón de cambio",
        evidencia: "Explicación en pizarra",
        fecha: "12 nov",
        criterios: ["K1", "K2", "K3", "K4"],
        notas_por_estudiante: {},
        ajustes_manuales: {},
        estado: "pendiente",
      },
    ],
    actividades: [],
    cierres: [],
    observaciones: [],
  };
}

function renderVista(ruta = "/nota-del-dia") {
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
          <NotaDelDiaVista usuario={DOCENTE_DEMO} />
        </MemoryRouter>
      </ProveedorTema>
    </QueryClientProvider>,
  );
}

describe("NotaDelDiaVista", () => {
  it("cambia entre secciones, publica la ficha del día y crea una clase rápida", async () => {
    const user = userEvent.setup();
    let notasGuardadas = false;
    let claseCreada = false;

    server.use(
      http.get("*/api/v1/evaluacion/docentes/doc-demo-1/secciones/:secId/clases", ({ params }) => {
        return HttpResponse.json(crearPanelStub(String(params.secId)));
      }),
      http.put(
        "*/api/v1/evaluacion/docentes/doc-demo-1/secciones/:secId/sesiones/:sesId/notas",
        async ({ params }) => {
          notasGuardadas = true;
          return HttpResponse.json({
            ...crearPanelStub(String(params.secId)).sesiones[0],
            id: String(params.sesId),
            estado: "registrada",
          });
        },
      ),
      http.post(
        "*/api/v1/evaluacion/docentes/doc-demo-1/secciones/:secId/sesiones",
        async ({ request, params }) => {
          claseCreada = true;
          const body = (await request.json()) as { tema: string; criterios: string[] };
          return HttpResponse.json(
            {
              id: `${String(params.secId)}s17`,
              competencia: "C2",
              capacidad_idx: 0,
              tema: body.tema,
              evidencia: "Ficha",
              fecha: "12 nov",
              criterios: body.criterios,
              notas_por_estudiante: {},
              ajustes_manuales: {},
              estado: "pendiente",
            },
            { status: 201 },
          );
        },
      ),
    );

    renderVista();

    await waitFor(() => {
      expect(screen.getByText("Pendiente y razón de cambio")).toBeInTheDocument();
    });

    // Cambia a sección 3.° B
    await user.click(screen.getByRole("button", { name: "3.° B" }));
    await waitFor(() => {
      expect(screen.getByText(/3\.° B · Matemática/i)).toBeInTheDocument();
    });

    // Completa criterios y publica
    await user.click(screen.getByRole("button", { name: /^Completar vacíos con A$/i }));
    await user.click(screen.getByRole("button", { name: /Guardar y publicar/i }));
    await waitFor(() => {
      expect(notasGuardadas).toBe(true);
    });

    // Abre creación rápida de clase y la crea
    await user.click(screen.getByRole("button", { name: /Nueva clase/i }));
    await user.type(screen.getByLabelText(/Tema de la clase/i), "Rectas paralelas");
    await user.click(screen.getByRole("button", { name: /Crear clase/i }));
    await waitFor(() => {
      expect(claseCreada).toBe(true);
    });
    expect(screen.getByText("Rectas paralelas")).toBeInTheDocument();
  });
});
