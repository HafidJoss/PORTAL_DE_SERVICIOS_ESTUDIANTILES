// Spec: evaluacion · Envío de mensajes docentes sin adjuntos ni chat libre (RF25, RC08)
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { MemoryRouter } from "react-router-dom";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import type { BandejaEnviadosDocenteOut, UsuarioSesionOut } from "../../../api/generated/model";
import { ProveedorTema } from "../../../app/proveedorTema";
import { MensajesDocenteVista } from "../vistas/mensajesDocenteVista";

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

const BANDEJA_INICIAL: BandejaEnviadosDocenteOut = {
  secciones: [
    {
      seccion_id: "3B",
      nombre: "3.° B",
      estudiantes_total: 30,
      estudiantes: [
        { indice: 0, nombre: "Quispe Huamán, Luis Ángel" },
        { indice: 1, nombre: "Cárdenas Rojas, Diego" },
      ],
    },
    {
      seccion_id: "4A",
      nombre: "4.° A",
      estudiantes_total: 31,
      estudiantes: [{ indice: 0, nombre: "Huamaní Ccori, María José" }],
    },
  ],
  enviados: [
    {
      id: "env-1",
      tipo: "Tarea",
      seccion_id: "3B",
      destinatario: "3.° B",
      asunto: "Nueva ficha: funciones lineales",
      cuerpo: "Resuelvan los ejercicios 1 al 12.",
      fecha: "Ayer, 19:05",
    },
  ],
};

function renderVista() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <ProveedorTema>
        <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <MensajesDocenteVista usuario={DOCENTE_DEMO} />
        </MemoryRouter>
      </ProveedorTema>
    </QueryClientProvider>,
  );
}

describe("MensajesDocenteVista", () => {
  it("valida campos, envía mensaje sin input file y actualiza enviados", async () => {
    const user = userEvent.setup();
    let enviado = false;

    server.use(
      http.get("*/api/v1/evaluacion/docentes/doc-demo-1/mensajes", () =>
        HttpResponse.json(BANDEJA_INICIAL),
      ),
      http.post("*/api/v1/evaluacion/docentes/doc-demo-1/mensajes", async ({ request }) => {
        enviado = true;
        const body = (await request.json()) as {
          tipo: "Recordatorio";
          seccion_id: string;
          asunto: string;
          cuerpo: string;
        };
        return HttpResponse.json(
          {
            id: "env-99",
            tipo: body.tipo,
            seccion_id: body.seccion_id,
            destinatario: "4.° A",
            asunto: body.asunto,
            cuerpo: body.cuerpo,
            fecha: "Hoy, ahora",
          },
          { status: 201 },
        );
      }),
    );

    const { container } = renderVista();

    await waitFor(() => {
      expect(screen.getByText("Nueva ficha: funciones lineales")).toBeInTheDocument();
    });
    expect(container.querySelector('input[type="file"]')).toBeNull();

    // Validación antes de llamar API
    await user.click(screen.getByRole("button", { name: /^Enviar$/i }));
    expect(screen.getByRole("alert")).toHaveTextContent(/asunto debe tener/i);
    expect(enviado).toBe(false);

    // Selección Recordatorio + 4.° A + envío válido
    await user.click(screen.getByRole("button", { name: "Recordatorio" }));
    await user.click(screen.getByRole("button", { name: "4.° A" }));
    await user.type(screen.getByLabelText(/^Asunto$/i), "Traer compás el viernes");
    await user.type(
      screen.getByLabelText(/^Mensaje$/i),
      "Trabajaremos circunferencias y polígonos.",
    );
    await user.click(screen.getByRole("button", { name: /^Enviar$/i }));

    await waitFor(() => {
      expect(enviado).toBe(true);
    });
    expect(screen.getByText("Traer compás el viernes")).toBeInTheDocument();
  });
});
