// Spec: seguimiento · Requirement: Tablero de inicio en tres variantes (RF01, HU10, AC01)
// Spec: seguimiento · Requirement: Filtro de novedades y marcado como visto (RF01, RF26, HU10)
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { MemoryRouter } from "react-router-dom";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";

import type { InicioEstudianteOut, UsuarioSesionOut } from "../../../api/generated/model";
import { ThemeProvider } from "../../../app/ThemeProvider";
import { guardarPreferenciasAvisos } from "../../../shared/preferencias/preferenciasAvisos";
import { InicioPage } from "../InicioPage";

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

const INICIO_DEMO: InicioEstudianteOut = {
  estudiante_id: "est-1",
  ultima_visita: "Ayer 19:20",
  novedades_sin_ver: 3,
  novedades: [
    {
      id: "nov-1",
      grupo: "Hoy",
      tipo: "calificativo",
      etiqueta: "Calificativo",
      curso: "Matemática",
      titulo: "Práctica calificada de ecuaciones",
      detalle: "Lograste nivel esperado.",
      nivel: "A",
      hora: "10:15",
      ruta_destino: "/cursos/mat",
    },
    {
      id: "nov-2",
      grupo: "Hoy",
      tipo: "asistencia",
      etiqueta: "Asistencia",
      curso: "Tutoría",
      titulo: "Tardanza registrada",
      detalle: "Ingreso 08:09.",
      hora: "08:15",
      ruta_destino: "/asistencia",
    },
    {
      id: "nov-3",
      grupo: "Ayer",
      tipo: "mensaje",
      etiqueta: "Mensaje",
      curso: "Comunicación",
      titulo: "Lectura para el viernes",
      detalle: "Traer ficha de análisis.",
      hora: "16:30",
      ruta_destino: "/mensajes",
    },
  ],
  kpis: [
    { clave: "asistencia", etiqueta: "Asistencia del mes", valor: "96%", subtitulo: "3.° B" },
    { clave: "pendientes", etiqueta: "Entregas pendientes", valor: "2", subtitulo: "1 vence pronto" },
    { clave: "nivel", etiqueta: "Logros esperados o más", valor: "82%", subtitulo: "III Trimestre" },
    { clave: "mensajes", etiqueta: "Mensajes sin leer", valor: "1", subtitulo: "Esta semana" },
  ],
  distribucion_niveles: [
    { nivel: "AD", nombre: "Logro destacado", cantidad: 4, porcentaje: 25 },
    { nivel: "A", nombre: "Logro esperado", cantidad: 9, porcentaje: 56 },
    { nivel: "B", nombre: "En proceso", cantidad: 3, porcentaje: 19 },
    { nivel: "C", nombre: "En inicio", cantidad: 0, porcentaje: 0 },
  ],
  agenda_semanal: [
    {
      etiqueta: "Lun",
      numero: 16,
      es_hoy: true,
      asistencia: "P",
      eventos: [{ titulo: "Exposición de Ciencia", tipo: "Evaluación", ruta_destino: "/trabajos" }],
    },
    {
      etiqueta: "Mar",
      numero: 17,
      es_hoy: false,
      asistencia: null,
      eventos: [],
    },
  ],
  proximas_entregas: [
    {
      id: "act-t1",
      titulo: "Ficha: funciones lineales",
      curso: "Matemática",
      fecha_entrega: "18 nov",
      estado_etiqueta: "Vence pronto",
      urgente: true,
    },
  ],
};

function renderInicio(usuario: UsuarioSesionOut = ESTUDIANTE_DEMO) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <ThemeProvider>
        <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <InicioPage usuario={usuario} />
        </MemoryRouter>
      </ThemeProvider>
    </QueryClientProvider>,
  );
}

