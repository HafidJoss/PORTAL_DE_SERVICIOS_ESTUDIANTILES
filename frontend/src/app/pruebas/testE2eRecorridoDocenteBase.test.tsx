// Spec: identidad, plataforma-web, seguimiento · Recorrido autenticado multi-rol para Docente
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

const SESION_DOCENTE = {
  autenticado: true,
  usuario: {
    id: "doc-demo-1",
    dni: "41257836",
    nombres: "Julio",
    apellidos: "Gamboa Rojas",
    rol: "Docente",
    docente_id: "doc-demo-1",
    especialidad: "Matemática",
    nivel_educativo: "Secundaria",
    secciones_a_cargo: ["3.° A", "3.° B"],
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

describe("RutasApp · docente-base-y-seguimiento", () => {
  it("inicia sesion docente, navega Inicio -> Mis cursos -> Configuracion y cierra sesion", async () => {
    const user = userEvent.setup();
    let sesionActiva = false;

    server.use(
      http.get("*/api/v1/identidad/sesion", () => {
        if (!sesionActiva) {
          return HttpResponse.json(
            { type: "about:blank", title: "No autenticado", status: 401, detail: "Sin sesión." },
            { status: 401 },
          );
        }
        return HttpResponse.json(SESION_DOCENTE);
      }),
      http.post("*/api/v1/identidad/login", () => {
        sesionActiva = true;
        return HttpResponse.json(SESION_DOCENTE);
      }),
      http.post("*/api/v1/identidad/logout", () => {
        sesionActiva = false;
        return HttpResponse.json({ mensaje: "Sesión cerrada correctamente." });
      }),
      http.get("*/api/v1/seguimiento/docentes/doc-demo-1/inicio", () =>
        HttpResponse.json({
          docente_id: "doc-demo-1",
          trimestre_actual: "III Trimestre en evaluación",
          fecha_etiqueta: "Jueves 12 de noviembre",
          sin_leer: 1,
          por_calificar_total: 1,
          mensajes_bandeja: [
            {
              id: "m2",
              origen: "estudiante",
              remitente: "Diego Cárdenas Rojas",
              nombre_corto: "Diego",
              seccion_id: "3B",
              seccion_nombre: "3.° B",
              asunto: "Consulta ejercicio 7",
              cuerpo: "¿Cómo hallo la pendiente?",
              fecha: "Hoy",
              leido: false,
              puede_responder: true,
              respuestas: [],
            },
          ],
          clases_hoy: [],
          notas_pendientes: [],
          alertas: [],
          etapas_trimestre: [],
        }),
      ),
      http.get("*/api/v1/seguimiento/docentes/doc-demo-1/cursos", () =>
        HttpResponse.json({
          asignatura_nombre: "Matemática",
          nivel_educativo: "Secundaria",
          anio_escolar: 2026,
          total_estudiantes: 62,
          secciones: [
            {
              seccion_id: "3B",
              nombre: "3.° B",
              horario: "Lun · Mié · Vie",
              aula: "Aula 14",
              tutor: "Prof. Rosa Cárdenas",
              estudiantes_total: 30,
              competencias_confirmadas: 1,
              competencias_total: 4,
              notas_pendientes: [],
            },
          ],
        }),
      ),
      http.get("*/api/v1/seguimiento/docentes/doc-demo-1/secciones/3B", () =>
        HttpResponse.json({
          seccion_id: "3B",
          nombre: "3.° B",
          asignatura: "Matemática",
          nivel_educativo: "Secundaria",
          horario: "Lun · Mié · Vie",
          aula: "Aula 14",
          tutor: "Prof. Rosa Cárdenas",
          estudiantes_total: 1,
          clases_registradas: 1,
          competencias_confirmadas: 0,
          competencias_total: 4,
          distribucion_niveles: [
            { nivel: "AD", nombre: "Logro destacado", cantidad: 0, porcentaje: 0 },
            { nivel: "A", nombre: "Logro esperado", cantidad: 1, porcentaje: 100 },
            { nivel: "B", nombre: "En proceso", cantidad: 0, porcentaje: 0 },
            { nivel: "C", nombre: "En inicio", cantidad: 0, porcentaje: 0 },
          ],
          pendientes: [],
          stream: [],
        }),
      ),
      http.get("*/api/v1/evaluacion/docentes/doc-demo-1/secciones/:secId/clases", ({ params }) =>
        HttpResponse.json({
          seccion_id: String(params.secId),
          seccion_nombre: params.secId === "4A" ? "4.° A" : "3.° B",
          asignatura_nombre: "Matemática",
          nivel_educativo: "Secundaria",
          competencias: [
            {
              codigo: "C2",
              nombre: "Regularidad, equivalencia y cambio",
              capacidades: ["Traduce", "Comunica", "Usa estrategias", "Argumenta"],
            },
          ],
          estudiantes: [
            { indice: 0, codigo: "05120001", nombre: "Quispe Huamán, Luis Ángel", iniciales: "LQ", observaciones_total: 0 },
          ],
          sesiones: [
            {
              id: `${String(params.secId)}s16`,
              competencia: "C2",
              capacidad_idx: 3,
              tema: "Pendiente y razón de cambio",
              evidencia: "Pizarra",
              fecha: "12 nov",
              criterios: ["K1", "K2", "K3", "K4"],
              notas_por_estudiante: {},
              ajustes_manuales: {},
              estado: "pendiente",
            },
          ],
          actividades: [],
          cierres: [],
          observaciones: [],
        }),
      ),
      http.get("*/api/v1/evaluacion/docentes/doc-demo-1/mensajes", () =>
        HttpResponse.json({
          secciones: [
            {
              seccion_id: "3B",
              nombre: "3.° B",
              estudiantes_total: 30,
              estudiantes: [{ indice: 0, nombre: "Quispe Huamán, Luis Ángel" }],
            },
          ],
          enviados: [
            {
              id: "env-1",
              tipo: "Tarea",
              seccion_id: "3B",
              destinatario: "3.° B",
              asunto: "Nueva ficha: funciones lineales",
              cuerpo: "Ejercicios 1 al 12.",
              fecha: "Ayer",
            },
          ],
        }),
      ),
      http.get("*/api/v1/reportes/docentes/doc-demo-1/siagie", () =>
        HttpResponse.json({
          asignatura: "Matemática",
          trimestres: [
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
              ],
            },
          ],
        }),
      ),
    );

    renderRutas("/ingresar");

    await user.type(screen.getByLabelText(/DNI/i), "41257836");
    await user.type(screen.getByLabelText("Contraseña"), "docente2026");
    await user.click(screen.getByRole("button", { name: /^Ingresar$/ }));

    await waitFor(() => {
      expect(screen.getByText(/Buenos días, Prof\. Julio/i)).toBeInTheDocument();
    });
    expect(screen.getByText("Portal Docente")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Exportar SIAGIE/i })).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: /Mis cursos/i }));
    await waitFor(() => {
      expect(screen.getByText("Matemática · 3.° B")).toBeInTheDocument();
    });

    // Entra al detalle real de la sección (6 pestañas activas, sin vista puente)
    await user.click(screen.getByRole("button", { name: /Matemática · 3\.° B/i }));
    await waitFor(() => {
      expect(screen.getByRole("tab", { name: "Registro auxiliar" })).toBeInTheDocument();
    });

    // Entra a Nota del día real (sin vista puente)
    await user.click(screen.getByRole("link", { name: /Nota del día/i }));
    await waitFor(() => {
      expect(screen.getByText("Pendiente y razón de cambio")).toBeInTheDocument();
    });

    // Entra a Mensajes docente real (sin vista puente)
    await user.click(screen.getByRole("link", { name: /^Mensajes$/i }));
    await waitFor(() => {
      expect(screen.getByText("Nuevo mensaje")).toBeInTheDocument();
    });

    // Entra a Exportar SIAGIE real (sin vista puente)
    await user.click(screen.getByRole("link", { name: /Exportar SIAGIE/i }));
    await waitFor(() => {
      expect(screen.getByText("Listo para exportar")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("link", { name: /Configuración/i }));
    await waitFor(() => {
      expect(screen.getByText("3.° A, 3.° B")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /Cerrar sesión/i }));
    await waitFor(() => {
      expect(screen.getByText("Bienvenido al Portal Estudiantil")).toBeInTheDocument();
    });
  });

  it("redirige fuera de rutas docentes exclusivas si la sesion activa es Estudiante", async () => {
    server.use(
      http.get("*/api/v1/identidad/sesion", () =>
        HttpResponse.json({
          autenticado: true,
          usuario: {
            id: "est-1",
            dni: "72458193",
            nombres: "Luis Ángel",
            apellidos: "Quispe Huamán",
            rol: "Estudiante",
            estudiante_id: "est-1",
            grado_seccion: "3.° de Secundaria B",
          },
        }),
      ),
      http.get("*/api/v1/seguimiento/estudiantes/est-1/inicio", () =>
        HttpResponse.json({
          estudiante_id: "est-1",
          ultima_visita: "Hoy",
          novedades_sin_ver: 0,
          novedades: [],
          kpis: [],
          distribucion_niveles: [],
          agenda_semanal: [],
          proximas_entregas: [],
        }),
      ),
    );

    renderRutas("/siagie");

    await waitFor(() => {
      expect(screen.getByText("Portal Estudiantil")).toBeInTheDocument();
    });
    expect(screen.queryByText(/Exportar al SIAGIE/i)).not.toBeInTheDocument();
  });
});
