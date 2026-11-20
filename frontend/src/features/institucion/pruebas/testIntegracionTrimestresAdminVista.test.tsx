// Spec: institucion · Requirement: Gestión del ciclo de vida de trimestres, publicación de libreta y reapertura excepcional (RF05, RF18, RF27, RF30, HU09)
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import type { ListaTrimestresOut, TransicionTrimestreIn } from "../../../api/generated/model";
import { TrimestresAdminVista } from "../vistas/trimestresAdminVista";

const TRIMESTRES_INICIALES: ListaTrimestresOut = {
  anio_lectivo: 2026,
  trimestre_actual_corto: "III",
  trimestres: [
    {
      id: 2,
      nombre: "II Trimestre",
      nombre_corto: "II",
      fechas: "1 de junio – 28 de agosto de 2026",
      estado: "Cerrado",
      libreta_publicada: true,
      reabierto: false,
      siguiente_hito: "Libreta publicada",
      secciones_pendientes_cierre: 0,
    },
    {
      id: 3,
      nombre: "III Trimestre",
      nombre_corto: "III",
      fechas: "14 de septiembre – 18 de diciembre de 2026",
      estado: "En Evaluación",
      libreta_publicada: false,
      reabierto: false,
      siguiente_hito: "Cierre preliminar el 4 dic",
      secciones_pendientes_cierre: 6,
    },
  ],
};

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderTrimestres() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <TrimestresAdminVista />
    </QueryClientProvider>,
  );
}

describe("TrimestresAdminVista", () => {
  it("avanza el estado de un trimestre y valida motivo + oficio UGEL al reabrir un trimestre cerrado", async () => {
    const estado = structuredClone(TRIMESTRES_INICIALES);

    server.use(
      http.get("*/api/v1/institucion/trimestres", () => HttpResponse.json(estado)),
      http.post("*/api/v1/institucion/trimestres/:id/transicion", async ({ params, request }) => {
        const body = (await request.json()) as TransicionTrimestreIn;
        const t = estado.trimestres.find((item) => item.id === Number(params.id));
        if (!t) {
          return HttpResponse.json({ status: 404, title: "No encontrado", detail: "No existe" }, { status: 404 });
        }
        if (body.accion === "cierre_preliminar") {
          t.estado = "Cierre Preliminar";
          t.siguiente_hito = "Cierre el 18 dic";
        } else if (body.accion === "reabrir") {
          t.estado = "Cierre Preliminar";
          t.reabierto = true;
          t.libreta_publicada = false;
        }
        return HttpResponse.json(t);
      }),
    );

    const user = userEvent.setup();
    renderTrimestres();

    expect(await screen.findByText("Año escolar y trimestres")).toBeInTheDocument();
    expect(screen.getByText("III Trimestre")).toBeInTheDocument();

    // 1) Pasar III Trimestre a cierre preliminar
    await user.click(screen.getByRole("button", { name: "Pasar a cierre preliminar" }));
    expect(screen.getByText(/6 secciones aún no tienen todas sus competencias/i)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Confirmar cierre preliminar" }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Cerrar trimestre" })).toBeInTheDocument();
    });

    // 2) Reabrir II Trimestre con validación local de motivo y UGEL
    await user.click(screen.getByRole("button", { name: "Reabrir" }));
    await user.type(screen.getByLabelText(/Motivo/i), "Muy corto");
    await user.click(screen.getByRole("button", { name: "Reabrir trimestre" }));
    expect(screen.getByText(/mínimo 15 caracteres/i)).toBeInTheDocument();

    await user.clear(screen.getByLabelText(/Motivo/i));
    await user.type(
      screen.getByLabelText(/Motivo/i),
      "Corrección del nivel de 2 estudiantes en 4.° C de Matemática",
    );
    await user.click(screen.getByLabelText(/El Acta Oficial ya fue emitida/i));
    await user.click(screen.getByRole("button", { name: "Reabrir trimestre" }));
    expect(screen.getByRole("alert")).toHaveTextContent(/UGEL/i);

    await user.type(screen.getByLabelText(/autorización de la UGEL/i), "Oficio N.° 0345-2026-UGEL-HGA");
    await user.click(screen.getByRole("button", { name: "Reabrir trimestre" }));

    await waitFor(() => {
      expect(screen.getByText("Reabierto")).toBeInTheDocument();
    });
  });
});
