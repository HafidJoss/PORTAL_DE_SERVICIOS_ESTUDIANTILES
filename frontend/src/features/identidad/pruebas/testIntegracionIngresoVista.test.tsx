// Spec: identidad · Requirement: Ingreso del estudiante mediante DNI y contraseña (RF14, AC04)
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { IngresoVista } from "../vistas/ingresoVista";

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderIngreso() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter
        initialEntries={["/ingresar"]}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <Routes>
          <Route path="/ingresar" element={<IngresoVista />} />
          <Route path="/inicio" element={<div>Pantalla Inicio</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("IngresoVista - Login", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("permite ingresar con DNI valido y contrasena y redirige a inicio", async () => {
    const user = userEvent.setup();
    server.use(
      http.post("*/api/v1/identidad/login", async ({ request }) => {
        const body = (await request.json()) as { dni: string; contrasena: string };
        return HttpResponse.json({
          autenticado: true,
          usuario: {
            id: "est-1",
            dni: body.dni,
            nombres: "Luis Ángel",
            apellidos: "Quispe Huamán",
            rol: "Estudiante",
            estudiante_id: "est-1",
            codigo_estudiante: "05123487210042",
            grado_seccion: "3.° de Secundaria B",
            tutor: "Prof. Rosa Cárdenas Palomino",
          },
        });
      }),
    );

    renderIngreso();

    await user.type(screen.getByLabelText("DNI"), "72458193");
    await user.type(screen.getByLabelText("Contraseña"), "mariscal2026");
    await user.click(screen.getByRole("button", { name: /^Ingresar$/ }));

    await waitFor(() => {
      expect(screen.getByText("Pantalla Inicio")).toBeInTheDocument();
    });
    expect(localStorage.getItem("portal-est-dni")).toBe("72458193");
  });

  it("valida localmente DNI incompleto o contrasena vacia sin llamar a la API", async () => {
    const user = userEvent.setup();
    let llamado = false;
    server.use(
      http.post("*/api/v1/identidad/login", () => {
        llamado = true;
        return HttpResponse.json({});
      }),
    );

    renderIngreso();

    await user.type(screen.getByLabelText("DNI"), "123");
    await user.click(screen.getByRole("button", { name: /^Ingresar$/ }));

    expect(screen.getByText(/8 dígitos/i)).toBeInTheDocument();
    expect(llamado).toBe(false);
  });

  it("muestra error Problem Details cuando la API responde 401", async () => {
    const user = userEvent.setup();
    server.use(
      http.post("*/api/v1/identidad/login", () => {
        return HttpResponse.json(
          {
            type: "about:blank",
            title: "Credenciales inválidas",
            status: 401,
            detail: "El DNI o la contraseña son incorrectos.",
          },
          { status: 401 },
        );
      }),
    );

    renderIngreso();

    await user.type(screen.getByLabelText("DNI"), "72458193");
    await user.type(screen.getByLabelText("Contraseña"), "incorrecta");
    await user.click(screen.getByRole("button", { name: /^Ingresar$/ }));

    await waitFor(() => {
      expect(
        screen.getByText("El DNI o la contraseña son incorrectos."),
      ).toBeInTheDocument();
    });
    expect(screen.queryByText("Pantalla Inicio")).not.toBeInTheDocument();
  });

  it("alterna visibilidad de contrasena y muestra ayuda de restablecimiento", async () => {
    const user = userEvent.setup();
    renderIngreso();

    const passInput = screen.getByLabelText("Contraseña");
    expect(passInput).toHaveAttribute("type", "password");

    await user.click(screen.getByRole("button", { name: "Mostrar contraseña" }));
    expect(passInput).toHaveAttribute("type", "text");

    await user.click(
      screen.getByRole("button", { name: "¿Olvidaste tu contraseña?" }),
    );
    expect(
      screen.getByText(/Solo el Administrador del colegio puede restablecerla/i),
    ).toBeInTheDocument();
  });
});

describe("IngresoVista - Activar cuenta y Aviso de privacidad", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("abre el dialogo con el Aviso de privacidad obtenido de la API (RF29)", async () => {
    const user = userEvent.setup();
    server.use(
      http.get("*/api/v1/identidad/aviso-privacidad", () => {
        return HttpResponse.json({
          version: "2026.1",
          actualizado_el: "2026-03-01",
          titulo: "Aviso de Privacidad y Protección de Datos Personales",
          contenido: "Tratamiento conforme a la Ley N.º 29733 y D. S. N.º 016-2024-JUS.",
        });
      }),
    );

    renderIngreso();

    await user.click(screen.getByRole("tab", { name: "Activar cuenta" }));
    await user.click(screen.getByRole("button", { name: /Aviso de privacidad/i }));

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
    expect(
      screen.getByText(/Tratamiento conforme a la Ley N\.º 29733/i),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Cerrar" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("bloquea la activacion si falta aceptar privacidad y no llama a la API", async () => {
    const user = userEvent.setup();
    let llamado = false;
    server.use(
      http.post("*/api/v1/identidad/activar", () => {
        llamado = true;
        return HttpResponse.json({ activada: true, mensaje: "ok" });
      }),
    );

    renderIngreso();

    await user.click(screen.getByRole("tab", { name: "Activar cuenta" }));
    await user.type(screen.getByLabelText("DNI"), "72458193");
    await user.type(screen.getByLabelText("Código de activación"), "k7m2qx");
    await user.type(screen.getByLabelText("Nueva contraseña"), "clave1234");
    await user.type(screen.getByLabelText("Confirmar contraseña"), "clave1234");
    await user.click(screen.getByRole("button", { name: "Activar cuenta" }));

    expect(screen.getByText(/Debes aceptar el Aviso de privacidad/i)).toBeInTheDocument();
    expect(llamado).toBe(false);
  });

  it("activa cuenta correctamente y permite volver a ingresar con el DNI precargado", async () => {
    const user = userEvent.setup();
    server.use(
      http.post("*/api/v1/identidad/activar", () => {
        return HttpResponse.json({
          activada: true,
          mensaje: "Cuenta activada correctamente.",
        });
      }),
    );

    renderIngreso();

    await user.click(screen.getByRole("tab", { name: "Activar cuenta" }));
    await user.type(screen.getByLabelText("DNI"), "72458193");
    await user.type(screen.getByLabelText("Código de activación"), "k7m2qx");
    await user.type(screen.getByLabelText("Nueva contraseña"), "clave1234");
    await user.type(screen.getByLabelText("Confirmar contraseña"), "clave1234");
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: "Activar cuenta" }));

    await waitFor(() => {
      expect(screen.getByText("Cuenta activada")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Ir a ingresar" }));
    expect(screen.getByLabelText("DNI")).toHaveValue("72458193");
  });
});
