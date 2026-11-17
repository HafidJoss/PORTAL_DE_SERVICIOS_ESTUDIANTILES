// Spec: reportes · Panel SIAGIE por trimestre, enlace temporal firmado y bloqueo si faltan confirmaciones
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import type { ResumenSiagieDocenteOut, UsuarioSesionOut } from "../../../api/generated/model";
import { ProveedorTema } from "../../../app/proveedorTema";
import { ExportarSiagieVista } from "../vistas/exportarSiagieVista";

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
  secciones_a_cargo: ["3A", "3B"],
};

const RESUMEN_DEMO: ResumenSiagieDocenteOut = {
  asignatura: "Matemática",
  trimestres: [
    {
      trimestre_id: 2,
      nombre: "II Trim.",
      cerrado: true,
      secciones: [
        {
          seccion_id: "3A",
          nombre: "3.° A",
          estudiantes_total: 32,
          competencias_confirmadas: 4,
          competencias_total: 4,
          listo_para_exportar: true,
        },
        {
          seccion_id: "3B",
          nombre: "3.° B",
          estudiantes_total: 30,
          competencias_confirmadas: 4,
          competencias_total: 4,
          listo_para_exportar: true,
        },
      ],
    },
    {
      trimestre_id: 3,
      nombre: "III Trim.",
      cerrado: false,
      secciones: [
        {
          seccion_id: "3A",
          nombre: "3.° A",
          estudiantes_total: 32,
          competencias_confirmadas: 4,
          competencias_total: 4,
          listo_para_exportar: true,
        },
        {
          seccion_id: "3B",
          nombre: "3.° B",
          estudiantes_total: 30,
          competencias_confirmadas: 0,
          competencias_total: 4,
          listo_para_exportar: false,
        },
      ],
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
        <MemoryRouter
          initialEntries={["/siagie"]}
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <Routes>
            <Route path="/siagie" element={<ExportarSiagieVista usuario={DOCENTE_DEMO} />} />
            <Route path="/cursos/:asignaturaId" element={<div>Ir a cierre</div>} />
          </Routes>
        </MemoryRouter>
      </ProveedorTema>
    </QueryClientProvider>,
  );
}

describe("ExportarSiagieVista", () => {
  it("descarga enlace firmado en secciones listas y redirige a cierre si faltan competencias", async () => {
    const user = userEvent.setup();

    server.use(
      http.get("*/api/v1/reportes/docentes/doc-demo-1/siagie", () =>
        HttpResponse.json(RESUMEN_DEMO),
      ),
      http.post(
        "*/api/v1/reportes/docentes/doc-demo-1/siagie/3A/descarga",
        async ({ request }) => {
          const body = (await request.json()) as { formato: string };
          return HttpResponse.json({
            url_firmada: "https://storage.googleapis.com/portal-mariscal-stub/archivo",
            expira_en_segundos: 900,
            nombre_archivo:
              body.formato === "excel_siagie"
                ? "SIAGIE_Matematica_3A_T3.xlsx"
                : "Acta_preliminar_3A_T3.pdf",
          });
        },
      ),
    );

    renderVista();

    await waitFor(() => {
      expect(screen.getByText("Matemática · 3.° A")).toBeInTheDocument();
    });
    expect(screen.getByText("Listo para exportar")).toBeInTheDocument();
    expect(screen.getByText("Faltan 4 competencias")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Excel SIAGIE · 3\.° A/i }));
    await waitFor(() => {
      expect(screen.getByText(/SIAGIE_Matematica_3A_T3\.xlsx/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/15 min/i)).toBeInTheDocument();

    // Cambia a II Trim. (ambas secciones cerradas)
    await user.click(screen.getByRole("button", { name: "II Trim." }));
    expect(screen.queryByText("Faltan 4 competencias")).not.toBeInTheDocument();

    // Vuelve a III Trim. y pulsa botón en sección pendiente 3.° B -> navega a cierre
    await user.click(screen.getByRole("button", { name: "III Trim." }));
    await user.click(screen.getByRole("button", { name: /Completar cierre · 3\.° B/i }));
    await waitFor(() => {
      expect(screen.getByText("Ir a cierre")).toBeInTheDocument();
    });
  });

  it("permite reintentar ante fallo inicial y muestra aviso si falla la descarga", async () => {
    const user = userEvent.setup();
    let intentos = 0;

    server.use(
      http.get("*/api/v1/reportes/docentes/doc-demo-1/siagie", () => {
        intentos += 1;
        if (intentos === 1) {
          return HttpResponse.json(
            { type: "about:blank", title: "Error", status: 500, detail: "Falla" },
            { status: 500 },
          );
        }
        return HttpResponse.json(RESUMEN_DEMO);
      }),
      http.post("*/api/v1/reportes/docentes/doc-demo-1/siagie/3A/descarga", () =>
        HttpResponse.json(
          { type: "about:blank", title: "Incompleto", status: 400, detail: "Faltan competencias" },
          { status: 400 },
        ),
      ),
    );

    renderVista();

    await waitFor(() => {
      expect(screen.getByText(/No se pudo cargar Exportar al SIAGIE/i)).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /Reintentar/i }));
    await waitFor(() => {
      expect(screen.getByText("Matemática · 3.° A")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /Excel SIAGIE · 3\.° A/i }));
    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(/competencias/i);
    });
  });
});
