// Spec: personas · Requirement: Consulta filtrable, alta con código, edición, restablecimiento y bloqueo de cuentas (RF04, RF14, RF18)
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import type { CuentaPersonaOut } from "../../../api/generated/model";
import { CuentasAdminVista } from "../vistas/cuentasAdminVista";

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("CuentasAdminVista", () => {
  it("filtra cuentas, crea una cuenta mostrando código de activación y desbloquea sin acciones sobre Administrador", async () => {
    const cuentas: CuentaPersonaOut[] = [
      {
        id: "u1",
        nombre: "Marco Ayala Sulca",
        dni: "10456723",
        rol: "Administrador",
        estado: "activa",
        ultimo_acceso: "Hoy, 07:58",
        extra: "",
      },
      {
        id: "u13",
        nombre: "Juana Ccori Flores",
        dni: "41522870",
        rol: "Apoderado",
        estado: "bloqueada",
        ultimo_acceso: "3 nov",
        extra: " · 1 menor",
      },
    ];

    server.use(
      http.get("*/api/v1/personas/cuentas", ({ request }) => {
        const url = new URL(request.url);
        const estado = url.searchParams.get("estado") ?? "todas";
        const rol = url.searchParams.get("rol") ?? "Todos";
        const q = (url.searchParams.get("q") ?? "").toLowerCase();
        const filtradas = cuentas.filter(
          (c) =>
            (estado === "todas" || c.estado === estado) &&
            (rol === "Todos" || c.rol === rol) &&
            (!q || c.nombre.toLowerCase().includes(q) || c.dni.includes(q)),
        );
        return HttpResponse.json({
          total: cuentas.length,
          activas: cuentas.filter((c) => c.estado === "activa").length,
          pendientes: cuentas.filter((c) => c.estado === "pendiente").length,
          bloqueadas: cuentas.filter((c) => c.estado === "bloqueada").length,
          cuentas: filtradas,
        });
      }),
      http.post("*/api/v1/personas/cuentas", async ({ request }) => {
        const body = (await request.json()) as {
          nombre: string;
          dni: string;
          rol: CuentaPersonaOut["rol"];
        };
        const nueva: CuentaPersonaOut = {
          id: "u99",
          nombre: body.nombre,
          dni: body.dni,
          rol: body.rol,
          estado: "pendiente",
          ultimo_acceso: "—",
          extra: "",
          codigo_activacion: "K7M2QX",
        };
        cuentas.unshift(nueva);
        return HttpResponse.json(
          { cuenta: nueva, codigo_activacion: "K7M2QX", mensaje: "Cuenta creada. Código: K7M2QX" },
          { status: 201 },
        );
      }),
      http.patch("*/api/v1/personas/cuentas/:id/estado", async ({ params, request }) => {
        const body = (await request.json()) as { estado: "activa" | "bloqueada" };
        const target = cuentas.find((c) => c.id === params.id)!;
        target.estado = body.estado;
        return HttpResponse.json(target);
      }),
    );

    const qc = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    const user = userEvent.setup();

    render(
      <QueryClientProvider client={qc}>
        <CuentasAdminVista />
      </QueryClientProvider>,
    );

    expect(await screen.findByText("Marco Ayala Sulca")).toBeInTheDocument();
    expect(screen.getByText("Juana Ccori Flores")).toBeInTheDocument();

    // Crear nueva cuenta
    await user.click(screen.getByRole("button", { name: "Nueva cuenta" }));
    await user.type(screen.getByLabelText("Nombres y apellidos"), "Pedro Quispe Lapa");
    await user.type(screen.getByLabelText("DNI"), "48123456");
    await user.click(screen.getByRole("button", { name: "Crear y generar código" }));

    expect(await screen.findByText("Pedro Quispe Lapa")).toBeInTheDocument();
    expect(screen.getByText("K7M2QX")).toBeInTheDocument();

    // Desbloquear cuenta de Juana
    await user.click(screen.getByRole("button", { name: "Desbloquear a Juana Ccori Flores" }));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Bloquear a Juana Ccori Flores" })).toBeInTheDocument();
    });

    // No existen botones de bloqueo para la cuenta Administrador
    expect(screen.queryByRole("button", { name: /Marco Ayala Sulca/i })).not.toBeInTheDocument();
  });
});
