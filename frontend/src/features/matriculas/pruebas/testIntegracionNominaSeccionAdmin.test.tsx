// Spec: matriculas · Requirement: Pool Sin sección, nómina de sección, movimiento y estado (RF21, HU13)
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import type { NominaSeccionOut, PoolSinSeccionOut } from "../../../api/generated/model";
import { PanelNominaSeccionAdmin } from "../componentes/panelNominaSeccionAdmin";

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("PanelNominaSeccionAdmin", () => {
  it("asigna estudiante del pool al grado compatible, muestra resumen y cambia estado", async () => {
    const pool: PoolSinSeccionOut = {
      total: 2,
      estudiantes: [
        {
          id: "p0",
          nombre: "Prado Infanzón, Thiago",
          codigo: "05121048291001",
          nivel: "Secundaria",
          grado: 1,
          nota: "Va a 1.° de Secundaria · Traslado",
        },
        {
          id: "p4",
          nombre: "Torres Ore, Josué",
          codigo: "05121048291005",
          nivel: "Secundaria",
          grado: 4,
          nota: "Va a 4.° de Secundaria · Reincorporación",
        },
      ],
    };

    const nomina: NominaSeccionOut = {
      seccion_id: "S1P",
      seccion_nombre: "1.° P",
      nivel: "Secundaria",
      grado: 1,
      total: 0,
      opciones_movimiento: [{ id: "S1A", etiqueta: "Mover a 1.° A" }],
      estudiantes: [],
    };

    server.use(
      http.get("*/api/v1/matriculas/sin-seccion", () => HttpResponse.json(pool)),
      http.get("*/api/v1/matriculas/secciones/S1P/estudiantes", () => HttpResponse.json(nomina)),
      http.post("*/api/v1/matriculas/asignar", async ({ request }) => {
        const body = (await request.json()) as { estudiante_id: string };
        const idx = pool.estudiantes.findIndex((e) => e.id === body.estudiante_id);
        const [est] = pool.estudiantes.splice(idx, 1);
        pool.total = pool.estudiantes.length;
        const nuevo = {
          id: est.id,
          nombre: est.nombre,
          codigo: est.codigo,
          estado: "Activo" as const,
          resumen: {
            codigo_siagie: est.codigo,
            dni: "74500123",
            apoderado: "Prado, Rosa",
            tutor: "Sin asignar",
            asistencia_pct: 95,
            pendientes: 0,
            observaciones: 0,
            areas: [{ area: "Matemática", nivel: "A" as const }],
          },
        };
        nomina.estudiantes.push(nuevo);
        nomina.total = nomina.estudiantes.length;
        return HttpResponse.json(nuevo);
      }),
      http.patch("*/api/v1/matriculas/estudiantes/:id/estado", async ({ params, request }) => {
        const body = (await request.json()) as { estado: "Activo" | "Retirado" | "Trasladado" };
        const encontrado = nomina.estudiantes.find((e) => e.id === params.id)!;
        encontrado.estado = body.estado;
        return HttpResponse.json(encontrado);
      }),
    );

    const qc = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    const user = userEvent.setup();

    render(
      <QueryClientProvider client={qc}>
        <PanelNominaSeccionAdmin
          seccionId="S1P"
          seccionNombre="1.° P"
          nivel="Secundaria"
          grado={1}
          poolAbierto
          onCerrarPool={() => {}}
        />
      </QueryClientProvider>,
    );

    expect(await screen.findByText("Prado Infanzón, Thiago")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Es de 4.° grado" })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: /Asignar a 1.° P/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Resumen" })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Resumen" }));
    expect(screen.getByText("74500123")).toBeInTheDocument();
    expect(screen.getByText("95%")).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("Estado en la sección"), "Trasladado");
    await waitFor(() => {
      expect(screen.getByLabelText("Estado en la sección")).toHaveValue("Trasladado");
    });
  });
});
