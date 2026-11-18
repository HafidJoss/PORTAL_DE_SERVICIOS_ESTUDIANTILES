// Spec: identidad, plataforma-web, seguimiento · Recorrido autenticado multi-hijo para Apoderado
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

describe("RutasApp · apoderado-base-y-selector-hijos", () => {
  it("inicia sesion de apoderado, cambia de menor en MarcoPortal, navega a Configuracion y cierra sesion", async () => {
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
        return HttpResponse.json(SESION_APODERADO);
      }),
      http.post("*/api/v1/identidad/login", () => {
        sesionActiva = true;
        return HttpResponse.json(SESION_APODERADO);
      }),
      http.post("*/api/v1/identidad/logout", () => {
        sesionActiva = false;
        return HttpResponse.json({ mensaje: "Sesión cerrada correctamente." });
      }),
      http.get("*/api/v1/seguimiento/apoderados/apo-demo-1/hijos/est-demo-1/inicio", () =>
        HttpResponse.json({
          apoderado_id: "apo-demo-1",
          estudiante_id: "est-demo-1",
          estudiante_nombre: "Luis Ángel Quispe Huamán",
          grado_seccion: "3.° de Secundaria B",
          sin_leer: 2,
          pendientes_total: 2,
          asistencia_porcentaje: "96%",
          resumen_asistencia: { porcentaje: "96%", presentes: 48, tardanzas: 1, faltas: 1 },
          proximas_entregas: [
            {
              id: "ent-apo-1",
              titulo: "Resolución de sistemas 2×2",
              curso: "Matemática",
              fecha_entrega: "Vie 13 nov · 18:00",
              estado_etiqueta: "Pendiente",
              urgente: true,
            },
          ],
          mensajes_bandeja: [
            {
              id: "i1",
              origen: "institucion",
              remitente: "Dirección",
              iniciales: "IE",
              curso: "",
              asunto: "Entrega de libretas del III Trimestre",
              cuerpo: "Desde las 10:00 a.m.",
              fecha: "Hoy, 09:00",
              leido: false,
              requiere_confirmacion: true,
              lectura_confirmada: false,
              etiqueta: "Institución",
              ruta_destino: "/libreta",
            },
          ],
        }),
      ),
      http.get("*/api/v1/seguimiento/apoderados/apo-demo-1/hijos/est-demo-2/inicio", () =>
        HttpResponse.json({
          apoderado_id: "apo-demo-1",
          estudiante_id: "est-demo-2",
          estudiante_nombre: "Sofía Quispe Huamán",
          grado_seccion: "1.° de Secundaria A",
          sin_leer: 1,
          pendientes_total: 1,
          asistencia_porcentaje: "98%",
          resumen_asistencia: { porcentaje: "98%", presentes: 49, tardanzas: 1, faltas: 0 },
          proximas_entregas: [
            {
              id: "ent-apo-3",
              titulo: "Maqueta del sistema solar",
              curso: "Ciencia y Tecnología",
              fecha_entrega: "Mar 17 nov · 14:00",
              estado_etiqueta: "En curso",
              urgente: false,
            },
          ],
          mensajes_bandeja: [
            {
              id: "m1",
              origen: "docente",
              remitente: "Prof. Ana Lucía Torres",
              iniciales: "AT",
              curso: "Ciencia y Tecnología",
              asunto: "Participación destacada de Sofía",
              cuerpo: "Excelente trabajo en laboratorio.",
              fecha: "Ayer",
              leido: false,
              requiere_confirmacion: false,
              lectura_confirmada: false,
              etiqueta: "Docente",
              ruta_destino: "/cursos",
            },
          ],
        }),
      ),
    );

    const { container } = renderRutas("/inicio");

    await waitFor(() => {
      expect(screen.getByLabelText(/DNI/i)).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText(/DNI/i), "40871256");
    await user.type(screen.getByLabelText("Contraseña"), "123456");
    await user.click(screen.getByRole("button", { name: "Ingresar" }));

    await waitFor(() => {
      expect(screen.getByText("Portal de Familias")).toBeInTheDocument();
      expect(screen.getByText("Resolución de sistemas 2×2")).toBeInTheDocument();
    });
    expect(screen.queryByRole("link", { name: /Exportar SIAGIE/i })).not.toBeInTheDocument();

    // Cambiar de menor desde MarcoPortal
    await user.click(screen.getByRole("button", { name: /Cambiar de menor/i }));
    await user.click(screen.getByRole("button", { name: /Sofía Quispe Huamán/i }));

    await waitFor(() => {
      expect(screen.getByText("Maqueta del sistema solar")).toBeInTheDocument();
    });

    // Ir a Configuración y verificar menores vinculados en solo lectura sin input file
    await user.click(screen.getByRole("link", { name: /Configuración/i }));
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Menores vinculados" }),
      ).toBeInTheDocument();
    });
    expect(container.querySelector('input[type="file"]')).toBeNull();
    expect(screen.getByText("40871256")).toBeInTheDocument();

    // Volver a Inicio del menor activo y cerrar sesión
    await user.click(screen.getByRole("link", { name: /^Inicio$/i }));
    await waitFor(() => {
      expect(screen.getByText("Maqueta del sistema solar")).toBeInTheDocument();
    });

    // Cerrar sesión
    await user.click(screen.getByRole("button", { name: /Cerrar sesión/i }));
    await waitFor(() => {
      expect(screen.getByLabelText(/DNI/i)).toBeInTheDocument();
    });
  });

  it("no expone selector de menor ni Portal de Familias cuando inicia un Estudiante", async () => {
    server.use(
      http.get("*/api/v1/identidad/sesion", () =>
        HttpResponse.json({
          autenticado: true,
          usuario: {
            id: "est-demo-1",
            dni: "72458193",
            nombres: "Luis Ángel",
            apellidos: "Quispe Huamán",
            rol: "Estudiante",
            estudiante_id: "est-demo-1",
            codigo_estudiante: "20260001",
            grado_seccion: "3.° de Secundaria B",
          },
        }),
      ),
      http.get("*/api/v1/seguimiento/estudiantes/est-demo-1/inicio", () =>
        HttpResponse.json({
          estudiante_id: "est-demo-1",
          saludo: "Hola, Luis",
          trimestre_actual: "III Trimestre",
          fecha_etiqueta: "Hoy",
          kpis: [],
          proximas_entregas: [],
          novedades: [],
          accesos_rapidos: [],
        }),
      ),
    );

    renderRutas("/inicio");

    await waitFor(() => {
      expect(screen.getByText("Portal Estudiantil")).toBeInTheDocument();
    });
    expect(screen.queryByText("Portal de Familias")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Cambiar de menor/i })).not.toBeInTheDocument();
  });
});
