// Spec: evaluacion · Requirement: Bandeja de mensajes filtrable y vista maestro-detalle (RF24, RF25, HU15, AC04)
// Spec: evaluacion · Requirement: Confirmación de lectura y respuesta acotada en hilo (RF25, RC08, HU15)
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { MemoryRouter } from "react-router-dom";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import type { ListaMensajesOut, UsuarioSesionOut } from "../../../api/generated/model";
import { ProveedorTema } from "../../../app/proveedorTema";
import { MensajesVista } from "../vistas/mensajesVista";

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

const MENSAJES_INICIALES: ListaMensajesOut = {
  sin_leer: 1,
  mensajes: [
    {
      id: "msg-1",
      tipo: "Tarea",
      remitente: "Prof. Julio Gamboa Rojas",
      curso: "Matemática",
      asunto: "Nueva ficha: funciones lineales",
      fecha: "Ayer",
      fecha_larga: "ayer, 19:05",
      destinatarios: "3.° B",
      cuerpo: "Resuelvan los ejercicios 1 al 12 de la ficha entregada en clase.",
      actividad_id: "act-t1",
      no_leido: true,
      lectura_confirmada: false,
      respuestas: [],
    },
    {
      id: "msg-2",
      tipo: "ObsPos",
      remitente: "Prof. Rosa Cárdenas Palomino",
      curso: "Tutoría",
      asunto: "Destacado compañerismo en equipo",
      fecha: "Lun",
      fecha_larga: "lunes, 11:10",
      destinatarios: "Luis Ángel Quispe Huamán",
      cuerpo: "Felicitaciones por apoyar a tus compañeros en el laboratorio.",
      actividad_id: null,
      no_leido: false,
      lectura_confirmada: true,
      respuestas: [],
    },
  ],
};

function renderMensajes(usuario: UsuarioSesionOut = ESTUDIANTE_DEMO) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <ProveedorTema>
        <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <MensajesVista usuario={usuario} />
        </MemoryRouter>
      </ProveedorTema>
    </QueryClientProvider>,
  );
}

