// Spec: seguimiento, evaluacion, asistencia · Enrutamiento autenticado en RutasApp
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { MemoryRouter } from "react-router-dom";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { RutasApp } from "../App";
import { ThemeProvider } from "../ThemeProvider";

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function mockSesionEstudiante() {
  return http.get("*/api/v1/identidad/sesion", () => {
    return HttpResponse.json({
      autenticado: true,
      usuario: {
        id: "est-1",
        dni: "72458193",
        nombres: "Luis Ángel",
        apellidos: "Quispe Huamán",
        rol: "Estudiante",
        estudiante_id: "est-1",
        codigo_estudiante: "05123487210042",
        grado_seccion: "3.° de Secundaria B",
        tutor: "Prof. Rosa Cárdenas Palomino",
      },
    });
  });
}

function renderRuta(ruta: string) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <ThemeProvider>
        <MemoryRouter
          initialEntries={[ruta]}
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <RutasApp />
        </MemoryRouter>
      </ThemeProvider>
    </QueryClientProvider>,
  );
}

describe("RutasApp · seguimiento-estudiante-web", () => {
  it("renderiza InicioPage real en /inicio", async () => {
    server.use(
      mockSesionEstudiante(),
      http.get("*/api/v1/seguimiento/estudiantes/est-1/inicio", () => {
        return HttpResponse.json({
          estudiante_id: "est-1",
          ultima_visita: "Hoy 08:00",
          novedades_sin_ver: 1,
          novedades: [],
          kpis: [],
          distribucion_niveles: [],
          agenda_semanal: [],
          proximas_entregas: [],
        });
      }),
    );

    renderRuta("/inicio");

    await waitFor(() => {
      expect(screen.getByText("¡Hola, Luis!")).toBeInTheDocument();
    });
  });

  it("renderiza CursosPage y CursoDetallePage en /cursos y /cursos/:asignaturaId", async () => {
    server.use(
      mockSesionEstudiante(),
      http.get("*/api/v1/seguimiento/estudiantes/est-1/cursos", () => {
        return HttpResponse.json({
          grado_seccion: "3.° de Secundaria B",
          total_pendientes: 0,
          cursos: [
            {
              asignatura_id: "mat",
              nombre: "Matemática",
              docente: "Prof. Julio Gamboa Rojas",
              rol_docente: "Docente titular",
              horario: "Lun 08:00",
              horas_semanales: 6,
              pendientes: 0,
              proximo_vencimiento: null,
              mini_niveles: ["A"],
            },
          ],
        });
      }),
      http.get("*/api/v1/seguimiento/estudiantes/est-1/cursos/mat", () => {
        return HttpResponse.json({
          asignatura_id: "mat",
          nombre: "Matemática",
          docente: "Prof. Julio Gamboa Rojas",
          rol_docente: "Docente titular",
          horario: "Lun 08:00",
          horas_semanales: 6,
          stream: [],
          competencias: [],
          equipo: [],
        });
      }),
      http.get("*/api/v1/evaluacion/estudiantes/est-1/actividades", () => {
        return HttpResponse.json({ pendientes: 0, vencen_pronto: 0, actividades: [] });
      }),
    );

    const { unmount } = renderRuta("/cursos");
    await waitFor(() => {
      expect(screen.getByText("Prof. Julio Gamboa Rojas")).toBeInTheDocument();
    });
    unmount();

    renderRuta("/cursos/mat");
    await waitFor(() => {
      expect(screen.getByRole("tab", { name: "Novedades" })).toBeInTheDocument();
    });
  });

  it("renderiza TrabajosPage en /trabajos y AsistenciaPage en /asistencia", async () => {
    server.use(
      mockSesionEstudiante(),
      http.get("*/api/v1/evaluacion/estudiantes/est-1/actividades", () => {
        return HttpResponse.json({
          pendientes: 0,
          vencen_pronto: 0,
          actividades: [],
        });
      }),
      http.get("*/api/v1/asistencia/estudiantes/est-1", () => {
        return HttpResponse.json({
          estudiante_id: "est-1",
          mes: 11,
          anio: 2026,
          seccion: "3.° B",
          kpis: {
            porcentaje: "100%",
            presentes: 10,
            tardanzas: 0,
            faltas: 0,
            justificadas: 0,
          },
          dias: [],
          incidencias: [],
        });
      }),
    );

    const { unmount } = renderRuta("/trabajos");
    await waitFor(() => {
      expect(screen.getByText(/el portal no recibe archivos/i)).toBeInTheDocument();
    });
    unmount();

    renderRuta("/asistencia");
    await waitFor(() => {
      expect(screen.getByText("100%")).toBeInTheDocument();
    });
  });

  it("renderiza CalificacionesPage, MensajesPage y LibretaPage en las rutas finales", async () => {
    server.use(
      mockSesionEstudiante(),
      http.get("*/api/v1/evaluacion/estudiantes/est-1/calificaciones", () => {
        return HttpResponse.json({
          trimestre_actual: 3,
          estado_trimestre: "En Evaluación",
          criterio_sugerencia: "mediana_capacidades",
          cursos: [],
        });
      }),
      http.get("*/api/v1/evaluacion/estudiantes/est-1/mensajes", () => {
        return HttpResponse.json({
          sin_leer: 0,
          mensajes: [],
        });
      }),
      http.get("*/api/v1/reportes/estudiantes/est-1/libretas", () => {
        return HttpResponse.json({
          estudiante_id: "est-1",
          anio_escolar: 2026,
          grado_seccion: "3.° B",
          trimestres: [],
          situacion_final: { calculada: false, codigo: null, etiqueta: null },
        });
      }),
    );

    const r1 = renderRuta("/calificaciones");
    await waitFor(() => {
      expect(screen.getByText(/Aún no hay asignaturas calificadas/i)).toBeInTheDocument();
    });
    r1.unmount();

    const r2 = renderRuta("/mensajes");
    await waitFor(() => {
      expect(screen.getByText(/No hay mensajes en esta categoría/i)).toBeInTheDocument();
    });
    r2.unmount();

    renderRuta("/libreta");
    await waitFor(() => {
      expect(screen.getByText(/Sin trimestres disponibles/i)).toBeInTheDocument();
    });
  });

  it("ejecuta el recorrido completo del estudiante por todas las vistas y cierra sesion", async () => {
    const user = userEvent.setup();
    let sesionActiva = false;
    let sinVer = 2;
    let mensajesSinLeer = 1;

    server.use(
      http.get("*/api/v1/identidad/sesion", () => {
        if (!sesionActiva) {
          return HttpResponse.json(
            { type: "about:blank", title: "No autenticado", status: 401, detail: "Sin sesión" },
            { status: 401 },
          );
        }
        return HttpResponse.json({
          autenticado: true,
          usuario: {
            id: "est-1",
            dni: "72458193",
            nombres: "Luis Ángel",
            apellidos: "Quispe Huamán",
            rol: "Estudiante",
            estudiante_id: "est-1",
            codigo_estudiante: "05123487210042",
            grado_seccion: "3.° de Secundaria B",
            tutor: "Prof. Rosa Cárdenas Palomino",
          },
        });
      }),
      http.post("*/api/v1/identidad/login", () => {
        sesionActiva = true;
        return HttpResponse.json({
          autenticado: true,
          usuario: {
            id: "est-1",
            dni: "72458193",
            nombres: "Luis Ángel",
            apellidos: "Quispe Huamán",
            rol: "Estudiante",
            estudiante_id: "est-1",
            codigo_estudiante: "05123487210042",
            grado_seccion: "3.° de Secundaria B",
            tutor: "Prof. Rosa Cárdenas Palomino",
          },
        });
      }),
      http.post("*/api/v1/identidad/logout", () => {
        sesionActiva = false;
        return HttpResponse.json({ mensaje: "Sesión cerrada correctamente." });
      }),
      http.get("*/api/v1/seguimiento/estudiantes/est-1/inicio", () => {
        return HttpResponse.json({
          estudiante_id: "est-1",
          ultima_visita: "Ayer",
          novedades_sin_ver: sinVer,
          novedades: [],
          kpis: [{ clave: "asist", etiqueta: "Asistencia", valor: "96%", subtitulo: "3.° B" }],
          distribucion_niveles: [],
          agenda_semanal: [],
          proximas_entregas: [],
        });
      }),
      http.post("*/api/v1/seguimiento/estudiantes/est-1/novedades/visto", () => {
        sinVer = 0;
        return HttpResponse.json({ visto: true, ultima_visita: "Hoy" });
      }),
      http.get("*/api/v1/seguimiento/estudiantes/est-1/cursos", () => {
        return HttpResponse.json({
          grado_seccion: "3.° B",
          total_pendientes: 1,
          cursos: [
            {
              asignatura_id: "mat",
              nombre: "Matemática",
              docente: "Prof. Julio Gamboa Rojas",
              rol_docente: "Docente titular",
              horario: "Lun 08:00",
              horas_semanales: 6,
              pendientes: 1,
              proximo_vencimiento: "Ficha 1 · 18 nov",
              mini_niveles: ["AD"],
            },
          ],
        });
      }),
      http.get("*/api/v1/seguimiento/estudiantes/est-1/cursos/mat", () => {
        return HttpResponse.json({
          asignatura_id: "mat",
          nombre: "Matemática",
          docente: "Prof. Julio Gamboa Rojas",
          rol_docente: "Docente titular",
          horario: "Lun 08:00",
          horas_semanales: 6,
          stream: [],
          competencias: [{ nombre: "Resuelve problemas de cantidad", trimestres: ["A", "A", "AD"] }],
          equipo: [{ nombre: "Prof. Julio Gamboa Rojas", rol: "Docente titular", grupo: "docente" }],
        });
      }),
      http.get("*/api/v1/evaluacion/estudiantes/est-1/actividades", () => {
        return HttpResponse.json({
          pendientes: 1,
          vencen_pronto: 1,
          actividades: [
            {
              id: "act-1",
              tipo: "trabajo",
              titulo: "Ficha: funciones lineales",
              curso: "Matemática",
              asignada: "11 nov",
              fecha_entrega: "18 nov",
              estado: "pendiente",
              urgente: true,
              competencia: "Regularidad",
              capacidad: "Traduce",
            },
          ],
        });
      }),
      http.get("*/api/v1/asistencia/estudiantes/est-1", () => {
        return HttpResponse.json({
          estudiante_id: "est-1",
          mes: 11,
          anio: 2026,
          seccion: "3.° B",
          kpis: { porcentaje: "96%", presentes: 8, tardanzas: 1, faltas: 0, justificadas: 1 },
          dias: [{ dia: 2, codigo: "P", nombre_estado: "Presente" }],
          incidencias: [],
        });
      }),
      http.get("*/api/v1/evaluacion/estudiantes/est-1/calificaciones", () => {
        return HttpResponse.json({
          trimestre_actual: 3,
          estado_trimestre: "En Evaluación",
          criterio_sugerencia: "mediana_capacidades",
          cursos: [
            {
              asignatura_id: "mat",
              nombre: "Matemática",
              docente: "Prof. Julio Gamboa Rojas",
              competencias: [
                { nombre: "Resuelve problemas de cantidad", trimestres: ["A", "A", "AD"], en_evaluacion_t3: true },
              ],
              conclusiones: [],
              calificativos_publicados: [],
            },
          ],
        });
      }),
      http.get("*/api/v1/reportes/estudiantes/est-1/libretas", () => {
        return HttpResponse.json({
          estudiante_id: "est-1",
          anio_escolar: 2026,
          grado_seccion: "3.° B",
          trimestres: [
            {
              trimestre_id: 2,
              nombre: "II Trimestre",
              rango_fechas: "1 jun – 11 sep",
              publicada: true,
              fecha_publicacion: "2026-09-11",
              areas: [],
            },
          ],
          situacion_final: { calculada: false, codigo: null, etiqueta: null },
        });
      }),
      http.get("*/api/v1/reportes/estudiantes/est-1/libretas/2/descarga", () => {
        return HttpResponse.json({
          url_firmada: "https://storage.googleapis.com/stub/libreta.pdf",
          expira_en_segundos: 900,
          nombre_archivo: "libreta_T2.pdf",
        });
      }),
      http.get("*/api/v1/evaluacion/estudiantes/est-1/mensajes", () => {
        return HttpResponse.json({
          sin_leer: mensajesSinLeer,
          mensajes: [
            {
              id: "msg-1",
              tipo: "Tarea",
              remitente: "Prof. Julio Gamboa Rojas",
              curso: "Matemática",
              asunto: "Aviso de práctica",
              fecha: "Hoy",
              fecha_larga: "Hoy 09:00",
              destinatarios: "3.° B",
              cuerpo: "Revisen el tema.",
              actividad_id: null,
              no_leido: mensajesSinLeer > 0,
              lectura_confirmada: mensajesSinLeer === 0,
              respuestas: [],
            },
          ],
        });
      }),
      http.post("*/api/v1/evaluacion/mensajes/msg-1/leer", () => {
        mensajesSinLeer = 0;
        return HttpResponse.json({ mensaje_id: "msg-1", lectura_confirmada: true });
      }),
    );

    renderRuta("/inicio");

    // 1. Redirige a /ingresar e inicia sesión
    await waitFor(() => {
      expect(screen.getByText("Bienvenido al Portal Estudiantil")).toBeInTheDocument();
    });
    await user.type(screen.getByLabelText(/DNI/i), "72458193");
    await user.type(screen.getByLabelText(/^Contraseña$/i), "Mariscal2026");
    await user.click(screen.getByRole("button", { name: /^Ingresar$/i }));

    // 2. Inicio -> Marcar todo como visto -> Variante B
    const btnMarcarVisto = await screen.findByRole("button", {
      name: /Marcar todo como visto/i,
    });
    expect(screen.getByText("¡Hola, Luis!")).toBeInTheDocument();
    await user.click(btnMarcarVisto);
    await waitFor(() => {
      expect(screen.getByText(/0 novedades sin ver/i)).toBeInTheDocument();
    });

    // 3. Cursos -> Trabajos -> Asistencia -> Calificaciones -> Libreta -> Mensajes -> Config -> Logout
    await user.click(screen.getByRole("link", { name: /^Cursos$/i }));
    await waitFor(() => {
      expect(screen.getByText("Matemática")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("link", { name: /^Trabajos y pendientes$/i }));
    await waitFor(() => {
      expect(screen.getByText("Ficha: funciones lineales")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("link", { name: /^Asistencia$/i }));
    await waitFor(() => {
      expect(screen.getByText("96%")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("link", { name: /^Calificaciones$/i }));
    await waitFor(() => {
      expect(screen.getByText("Resuelve problemas de cantidad")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("link", { name: /Ver libreta/i }));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Descargar PDF/i })).toBeInTheDocument();
    });
    await user.click(screen.getByRole("button", { name: /Descargar PDF/i }));
    await waitFor(() => {
      expect(screen.getByRole("link", { name: "libreta_T2.pdf" })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("link", { name: /^Mensajes$/i }));
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Aviso de práctica" })).toBeInTheDocument();
    });
    await user.click(screen.getByRole("button", { name: /Confirmar lectura/i }));
    await waitFor(() => {
      expect(screen.getByText(/Lectura confirmada/i)).toBeInTheDocument();
    });

    await user.click(screen.getByRole("link", { name: /^Configuración$/i }));
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Configuración" })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /Cerrar sesión/i }));
    await waitFor(() => {
      expect(screen.getByText("Bienvenido al Portal Estudiantil")).toBeInTheDocument();
    });
  });
});
