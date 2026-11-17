// Spec: asistencia · Requirement: Consulta mensual e indicadores de asistencia (RF20, HU16, AC01)
// Spec: asistencia · Requirement: Calendario lunes a viernes, códigos e incidencias mensuales (RF20, HU16, RC08, AC04)
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import type { AsistenciaMesOut, UsuarioSesionOut } from "../../../api/generated/model";
import { ProveedorTema } from "../../../app/proveedorTema";
import { AsistenciaVista } from "../vistas/asistenciaVista";

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const ESTUDIANTE_DEMO: UsuarioSesionOut = {
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

const ASISTENCIA_NOV: AsistenciaMesOut = {
  estudiante_id: "est-1",
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
  dias: [
    { dia: 2, codigo: "P", nombre_estado: "Presente" },
    { dia: 3, codigo: "FE", nombre_estado: "Feriado / evento" },
    { dia: 4, codigo: "T", nombre_estado: "Tardanza" },
    { dia: 5, codigo: "F", nombre_estado: "Falta injustificada" },
    { dia: 6, codigo: "FJ", nombre_estado: "Falta justificada" },
    { dia: 9, codigo: "TJ", nombre_estado: "Tardanza justificada" },
  ],
  incidencias: [
    {
      fecha: "Mié 4 nov",
      codigo: "T",
      nombre_estado: "Tardanza",
      detalle: "Ingreso 08:09.",
    },
    {
      fecha: "Vie 6 nov",
      codigo: "FJ",
      nombre_estado: "Falta justificada",
      detalle: "Cita médica justificada por el apoderado.",
    },
  ],
};

const ASISTENCIA_OCT: AsistenciaMesOut = {
  estudiante_id: "est-1",
  mes: 10,
  anio: 2026,
  seccion: "3.° B",
  kpis: {
    porcentaje: "100%",
    presentes: 21,
    tardanzas: 0,
    faltas: 0,
    justificadas: 0,
  },
  dias: [{ dia: 1, codigo: "P", nombre_estado: "Presente" }],
  incidencias: [],
};

function renderAsistencia(usuario: UsuarioSesionOut = ESTUDIANTE_DEMO) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <ProveedorTema>
        <AsistenciaVista usuario={usuario} />
      </ProveedorTema>
    </QueryClientProvider>,
  );
}

describe("AsistenciaVista", () => {
  it("muestra KPIs, calendario L-V con leyenda P/T/F/FJ/TJ/FE e incidencias sin boton justificar", async () => {
    const user = userEvent.setup();
    const mesesConsultados: string[] = [];

    server.use(
      http.get("*/api/v1/asistencia/estudiantes/est-1", ({ request }) => {
        const url = new URL(request.url);
        const mes = url.searchParams.get("mes") ?? "11";
        mesesConsultados.push(mes);
        if (mes === "10") {
          return HttpResponse.json(ASISTENCIA_OCT);
        }
        return HttpResponse.json(ASISTENCIA_NOV);
      }),
    );

    renderAsistencia();

    await waitFor(() => {
      expect(screen.getByText("96%")).toBeInTheDocument();
    });

    expect(screen.getByText("Ingreso 08:09.")).toBeInTheDocument();
    expect(screen.getByText("Cita médica justificada por el apoderado.")).toBeInTheDocument();
    // Leyenda completa visible y sin botón de justificar (exclusivo de apoderado)
    expect(screen.getByText("Falta injustificada")).toBeInTheDocument();
    expect(screen.getByText("Tardanza justificada")).toBeInTheDocument();
    expect(screen.getByText("Feriado / evento")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Justificar/i })).not.toBeInTheDocument();

    // Cambiar a Octubre (mes=10) que no tiene incidencias
    await user.click(screen.getByRole("button", { name: "Oct" }));

    await waitFor(() => {
      expect(screen.getByText("100%")).toBeInTheDocument();
    });
    expect(mesesConsultados).toContain("10");
    expect(screen.getByText(/No se registran tardanzas ni faltas en este mes/i)).toBeInTheDocument();
  });

  it("muestra error con boton reintentar cuando falla la API y bloquea si no es estudiante", async () => {
    const user = userEvent.setup();
    let fallo = true;
    server.use(
      http.get("*/api/v1/asistencia/estudiantes/est-1", () => {
        if (fallo) {
          return HttpResponse.json(
            { type: "about:blank", title: "Error", status: 500, detail: "Error de servidor" },
            { status: 500 },
          );
        }
        return HttpResponse.json(ASISTENCIA_NOV);
      }),
    );

    renderAsistencia();

    await waitFor(() => {
      expect(screen.getByText(/No pudimos cargar tu asistencia/i)).toBeInTheDocument();
    });

    fallo = false;
    await user.click(screen.getByRole("button", { name: /Reintentar/i }));

    await waitFor(() => {
      expect(screen.getByText("96%")).toBeInTheDocument();
    });

    const { unmount } = renderAsistencia({
      id: "doc-1",
      dni: "44556677",
      nombres: "Julio",
      apellidos: "Gamboa",
      rol: "Docente",
      estudiante_id: null,
    });
    expect(screen.getByText(/Vista disponible solo para estudiantes/i)).toBeInTheDocument();
    unmount();
  });
});
