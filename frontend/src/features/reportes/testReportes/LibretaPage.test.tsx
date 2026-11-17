// Spec: reportes · Requirement: Consulta de libretas trimestrales y estado de publicación (RF27, RF28, HU06)
// Spec: reportes · Requirement: Descarga segura de libreta en PDF mediante enlace temporal firmado (RF15, RC05, ADR-002, AC01)
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { MemoryRouter } from "react-router-dom";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import type { LibretasOut, UsuarioSesionOut } from "../../../api/generated/model";
import { ThemeProvider } from "../../../app/ThemeProvider";
import { LibretaPage } from "../LibretaPage";

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

const LIBRETAS_DEMO: LibretasOut = {
  estudiante_id: "est-1",
  anio_escolar: 2026,
  grado_seccion: "3.° Secundaria · B",
  trimestres: [
    {
      trimestre_id: 1,
      nombre: "I Trimestre",
      rango_fechas: "9 mar – 29 may",
      publicada: true,
      fecha_publicacion: "2026-06-05",
      areas: [
        {
          nombre: "Matemática",
          competencias: [
            {
              competencia: "Resuelve problemas de cantidad",
              nivel: "A",
              conclusion: "",
              es_transversal: false,
            },
          ],
        },
      ],
    },
    {
      trimestre_id: 2,
      nombre: "II Trimestre",
      rango_fechas: "1 jun – 11 sep",
      publicada: true,
      fecha_publicacion: "2026-09-11",
      areas: [
        {
          nombre: "Matemática",
          competencias: [
            {
              competencia: "Resuelve problemas de regularidad",
              nivel: "B",
              conclusion: "Practicar resolución de sistemas.",
              es_transversal: false,
            },
          ],
        },
        {
          nombre: "Competencias transversales",
          competencias: [
            {
              competencia: "Gestiona su aprendizaje de manera autónoma",
              nivel: "AD",
              conclusion: "",
              es_transversal: true,
            },
          ],
        },
      ],
    },
    {
      trimestre_id: 3,
      nombre: "III Trimestre",
      rango_fechas: "14 sep – 18 dic",
      publicada: false,
      fecha_publicacion: null,
      areas: [],
    },
  ],
  situacion_final: {
    calculada: true,
    codigo: "PRO",
    etiqueta: "Promovido",
  },
};

function renderLibreta(usuario: UsuarioSesionOut = ESTUDIANTE_DEMO) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <ThemeProvider>
        <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <LibretaPage usuario={usuario} />
        </MemoryRouter>
      </ThemeProvider>
    </QueryClientProvider>,
  );
}

describe("LibretaPage", () => {
  it("muestra libreta publicada por defecto, competencias transversales, situacion final y solicita URL firmada al descargar", async () => {
    const user = userEvent.setup();
    let descargaSolicitada = 0;

    server.use(
      http.get("*/api/v1/reportes/estudiantes/est-1/libretas", () => {
        return HttpResponse.json(LIBRETAS_DEMO);
      }),
      http.get("*/api/v1/reportes/estudiantes/est-1/libretas/2/descarga", () => {
        descargaSolicitada += 1;
        return HttpResponse.json({
          url_firmada:
            "https://storage.googleapis.com/portal-mariscal-stub/libreta-est-1-t2.pdf?X-Goog-Expires=900",
          expira_en_segundos: 900,
          nombre_archivo: "libreta_T2_est-1.pdf",
        });
      }),
    );

    renderLibreta();

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /Informe de progreso del aprendizaje/i }),
      ).toBeInTheDocument();
    });

    // No solicita URL de descarga antes de hacer clic
    expect(descargaSolicitada).toBe(0);
    expect(screen.getByText("2 de 3")).toBeInTheDocument();
    expect(screen.getByText(/Resuelve problemas de regularidad/i)).toBeInTheDocument();
    expect(screen.getByText(/Practicar resolución de sistemas/i)).toBeInTheDocument();
    expect(screen.getByText("Transversal")).toBeInTheDocument();
    expect(screen.getByText(/Promovido de grado/i)).toBeInTheDocument();
    expect(screen.getByText(/Acta Oficial de Evaluación se emite desde el SIAGIE/i)).toBeInTheDocument();

    // Solicita enlace firmado temporal (TTL 15 min) bajo demanda
    await user.click(screen.getByRole("button", { name: /Descargar PDF/i }));
    await waitFor(() => {
      expect(descargaSolicitada).toBe(1);
    });
    expect(screen.getByText(/Enlace temporal válido por 15 minutos/i)).toBeInTheDocument();
    const enlacePdf = screen.getByRole("link", { name: /libreta_T2_est-1\.pdf/i });
    expect(enlacePdf).toHaveAttribute(
      "href",
      "https://storage.googleapis.com/portal-mariscal-stub/libreta-est-1-t2.pdf?X-Goog-Expires=900",
    );

    // Cambiar a III Trimestre no publicado
    await user.click(screen.getByRole("button", { name: /III Trimestre/i }));
    expect(screen.getByText(/Libreta aún no publicada/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Descargar PDF/i })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Ir a Calificaciones/i })).toHaveAttribute(
      "href",
      "/calificaciones",
    );
  });

  it("maneja error al generar enlace firmado, error de carga y acceso no estudiante", async () => {
    const user = userEvent.setup();
    let falloLibretas = true;
    server.use(
      http.get("*/api/v1/reportes/estudiantes/est-1/libretas", () => {
        if (falloLibretas) {
          return HttpResponse.json(
            { type: "about:blank", title: "Error", status: 500, detail: "Falla temporal" },
            { status: 500 },
          );
        }
        return HttpResponse.json(LIBRETAS_DEMO);
      }),
      http.get("*/api/v1/reportes/estudiantes/est-1/libretas/2/descarga", () => {
        return HttpResponse.json(
          { type: "about:blank", title: "Error", status: 500, detail: "No se pudo firmar" },
          { status: 500 },
        );
      }),
    );

    const { unmount } = renderLibreta();

    await waitFor(() => {
      expect(screen.getByText(/No pudimos cargar tus libretas/i)).toBeInTheDocument();
    });

    falloLibretas = false;
    await user.click(screen.getByRole("button", { name: /Reintentar/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Descargar PDF/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /Descargar PDF/i }));
    await waitFor(() => {
      expect(screen.getByText(/No se pudo generar el enlace de descarga/i)).toBeInTheDocument();
    });
    unmount();

    renderLibreta({
      id: "adm-1",
      dni: "40000001",
      nombres: "Admin",
      apellidos: "Sistema",
      rol: "Administrador",
      estudiante_id: null,
    });
    expect(screen.getByText(/Vista disponible solo para estudiantes/i)).toBeInTheDocument();
  });
});
