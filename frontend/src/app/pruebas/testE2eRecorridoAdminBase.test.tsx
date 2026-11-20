// Spec: plataforma-web + institucion + identidad · Recorrido E2E base del Administrador (Bloque 1 Fase 4)
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { App } from "../aplicacion";

const USUARIO_ADMIN = {
  id: "adm-demo-1",
  dni: "10456723",
  nombres: "Marco",
  apellidos: "Ayala Sulca",
  rol: "Administrador" as const,
  institucion: "G.U.E. Mariscal Cáceres",
  alcance: "Primaria y Secundaria",
};

const TABLERO_DEMO = {
  anio_lectivo: 2026,
  fecha_actual_texto: "Jueves 12 de noviembre · Año escolar 2026",
  saludo: "Buenos días, Lic. Marco",
  periodo_texto: "III Trimestre · En Evaluación",
  kpis: {
    solicitudes_pendientes: 1,
    cuentas_sin_activar: 4,
    secciones_con_cierre: 2,
    total_secciones_seguimiento: 8,
  },
  solicitudes: [
    {
      id: "r3",
      tipo: "Reapertura",
      remitente: "Dirección",
      fecha: "Ayer, 17:02",
      asunto: "Reabrir II Trimestre",
      detalle: "Se solicita reabrir el II Trimestre.",
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
  avance_secciones: [{ seccion: "3.° B", porcentaje: 88 }],
  resumen_cuentas: { activas: 10, pendientes: 4, bloqueadas: 1 },
};

const TRIMESTRES_DEMO = {
  anio_lectivo: 2026,
  trimestre_actual_corto: "III",
  trimestres: [
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

describe("Recorrido E2E base del Administrador", () => {
  beforeEach(() => {
    window.history.pushState({}, "", "/ingresar");
    localStorage.clear();
  });

  it("permite autenticar al Administrador, navegar por Inicio, Trimestres, puente Catálogo, Configuración y cerrar sesión", async () => {
    let autenticado = false;

    server.use(
      http.get("*/api/v1/identidad/sesion", () => {
        if (!autenticado) {
          return HttpResponse.json(
            { type: "about:blank", title: "No autenticado", status: 401, detail: "Sin sesión" },
            { status: 401 },
          );
        }
        return HttpResponse.json({ autenticado: true, usuario: USUARIO_ADMIN });
      }),
      http.post("*/api/v1/identidad/login", () => {
        autenticado = true;
        return HttpResponse.json({ autenticado: true, usuario: USUARIO_ADMIN });
      }),
      http.post("*/api/v1/identidad/logout", () => {
        autenticado = false;
        return HttpResponse.json({ mensaje: "Sesión cerrada correctamente." });
      }),
      http.get("*/api/v1/institucion/tablero-admin", () => HttpResponse.json(TABLERO_DEMO)),
      http.get("*/api/v1/institucion/trimestres", () => HttpResponse.json(TRIMESTRES_DEMO)),
      http.get("*/api/v1/institucion/secciones", () =>
        HttpResponse.json({
          nivel: "Secundaria",
          grado: 1,
          total_en_nivel: 1,
          secciones: [
            {
              id: "S1A",
              nivel: "Secundaria",
              grado: 1,
              letra: "A",
              nombre: "1.° A",
              tutor: "Prof. Karen Lozano Bendezú",
              auxiliar: "Sr. Héctor Palomino Ayala",
              cantidad_estudiantes: 2,
            },
          ],
          letras_disponibles: ["B"],
          docentes_disponibles: ["Prof. Karen Lozano Bendezú"],
          auxiliares_disponibles: ["Sr. Héctor Palomino Ayala"],
        }),
      ),
      http.get("*/api/v1/matriculas/sin-seccion", () =>
        HttpResponse.json({ total: 6, estudiantes: [] }),
      ),
      http.get("*/api/v1/personas/cuentas", () =>
        HttpResponse.json({
          total: 1,
          activas: 1,
          pendientes: 0,
          bloqueadas: 0,
          cuentas: [
            {
              id: "u1",
              nombre: "Marco Ayala Sulca",
              dni: "10456723",
              rol: "Administrador",
              estado: "activa",
              ultimo_acceso: "Hoy, 07:58",
              extra: "",
            },
          ],
        }),
      ),
      http.get("*/api/v1/auditoria/eventos", () =>
        HttpResponse.json({
          tipo_filtro: "Todos",
          total: 1,
          eventos: [
            {
              id: "b0",
              fecha: "12 nov 2026",
              hora: "07:58:12",
              usuario: "Marco Ayala",
              rol: "Administrador",
              tipo: "Sesión",
              entidad: "Inicio de sesión",
              antes: "—",
              despues: "Correcto",
              ip: "181.65.22.14",
            },
          ],
        }),
      ),
    );

    const user = userEvent.setup();
    render(<App />);

    await user.type(await screen.findByLabelText(/DNI/i), "10456723");
    await user.type(screen.getByLabelText("Contraseña"), "admin2026");
    await user.click(screen.getByRole("button", { name: /^Ingresar$/i }));

    expect(await screen.findByText("Buenos días, Lic. Marco")).toBeInTheDocument();
    expect(screen.getByText("Portal de Administración")).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: "Año y trimestres" }));
    expect(await screen.findByText("Año escolar y trimestres")).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: "Catálogo escolar" }));
    expect(await screen.findByRole("button", { name: "Nueva sección" })).toBeInTheDocument();
    expect(screen.getByText("1.° A")).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: "Cuentas y roles" }));
    expect(await screen.findByRole("button", { name: "Nueva cuenta" })).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: "Bitácora" }));
    expect(await screen.findByText("Bitácora de auditoría")).toBeInTheDocument();
    expect(screen.getByText("Inicio de sesión")).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: "Configuración" }));
    expect(await screen.findByText("Primaria y Secundaria")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Cerrar sesión" }));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /^Ingresar$/i })).toBeInTheDocument();
    });
  });
});
