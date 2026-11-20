// Spec: institucion · Requirement: Catálogo escolar (Secciones, Asignaturas CNEB, Asignaciones docentes) (RF03, RF18, HU08)
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { CatalogoAdminVista } from "../vistas/catalogoAdminVista";

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("CatalogoAdminVista", () => {
  it("opera las pestañas de Secciones, Asignaturas CNEB y Asignaciones docentes", async () => {
    const secciones = [
      {
        id: "S1A",
        nivel: "Secundaria" as const,
        grado: 1,
        letra: "A",
        nombre: "1.° A",
        tutor: "Prof. Karen Lozano Bendezú",
        auxiliar: "Sr. Héctor Palomino Ayala",
        cantidad_estudiantes: 2,
      },
      {
        id: "S1P",
        nivel: "Secundaria" as const,
        grado: 1,
        letra: "P",
        nombre: "1.° P",
        tutor: "Sin asignar",
        auxiliar: "Sin asignar",
        cantidad_estudiantes: 0,
      },
    ];
    let alertaCCSS: string | null = "Titular con licencia del 16 al 27 nov: asigna suplente";
    let suplenteCCSS = "";

    server.use(
      http.get("*/api/v1/institucion/secciones", () =>
        HttpResponse.json({
          nivel: "Secundaria",
          grado: 1,
          total_en_nivel: secciones.length,
          secciones,
          letras_disponibles: ["B", "C"],
          docentes_disponibles: ["Prof. Julio Gamboa Rojas", "Prof. Lucía Tineo Prado"],
          auxiliares_disponibles: ["Sr. Héctor Palomino Ayala"],
        }),
      ),
      http.post("*/api/v1/institucion/secciones", async ({ request }) => {
        const body = (await request.json()) as {
          nivel: "Secundaria";
          grado: number;
          letra: string;
          tutor: string;
          auxiliar: string;
        };
        const nueva = {
          id: `S${body.grado}${body.letra}`,
          nivel: body.nivel,
          grado: body.grado,
          letra: body.letra,
          nombre: `${body.grado}.° ${body.letra}`,
          tutor: body.tutor,
          auxiliar: body.auxiliar,
          cantidad_estudiantes: 0,
        };
        secciones.push(nueva);
        return HttpResponse.json(nueva, { status: 201 });
      }),
      http.get("*/api/v1/matriculas/sin-seccion", () =>
        HttpResponse.json({ total: 1, estudiantes: [] }),
      ),
      http.get("*/api/v1/matriculas/secciones/:id/estudiantes", ({ params }) =>
        HttpResponse.json({
          seccion_id: String(params.id),
          seccion_nombre: "1.° P",
          nivel: "Secundaria",
          grado: 1,
          total: 0,
          opciones_movimiento: [],
          estudiantes: [],
        }),
      ),
      http.get("*/api/v1/institucion/asignaturas", ({ request }) => {
        const url = new URL(request.url);
        const nivel = url.searchParams.get("nivel") ?? "Secundaria";
        return HttpResponse.json({
          nivel,
          total_asignaturas: 1,
          total_competencias: 2,
          asignaturas: [
            {
              nombre: nivel === "Transversales" ? "Competencias transversales" : "Matemática",
              nivel,
              competencias: [
                { codigo: "C1", descripcion: "Resuelve problemas de cantidad" },
                { codigo: "C2", descripcion: "Gestiona su aprendizaje de manera autónoma" },
              ],
            },
          ],
        });
      }),
      http.get("*/api/v1/institucion/asignaciones", () =>
        HttpResponse.json({
          seccion_id: "S2A",
          seccion_nombre: "2.° A",
          nivel: "Secundaria",
          grado: 2,
          tutor: "Prof. Miriam Huamaní Torres",
          auxiliar: "Sr. Héctor Palomino Ayala",
          alertas_pendientes: alertaCCSS ? 1 : 0,
          asignaciones: [
            {
              seccion_id: "S2A",
              asignatura: "Ciencias Sociales",
              titular: "Prof. Miriam Huamaní Torres",
              suplente: suplenteCCSS,
              alerta: alertaCCSS,
            },
          ],
          docentes_disponibles: ["Prof. Miriam Huamaní Torres", "Prof. Lucía Tineo Prado"],
        }),
      ),
      http.patch("*/api/v1/institucion/asignaciones", async ({ request }) => {
        const body = (await request.json()) as { suplente?: string };
        suplenteCCSS = body.suplente ?? "";
        alertaCCSS = null;
        return HttpResponse.json({
          seccion_id: "S2A",
          asignatura: "Ciencias Sociales",
          titular: "Prof. Miriam Huamaní Torres",
          suplente: suplenteCCSS,
          alerta: null,
        });
      }),
    );

    const qc = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    const user = userEvent.setup();

    render(
      <QueryClientProvider client={qc}>
        <CatalogoAdminVista />
      </QueryClientProvider>,
    );

    // 1) Secciones + crear nueva sección B
    expect(await screen.findByText("1.° A")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Nueva sección" }));
    await user.click(screen.getByRole("button", { name: /Crear sección 1.° B/i }));
    await waitFor(() => {
      expect(screen.getByText("1.° B")).toBeInTheDocument();
    });

    // 2) Pestaña Asignaturas y competencias
    await user.click(screen.getByRole("button", { name: "Asignaturas y competencias" }));
    expect(await screen.findByText("Matemática")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Transversales" }));
    expect(await screen.findByText("Competencias transversales")).toBeInTheDocument();

    // 3) Pestaña Asignaciones docentes y resolver alerta de licencia
    await user.click(screen.getByRole("button", { name: "Asignaciones docentes" }));
    expect(await screen.findByText(/Titular con licencia/i)).toBeInTheDocument();
    await user.selectOptions(
      screen.getByLabelText(/Suplente de Ciencias Sociales/i),
      "Prof. Lucía Tineo Prado",
    );
    await waitFor(() => {
      expect(screen.queryByText(/Titular con licencia/i)).not.toBeInTheDocument();
    });
  });
});
