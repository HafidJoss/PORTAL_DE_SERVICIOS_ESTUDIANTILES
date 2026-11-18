// Spec: seguimiento · Requirement: Tablero de inicio del apoderado y confirmación de lectura (RF01, RF25, DA05)
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { MemoryRouter } from "react-router-dom";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import type { InicioApoderadoOut, UsuarioSesionOut } from "../../../api/generated/model";
import { ProveedorTema } from "../../../app/proveedorTema";
import { InicioApoderadoVista } from "../vistas/inicioApoderadoVista";

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const APODERADO_DEMO: UsuarioSesionOut = {
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
};

const INICIO_LUIS: InicioApoderadoOut = {
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
      cuerpo: "Las libretas oficiales estarán disponibles desde las 10:00 a.m.",
      fecha: "Hoy, 09:00",
      leido: false,
      requiere_confirmacion: true,
      lectura_confirmada: false,
      etiqueta: "Institución",
      ruta_destino: "/libreta",
    },
    {
      id: "i2",
      origen: "asistencia",
      remitente: "Asistencia",
      iniciales: "AS",
      curso: "",
      asunto: "Tardanza registrada de Luis Ángel",
      cuerpo: "Ingreso registrado a las 07:52.",
      fecha: "Hoy, 08:15",
      leido: false,
      requiere_confirmacion: false,
      lectura_confirmada: false,
      etiqueta: "Asistencia",
      ruta_destino: "/asistencia",
    },
    {
      id: "m1",
      origen: "docente",
      remitente: "Prof. Carlos Mendoza",
      iniciales: "CM",
      curso: "Matemática",
      asunto: "Avance positivo en clase",
      cuerpo: "Completó las actividades con participación destacada.",
      fecha: "Ayer, 17:40",
      leido: true,
      requiere_confirmacion: false,
      lectura_confirmada: false,
      etiqueta: "Docente",
      ruta_destino: "/cursos",
    },
  ],
};

const INICIO_SOFIA: InicioApoderadoOut = {
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
      cuerpo: "Sofía lideró la práctica de laboratorio.",
      fecha: "Ayer, 16:00",
      leido: false,
      requiere_confirmacion: false,
      lectura_confirmada: false,
      etiqueta: "Docente",
      ruta_destino: "/cursos",
    },
  ],
};

function renderVista(hijoActivoId = "est-demo-1") {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const resultado = render(
    <QueryClientProvider client={qc}>
      <MemoryRouter
        initialEntries={["/inicio"]}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <ProveedorTema>
          <InicioApoderadoVista usuario={APODERADO_DEMO} hijoActivoId={hijoActivoId} />
        </ProveedorTema>
      </MemoryRouter>
    </QueryClientProvider>,
  );
  return { ...resultado, qc };
}

describe("InicioApoderadoVista", () => {
  it("renderiza bandeja filtrable, confirma lectura de comunicado y marca todo como leído", async () => {
    const user = userEvent.setup();
    let confirmados = 0;

    server.use(
      http.get("*/api/v1/seguimiento/apoderados/apo-demo-1/hijos/est-demo-1/inicio", () =>
        HttpResponse.json(INICIO_LUIS),
      ),
      http.post(
        "*/api/v1/seguimiento/apoderados/apo-demo-1/comunicados/i1/confirmar-lectura",
        () => {
          confirmados += 1;
          return HttpResponse.json({
            ok: true,
            mensaje: "Lectura confirmada. Dirección fue notificada.",
          });
        },
      ),
    );

    renderVista("est-demo-1");

    await waitFor(() => {
      expect(screen.getByText("Luis Ángel Quispe Huamán")).toBeInTheDocument();
    });
    expect(screen.getByText("3.° de Secundaria B")).toBeInTheDocument();
    expect(screen.getByText("Resolución de sistemas 2×2")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "No leídos (2)" })).toBeInTheDocument();

    // Filtrar por Docentes
    await user.click(screen.getByRole("button", { name: "Docentes" }));
    expect(screen.getByText("Avance positivo en clase")).toBeInTheDocument();
    expect(
      screen.queryByText("Entrega de libretas del III Trimestre"),
    ).not.toBeInTheDocument();

    // Volver a Todos y expandir comunicado institucional con Confirmar lectura
    await user.click(screen.getByRole("button", { name: "Todos" }));
    await user.click(
      screen.getByRole("button", { name: /Entrega de libretas del III Trimestre/i }),
    );
    const btnConfirmar = screen.getByRole("button", { name: /Confirmar lectura/i });
    await user.click(btnConfirmar);

    await waitFor(() => {
      expect(confirmados).toBe(1);
    });
    expect(screen.getByText(/Lectura confirmada/i)).toBeInTheDocument();

    // Marcar todo como leído
    await user.click(screen.getByRole("button", { name: /Marcar todo como leído/i }));
    expect(screen.getByRole("button", { name: "No leídos (0)" })).toBeInTheDocument();
  });

  it("actualiza el contenido del tablero al cambiar de menor vinculado", async () => {
    server.use(
      http.get("*/api/v1/seguimiento/apoderados/apo-demo-1/hijos/est-demo-1/inicio", () =>
        HttpResponse.json(INICIO_LUIS),
      ),
      http.get("*/api/v1/seguimiento/apoderados/apo-demo-1/hijos/est-demo-2/inicio", () =>
        HttpResponse.json(INICIO_SOFIA),
      ),
    );

    const { rerender, qc } = renderVista("est-demo-1");
    await waitFor(() => {
      expect(screen.getByText("Resolución de sistemas 2×2")).toBeInTheDocument();
    });

    rerender(
      <QueryClientProvider client={qc}>
        <MemoryRouter
          initialEntries={["/inicio"]}
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <ProveedorTema>
            <InicioApoderadoVista usuario={APODERADO_DEMO} hijoActivoId="est-demo-2" />
          </ProveedorTema>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("Sofía Quispe Huamán")).toBeInTheDocument();
    });
    expect(screen.getByText("1.° de Secundaria A")).toBeInTheDocument();
    expect(screen.getByText("Maqueta del sistema solar")).toBeInTheDocument();
  });

  it("muestra estado vacío cuando no hay mensajes y permite reintentar ante error", async () => {
    const user = userEvent.setup();
    let intentar = 0;

    server.use(
      http.get("*/api/v1/seguimiento/apoderados/apo-demo-1/hijos/est-demo-1/inicio", () => {
        intentar += 1;
        if (intentar === 1) {
          return HttpResponse.json(
            {
              type: "about:blank",
              title: "Acceso no autorizado",
              status: 403,
              detail: "No tienes acceso al estudiante.",
            },
            { status: 403 },
          );
        }
        return HttpResponse.json({
          ...INICIO_LUIS,
          sin_leer: 0,
          mensajes_bandeja: [],
        });
      }),
    );

    renderVista("est-demo-1");

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Reintentar" })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Reintentar" }));
    await waitFor(() => {
      expect(screen.getByText(/No hay comunicados en esta vista/i)).toBeInTheDocument();
    });
  });
});
