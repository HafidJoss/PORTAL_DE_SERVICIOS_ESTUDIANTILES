// Spec: identidad · Requirement: Protección de rutas privadas y cierre de sesión (RF14, AC04)
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { MemoryRouter } from "react-router-dom";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { RutasApp } from "../aplicacion";
import { ProveedorTema } from "../proveedorTema";

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderAppConRuta(rutaInicial: string) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <ProveedorTema>
        <MemoryRouter
          initialEntries={[rutaInicial]}
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <RutasApp />
        </MemoryRouter>
      </ProveedorTema>
    </QueryClientProvider>,
  );
}

describe("Protección de rutas y cierre de sesión", () => {
  it("redirige a ingresar cuando no existe sesion activa (401)", async () => {
    server.use(
      http.get("*/api/v1/identidad/sesion", () => {
        return HttpResponse.json(
          {
            type: "about:blank",
            title: "No autenticado",
            status: 401,
            detail: "Sesión no iniciada.",
          },
          { status: 401 },
        );
      }),
    );

    renderAppConRuta("/inicio");

    await waitFor(() => {
      expect(screen.getByText("Bienvenido al Portal Estudiantil")).toBeInTheDocument();
    });
  });

  it("muestra datos del usuario autenticado y cierra sesion limpiando cache", async () => {
    const user = userEvent.setup();
    let sesionActiva = true;
    let logoutLlamado = false;

    server.use(
      http.get("*/api/v1/identidad/sesion", () => {
        if (!sesionActiva) {
          return HttpResponse.json(
            { type: "about:blank", title: "No autenticado", status: 401, detail: "Sin sesión" },
            { status: 401 },
          );
        }
        return HttpResponse.json({
          autenticado: true,
          usuario: {
            id: "est-2",
            dni: "71234567",
            nombres: "Camila Sofía",
            apellidos: "Rojas Mendoza",
            rol: "Estudiante",
            estudiante_id: "est-2",
            codigo_estudiante: "05123487219999",
            grado_seccion: "4.° de Secundaria A",
            tutor: "Prof. Edwin Pariona",
          },
        });
      }),
      http.get("*/api/v1/seguimiento/estudiantes/est-2/inicio", () => {
        return HttpResponse.json({
          estudiante_id: "est-2",
          ultima_visita: "Hoy",
          novedades_sin_ver: 0,
          novedades: [],
          kpis: [],
          distribucion_niveles: [],
          agenda_semanal: [],
          proximas_entregas: [],
        });
      }),
      http.post("*/api/v1/identidad/logout", () => {
        logoutLlamado = true;
        sesionActiva = false;
        return HttpResponse.json({ mensaje: "Sesión cerrada correctamente." });
      }),
    );

    renderAppConRuta("/inicio");

    await waitFor(() => {
      expect(screen.getByText("Camila Sofía Rojas Mendoza")).toBeInTheDocument();
    });
    expect(screen.getByText("CM")).toBeInTheDocument();
    expect(screen.getByText("Estudiante · 4.° de Secundaria A")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Cerrar sesión/i }));

    await waitFor(() => {
      expect(screen.getByText("Bienvenido al Portal Estudiantil")).toBeInTheDocument();
    });
    expect(logoutLlamado).toBe(true);
  });
});
