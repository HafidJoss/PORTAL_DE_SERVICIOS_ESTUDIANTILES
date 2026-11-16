// Spec: identidad · Requirement: Configuración personal, preferencias locales y cambio de contraseña (RF14, RC07, RC08)
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";

import type { UsuarioSesionOut } from "../../../api/generated/model";
import { ThemeProvider } from "../../../app/ThemeProvider";
import { ConfiguracionPage } from "../pages/ConfiguracionPage";

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const USUARIO_DEMO: UsuarioSesionOut = {
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

function renderConfig() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <ThemeProvider>
        <ConfiguracionPage usuario={USUARIO_DEMO} />
      </ThemeProvider>
    </QueryClientProvider>,
  );
}

describe("ConfiguracionPage", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  });

  it("muestra avatar de iniciales sin subida de foto y datos personales en solo lectura", () => {
    const { container } = renderConfig();

    expect(screen.getByText("LQ")).toBeInTheDocument();
    expect(container.querySelector('input[type="file"]')).toBeNull();
    expect(screen.getByText("72458193")).toBeInTheDocument();
    expect(screen.getByText("05123487210042")).toBeInTheDocument();
    expect(screen.getByText("3.° de Secundaria B")).toBeInTheDocument();
    expect(screen.getByText("Prof. Rosa Cárdenas Palomino")).toBeInTheDocument();
    expect(
      screen.getByText(/Para corregir tus datos, acércate a Secretaría Académica/i),
    ).toBeInTheDocument();
  });

  it("permite alternar tema y persistir interruptores de avisos tras recargar", async () => {
    const user = userEvent.setup();
    const { unmount } = renderConfig();

    await user.click(screen.getByRole("button", { name: "Oscuro" }));
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");

    const switchAsistencia = screen.getByRole("switch", { name: "Asistencia" });
    expect(switchAsistencia).toHaveAttribute("aria-checked", "true");
    await user.click(switchAsistencia);
    expect(switchAsistencia).toHaveAttribute("aria-checked", "false");

    unmount();
    renderConfig();

    expect(
      screen.getByRole("switch", { name: "Asistencia" }),
    ).toHaveAttribute("aria-checked", "false");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("actualiza la contrasena y limpia los campos cuando la API responde 200", async () => {
    const user = userEvent.setup();
    server.use(
      http.post("*/api/v1/identidad/cambiar-contrasena", () => {
        return HttpResponse.json({ mensaje: "Contraseña actualizada correctamente." });
      }),
    );

    renderConfig();

    const actual = screen.getByLabelText("Contraseña actual");
    const nueva = screen.getByLabelText("Nueva contraseña");
    const confirmar = screen.getByLabelText("Confirmar contraseña");

    await user.type(actual, "anterior123");
    await user.type(nueva, "nuevaClave123");
    await user.type(confirmar, "nuevaClave123");
    await user.click(screen.getByRole("button", { name: "Guardar contraseña" }));

    await waitFor(() => {
      expect(
        screen.getByText("Contraseña actualizada correctamente."),
      ).toBeInTheDocument();
    });
    expect(actual).toHaveValue("");
    expect(nueva).toHaveValue("");
    expect(confirmar).toHaveValue("");
  });

  it("muestra error Problem Details si la contrasena actual es rechazada por la API", async () => {
    const user = userEvent.setup();
    server.use(
      http.post("*/api/v1/identidad/cambiar-contrasena", () => {
        return HttpResponse.json(
          {
            type: "about:blank",
            title: "Contraseña incorrecta",
            status: 400,
            detail: "La contraseña actual no coincide.",
          },
          { status: 400 },
        );
      }),
    );

    renderConfig();

    await user.type(screen.getByLabelText("Contraseña actual"), "equivocada");
    await user.type(screen.getByLabelText("Nueva contraseña"), "nuevaClave123");
    await user.type(screen.getByLabelText("Confirmar contraseña"), "nuevaClave123");
    await user.click(screen.getByRole("button", { name: "Guardar contraseña" }));

    await waitFor(() => {
      expect(
        screen.getByText("La contraseña actual no coincide."),
      ).toBeInTheDocument();
    });
  });
});
