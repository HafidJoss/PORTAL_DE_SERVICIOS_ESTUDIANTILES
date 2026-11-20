// Spec: institucion · Requirement: Tablero operativo de inicio del Administrador y atención de solicitudes (RF31, HU17, AC04, AC07)
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { MemoryRouter } from "react-router-dom";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import type { TableroAdminOut } from "../../../api/generated/model";
import { InicioAdminVista } from "../vistas/inicioAdminVista";

const TABLERO_MOCK: TableroAdminOut = {
  anio_lectivo: 2026,
  fecha_actual_texto: "Jueves 12 de noviembre · Año escolar 2026",
  saludo: "Buenos días, Lic. Marco",
  periodo_texto: "III Trimestre · En Evaluación",
  kpis: {
    solicitudes_pendientes: 2,
    cuentas_sin_activar: 4,
    secciones_con_cierre: 2,
    total_secciones_seguimiento: 8,
  },
  solicitudes: [
    {
      id: "r1",
      tipo: "Cuenta",
      remitente: "Secretaría Académica",
      fecha: "Hoy, 07:45",
      asunto: "Restablecer contraseña: Juana Ccori Flores",
      detalle: "La apoderada se acercó con su DNI 41522870.",
      etiqueta_accion: "Ir a la cuenta",
      ruta_destino: "/cuentas",
      atendida: false,
      no_leida: true,
    },
    {
      id: "r3",
      tipo: "Reapertura",
      remitente: "Dirección",
      fecha: "Ayer, 17:02",
      asunto: "Reabrir II Trimestre: corrección en 4.° C",
      detalle: "Se solicita reabrir el II Trimestre para corregir C3.",
      etiqueta_accion: "Ir a trimestres",
      ruta_destino: "/trimestres",
      atendida: false,
      no_leida: true,
    },
  ],
  trimestre_actual: {
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
  avance_secciones: [
    { seccion: "1.° B", porcentaje: 100 },
    { seccion: "3.° B", porcentaje: 88 },
  ],
  resumen_cuentas: { activas: 10, pendientes: 4, bloqueadas: 1 },
};

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderInicioAdmin() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={["/inicio"]}>
        <InicioAdminVista />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("InicioAdminVista", () => {
  it("muestra KPIs, trimestre actual, avance por sección y permite atender una solicitud", async () => {
    let estadoTablero = structuredClone(TABLERO_MOCK);

    server.use(
      http.get("*/api/v1/institucion/tablero-admin", () => {
        return HttpResponse.json(estadoTablero);
      }),
      http.patch("*/api/v1/institucion/solicitudes/:id/atender", ({ params }) => {
        const encontrada = estadoTablero.solicitudes.find((s) => s.id === params.id);
        if (!encontrada) {
          return HttpResponse.json({ status: 404, title: "No encontrada", detail: "No existe" }, { status: 404 });
        }
        encontrada.atendida = true;
        encontrada.no_leida = false;
        estadoTablero = {
          ...estadoTablero,
          kpis: {
            ...estadoTablero.kpis,
            solicitudes_pendientes: estadoTablero.solicitudes.filter((s) => !s.atendida).length,
          },
        };
        return HttpResponse.json(encontrada);
      }),
    );

    const user = userEvent.setup();
    renderInicioAdmin();

    expect(await screen.findByText("Buenos días, Lic. Marco")).toBeInTheDocument();
    expect(screen.getByText("2/8")).toBeInTheDocument();
    expect(screen.getByText("III Trimestre")).toBeInTheDocument();
    expect(screen.getByText("1.° B")).toBeInTheDocument();
    expect(screen.getByText("100%")).toBeInTheDocument();

    await user.click(screen.getByText("Restablecer contraseña: Juana Ccori Flores"));
    expect(
      screen.getByText("La apoderada se acercó con su DNI 41522870."),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Marcar como atendida" }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Por atender (1)" })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Atendidas" }));
    expect(
      await screen.findByText("Restablecer contraseña: Juana Ccori Flores"),
    ).toBeInTheDocument();
  });
});
