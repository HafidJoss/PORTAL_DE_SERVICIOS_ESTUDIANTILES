// Spec: identidad, plataforma-web, asistencia · Recorrido multi-hijo de asistencia y justificaciones para Apoderado
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
afterEach(() => {
  localStorage.clear();
  server.resetHandlers();
});
afterAll(() => server.close());

const SESION_APODERADO = {
  autenticado: true,
  usuario: {
    id: "apo-demo-1",
    dni: "40871256",
    nombres: "Rosa",
    apellidos: "Huamán Ccori",
    rol: "Apoderado",
    apoderado_id: "apo-demo-1",
    hijos_vinculados: [
      {
        estudiante_id: "est-demo-1",
        codigo: "20260001",
        nombres: "Luis Ángel",
        apellidos: "Quispe Huamán",
        grado_seccion: "3.° de Secundaria B",
        iniciales: "LQ",
        tutor: "Prof. Carlos Mendoza",
      },
      {
        estudiante_id: "est-demo-2",
        codigo: "20260002",
        nombres: "Sofía",
        apellidos: "Quispe Huamán",
        grado_seccion: "1.° de Secundaria A",
        iniciales: "SQ",
        tutor: "Prof. Ana Lucía Torres",
      },
    ],
  },
};

function renderRutas(rutaInicial: string) {
  const qc = new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: 60_000 },
      mutations: { retry: false },
    },
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

describe("RutasApp · apoderado-asistencia-y-justificaciones", () => {
  it("renderiza Asistencia real en /asistencia, envía justificación escrita y cambia de menor sin vistas puente", async () => {
    const user = userEvent.setup();
    let estadoLuis = {
      estudiante_id: "est-demo-1",
      mes: 11,
      anio: 2026,
      seccion: "3.° B",
      kpis: {
        porcentaje: "96%",
        presentes: 8,
        tardanzas: 1,
        faltas: 0,
        justificadas: 1,
      },
      dias: [{ dia: 4, codigo: "T", nombre_estado: "Tardanza" }],
      incidencias: [
        {
          id: "inc-t1",
          fecha: "Mié 4 nov",
          codigo: "T",
          nombre_estado: "Tardanza",
          detalle: "Ingreso 08:09.",
          puede_justificar: true,
          justificacion_enviada: false,
        },
      ],
    };

    server.use(
      http.get("*/api/v1/identidad/sesion", () => HttpResponse.json(SESION_APODERADO)),
      http.get("*/api/v1/asistencia/estudiantes/est-demo-1", () => HttpResponse.json(estadoLuis)),
      http.get("*/api/v1/asistencia/estudiantes/est-demo-2", () =>
        HttpResponse.json({
          estudiante_id: "est-demo-2",
          mes: 11,
          anio: 2026,
          seccion: "1.° A",
          kpis: {
            porcentaje: "98%",
            presentes: 10,
            tardanzas: 1,
            faltas: 0,
            justificadas: 0,
          },
          dias: [{ dia: 10, codigo: "T", nombre_estado: "Tardanza" }],
          incidencias: [
            {
              id: "inc-sof-t1",
              fecha: "Mar 10 nov",
              codigo: "T",
              nombre_estado: "Tardanza",
              detalle: "Ingreso 07:54 a primera hora.",
              puede_justificar: true,
              justificacion_enviada: false,
            },
          ],
        }),
      ),
      http.post(
        "*/api/v1/asistencia/apoderados/apo-demo-1/hijos/est-demo-1/justificaciones",
        async ({ request }) => {
          const body = (await request.json()) as {
            incidencia_id: string;
            motivo: string;
            detalle: string;
          };
          estadoLuis = {
            ...estadoLuis,
            incidencias: estadoLuis.incidencias.map((i) =>
              i.id === body.incidencia_id
                ? { ...i, puede_justificar: false, justificacion_enviada: true }
                : i,
            ),
          };
          return HttpResponse.json(
            {
              id: "just-inc-t1",
              incidencia_id: body.incidencia_id,
              estudiante_id: "est-demo-1",
              estado: "en_revision",
              motivo: body.motivo,
              detalle: body.detalle,
              mensaje: "Justificación enviada al auxiliar de educación.",
            },
            { status: 201 },
          );
        },
      ),
    );

    const { container } = renderRutas("/asistencia");

    await waitFor(() => {
      expect(screen.getByText("Ingreso 08:09.")).toBeInTheDocument();
    });
    expect(screen.queryByText(/Módulo en preparación/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /^Justificar$/i }));
    expect(container.querySelector('input[type="file"]')).toBeNull();

    await user.type(
      screen.getByLabelText(/Motivo detallado de la justificación/i),
      "Atención médica matinal debidamente informada.",
    );
    await user.click(screen.getByRole("button", { name: /Enviar al auxiliar/i }));

    await waitFor(() => {
      expect(screen.getByText(/Justificación enviada · en revisión/i)).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /Cambiar de menor/i }));
    await user.click(screen.getByRole("button", { name: /Sofía Quispe Huamán/i }));

    await waitFor(() => {
      expect(screen.getByText("98%")).toBeInTheDocument();
    });
    expect(screen.getByText("Ingreso 07:54 a primera hora.")).toBeInTheDocument();
  });
});