describe("InicioPage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("permite alternar entre las 3 variantes A, B y C y recuerda la eleccion", async () => {
    const user = userEvent.setup();
    server.use(
      http.get("*/api/v1/seguimiento/estudiantes/est-1/inicio", () => {
        return HttpResponse.json(INICIO_DEMO);
      }),
    );

    const { unmount } = renderInicio();

    await waitFor(() => {
      expect(screen.getByText("Práctica calificada de ecuaciones")).toBeInTheDocument();
    });

    // Variante B
    await user.click(screen.getByRole("tab", { name: /B · Resumen por módulos/i }));
    expect(screen.getByText("Asistencia del mes")).toBeInTheDocument();
    expect(screen.getByText("Mis niveles · III Trimestre")).toBeInTheDocument();
    expect(screen.getByText("Logro destacado")).toBeInTheDocument();

    // Variante C
    await user.click(screen.getByRole("tab", { name: /C · Agenda semanal/i }));
    expect(screen.getByText("Exposición de Ciencia")).toBeInTheDocument();
    expect(screen.getByText(/Hoy/i)).toBeInTheDocument();

    // Persiste variante seleccionada
    unmount();
    renderInicio();
    await waitFor(() => {
      expect(screen.getByText("Exposición de Ciencia")).toBeInTheDocument();
    });
  });

  it("filtra novedades segun preferenciasAvisos y marca todo como visto", async () => {
    const user = userEvent.setup();
    guardarPreferenciasAvisos({
      calif: true,
      tareas: true,
      asist: false,
      obs: true,
    });

    let sinVerActual = 3;
    let ultimaVisitaActual = "Ayer 19:20";
    server.use(
      http.get("*/api/v1/seguimiento/estudiantes/est-1/inicio", () => {
        return HttpResponse.json({
          ...INICIO_DEMO,
          novedades_sin_ver: sinVerActual,
          ultima_visita: ultimaVisitaActual,
        });
      }),
      http.post("*/api/v1/seguimiento/estudiantes/est-1/novedades/visto", () => {
        sinVerActual = 0;
        ultimaVisitaActual = "Hoy 10:30";
        return HttpResponse.json({
          visto: true,
          ultima_visita: ultimaVisitaActual,
        });
      }),
    );

    renderInicio();

    await waitFor(() => {
      expect(screen.getByText("Práctica calificada de ecuaciones")).toBeInTheDocument();
    });

    // Asistencia desactivada en preferencias -> no aparece en feed
    expect(screen.queryByText("Tardanza registrada")).not.toBeInTheDocument();
    expect(screen.getByText(/3 novedades sin ver/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Marcar todo como visto/i }));

    await waitFor(() => {
      expect(screen.getByText(/0 novedades sin ver/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/Última visita: Hoy 10:30/i)).toBeInTheDocument();
  });

  it("conserva el conteo si falla Marcar todo como visto y maneja estado vacio y error", async () => {
    const user = userEvent.setup();
    let fallarInicio = true;
    server.use(
      http.get("*/api/v1/seguimiento/estudiantes/est-1/inicio", () => {
        if (fallarInicio) {
          return HttpResponse.json(
            { type: "about:blank", title: "Error", status: 500, detail: "Error temporal" },
            { status: 500 },
          );
        }
        return HttpResponse.json({
          ...INICIO_DEMO,
          novedades: [],
          proximas_entregas: [],
          novedades_sin_ver: 2,
        });
      }),
      http.post("*/api/v1/seguimiento/estudiantes/est-1/novedades/visto", () => {
        return HttpResponse.json(
          { type: "about:blank", title: "Error", status: 500, detail: "No se pudo guardar" },
          { status: 500 },
        );
      }),
    );

    renderInicio();

    await waitFor(() => {
      expect(screen.getByText(/No pudimos cargar tu inicio/i)).toBeInTheDocument();
    });

    fallarInicio = false;
    await user.click(screen.getByRole("button", { name: /Reintentar/i }));

    await waitFor(() => {
      expect(screen.getByText(/No tienes novedades recientes/i)).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /Marcar todo como visto/i }));
    await waitFor(() => {
      expect(screen.getByText(/No se pudo marcar las novedades como vistas/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/2 novedades sin ver/i)).toBeInTheDocument();
  });

  it("bloquea el tablero si el usuario no es estudiante", () => {
    renderInicio({
      id: "sec-1",
      dni: "40001122",
      nombres: "Ana",
      apellidos: "Pérez",
      rol: "Secretaría Académica",
      estudiante_id: null,
    });

    expect(screen.getByText(/Vista disponible solo para estudiantes/i)).toBeInTheDocument();
  });
});