describe("MensajesVista", () => {
  it("filtra por categoria, confirma lectura reduciendo sin leer y responde en el hilo sin adjuntos", async () => {
    const user = userEvent.setup();
    let estadoBandeja = structuredClone(MENSAJES_INICIALES);

    server.use(
      http.get("*/api/v1/evaluacion/estudiantes/est-1/mensajes", () => {
        return HttpResponse.json(estadoBandeja);
      }),
      http.post("*/api/v1/evaluacion/mensajes/msg-1/leer", () => {
        estadoBandeja = {
          ...estadoBandeja,
          sin_leer: 0,
          mensajes: estadoBandeja.mensajes.map((m) =>
            m.id === "msg-1" ? { ...m, no_leido: false, lectura_confirmada: true } : m,
          ),
        };
        return HttpResponse.json({ mensaje_id: "msg-1", lectura_confirmada: true });
      }),
      http.post("*/api/v1/evaluacion/mensajes/msg-1/respuestas", async ({ request }) => {
        const body = (await request.json()) as { contenido: string };
        const nueva = {
          id: "resp-1",
          mensaje_id: "msg-1",
          autor: "Luis Ángel Quispe Huamán",
          rol_autor: "Estudiante",
          contenido: body.contenido,
          fecha: "Ahora",
        };
        estadoBandeja = {
          ...estadoBandeja,
          mensajes: estadoBandeja.mensajes.map((m) =>
            m.id === "msg-1" ? { ...m, respuestas: [...m.respuestas, nueva] } : m,
          ),
        };
        return HttpResponse.json(nueva);
      }),
    );

    const { container } = renderMensajes();

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Nueva ficha: funciones lineales" }),
      ).toBeInTheDocument();
    });

    // Sin subida de archivos (RC08) y acceso directo a trabajos
    expect(container.querySelector('input[type="file"]')).toBeNull();
    expect(screen.getByRole("link", { name: /Ver en Trabajos/i })).toHaveAttribute(
      "href",
      "/trabajos",
    );

    // Filtrar por Observaciones y regresar a Todos
    await user.click(screen.getByRole("tab", { name: "Observaciones" }));
    expect(screen.queryByText("Nueva ficha: funciones lineales")).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Destacado compañerismo en equipo" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Todos" }));
    await user.click(screen.getByRole("button", { name: /Nueva ficha: funciones lineales/i }));

    // Confirmar lectura -> sin_leer pasa de 1 a 0
    await user.click(screen.getByRole("button", { name: /Confirmar lectura/i }));
    await waitFor(() => {
      expect(screen.getByText(/Lectura confirmada/i)).toBeInTheDocument();
    });

    // Validación de respuesta vacía
    await user.click(screen.getByRole("button", { name: /Enviar respuesta/i }));
    expect(screen.getByText(/Escribe una respuesta antes de enviarla/i)).toBeInTheDocument();

    // Envío válido en hilo
    const campo = screen.getByLabelText(/Responder en el hilo/i);
    await user.type(campo, "Profesor, ¿los ejercicios van en el cuaderno?");
    await user.click(screen.getByRole("button", { name: /Enviar respuesta/i }));

    await waitFor(() => {
      expect(
        screen.getByText("Profesor, ¿los ejercicios van en el cuaderno?"),
      ).toBeInTheDocument();
    });
    expect(campo).toHaveValue("");
  });

  it("conserva borrador si falla el envio de respuesta y maneja error o filtro vacio", async () => {
    const user = userEvent.setup();
    let fallarCarga = true;
    server.use(
      http.get("*/api/v1/evaluacion/estudiantes/est-1/mensajes", () => {
        if (fallarCarga) {
          return HttpResponse.json(
            { type: "about:blank", title: "Error", status: 500, detail: "Error temporal" },
            { status: 500 },
          );
        }
        return HttpResponse.json(MENSAJES_INICIALES);
      }),
      http.post("*/api/v1/evaluacion/mensajes/msg-1/respuestas", () => {
        return HttpResponse.json(
          { type: "about:blank", title: "Error", status: 500, detail: "No se pudo responder" },
          { status: 500 },
        );
      }),
    );

    renderMensajes();

    await waitFor(() => {
      expect(screen.getByText(/No pudimos cargar tus mensajes/i)).toBeInTheDocument();
    });

    fallarCarga = false;
    await user.click(screen.getByRole("button", { name: /Reintentar/i }));

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Nueva ficha: funciones lineales" }),
      ).toBeInTheDocument();
    });

    // Pestaña vacía
    await user.click(screen.getByRole("tab", { name: "Recordatorios" }));
    expect(screen.getByText(/No hay mensajes en esta categoría/i)).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Todos" }));
    const campo = screen.getByLabelText(/Responder en el hilo/i);
    await user.type(campo, "Consulta de prueba");
    await user.click(screen.getByRole("button", { name: /Enviar respuesta/i }));

    await waitFor(() => {
      expect(screen.getByText(/No se pudo enviar tu respuesta/i)).toBeInTheDocument();
    });
    expect(campo).toHaveValue("Consulta de prueba");
  });

  it("bloquea mensajes si el usuario no es estudiante", () => {
    renderMensajes({
      id: "sec-1",
      dni: "40001122",
      nombres: "Ana",
      apellidos: "Pérez",
      rol: "Secretaría Académica",
      estudiante_id: null,
    });
    expect(screen.getByText(/Vista disponible solo para estudiantes/i)).toBeInTheDocument();
  });

  it("alterna entre bandeja y detalle de mensaje en viewport movil (< 1024 px)", async () => {
    const anchoOriginal = window.innerWidth;
    Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: 390 });
    try {
      const user = userEvent.setup();
      server.use(
        http.get("*/api/v1/evaluacion/estudiantes/est-1/mensajes", () => {
          return HttpResponse.json(MENSAJES_INICIALES);
        }),
      );

      renderMensajes();

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /Nueva ficha: funciones lineales/i }),
        ).toBeInTheDocument();
      });

      // En móvil inicialmente solo se muestra la bandeja, sin el detalle
      expect(
        screen.queryByRole("heading", { name: "Nueva ficha: funciones lineales" }),
      ).not.toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: /Nueva ficha: funciones lineales/i }));
      expect(
        screen.getByRole("heading", { name: "Nueva ficha: funciones lineales" }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /Destacado compañerismo en equipo/i }),
      ).not.toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: /Volver a mensajes/i }));
      expect(
        screen.getByRole("button", { name: /Destacado compañerismo en equipo/i }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("heading", { name: "Nueva ficha: funciones lineales" }),
      ).not.toBeInTheDocument();
    } finally {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: anchoOriginal,
      });
    }
  });
});
