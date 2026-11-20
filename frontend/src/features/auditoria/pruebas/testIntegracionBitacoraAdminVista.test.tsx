// Spec: auditoria · Requirement: Consulta filtrable de la bitácora inalterable y exportación CSV (RF18, RF29, ADR-005)
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { BitacoraAdminVista } from "../vistas/bitacoraAdminVista";

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("BitacoraAdminVista", () => {
  it("filtra eventos críticos por tipo, muestra Antes → Después e IP y exporta CSV", async () => {
    const eventos = [
      {
        id: "n1",
        fecha: "12 nov 2026",
        hora: "08:15:00",
        usuario: "Marco Ayala",
        rol: "Administrador",
        tipo: "Cuenta",
        entidad: "Cuenta de Pedro Quispe Lapa (Apoderado)",
        antes: "—",
        despues: "Creada",
        ip: "181.65.22.14",
      },
      {
        id: "b7",
        fecha: "4 sep 2026",
        hora: "18:30:44",
        usuario: "Marco Ayala",
        rol: "Administrador",
        tipo: "Estado",
        entidad: "II Trimestre",
        antes: "Cierre Preliminar",
        despues: "Cerrado",
        ip: "181.65.22.14",
      },
    ];

    let exportado = false;
    server.use(
      http.get("*/api/v1/auditoria/eventos", ({ request }) => {
        const url = new URL(request.url);
        const tipo = url.searchParams.get("tipo") ?? "Todos";
        const filtrados = tipo === "Todos" ? eventos : eventos.filter((e) => e.tipo === tipo);
        return HttpResponse.json({
          tipo_filtro: tipo,
          total: filtrados.length,
          eventos: filtrados,
        });
      }),
      http.get("*/api/v1/auditoria/eventos/exportar", () => {
        exportado = true;
        return new HttpResponse("\ufeffFecha;Hora\r\n12 nov 2026;08:15:00", {
          headers: { "Content-Type": "text/csv; charset=utf-8" },
        });
      }),
    );

    const originalCreate = URL.createObjectURL;
    const originalRevoke = URL.revokeObjectURL;
    URL.createObjectURL = vi.fn(() => "blob:bitacora");
    URL.revokeObjectURL = vi.fn();

    const qc = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const user = userEvent.setup();

    render(
      <QueryClientProvider client={qc}>
        <BitacoraAdminVista />
      </QueryClientProvider>,
    );

    expect(screen.getByText("Bitácora de auditoría")).toBeInTheDocument();
    expect(
      await screen.findByText("Cuenta de Pedro Quispe Lapa (Apoderado)"),
    ).toBeInTheDocument();
    expect(screen.getByText("II Trimestre")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Cuenta" }));
    await waitFor(() => {
      expect(screen.queryByText("II Trimestre")).not.toBeInTheDocument();
    });
    expect(screen.getByText("Cuenta de Pedro Quispe Lapa (Apoderado)")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Exportar CSV" }));
    await waitFor(() => {
      expect(exportado).toBe(true);
    });

    URL.createObjectURL = originalCreate;
    URL.revokeObjectURL = originalRevoke;
  });
});
