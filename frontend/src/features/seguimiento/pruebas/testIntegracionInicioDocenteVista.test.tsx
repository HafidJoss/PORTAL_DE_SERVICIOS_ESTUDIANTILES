// Spec: seguimiento · Requirement: Tablero de inicio docente y bandeja de entrada, Lectura y respuesta acotada en hilos (RF25, RF26, RF31, RC08)
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { MemoryRouter } from "react-router-dom";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import type { InicioDocenteOut, UsuarioSesionOut } from "../../../api/generated/model";
import { ProveedorTema } from "../../../app/proveedorTema";
import { InicioDocenteVista } from "../vistas/inicioDocenteVista";

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
  secciones_a_cargo: ["3.° A", "3.° B", "4.° A", "4.° C"],
};

const INICIO_DOCENTE_DEMO: InicioDocenteOut = {
  docente_id: "doc-demo-1",
  trimestre_actual: "III Trimestre en evaluación",
  fecha_etiqueta: "Jueves 12 de noviembre · III Trimestre en evaluación",
  sin_leer: 2,
  por_calificar_total: 1,
  mensajes_bandeja: [
    {
      id: "m1",
      origen: "institucion",
      remitente: "Dirección",
      nombre_corto: "",
      asunto: "Cierre preliminar del III Trimestre: 4 de diciembre",
      cuerpo: "Recordatorio del cierre preliminar.",
      fecha: "Hoy, 7:10",
      leido: false,
      puede_responder: false,
      respuestas: [],
    },
    {
      id: "m2",
      origen: "estudiante",
      remitente: "Diego Cárdenas Rojas",
      nombre_corto: "Diego",
      seccion_id: "3B",
      seccion_nombre: "3.° B",
      asunto: "Consulta sobre la ficha de funciones lineales",
      cuerpo: "Profesor, ¿cómo hallo la pendiente con dos puntos?",
      fecha: "Hoy, 6:52",
      leido: false,
      puede_responder: true,
      destino_tab: "nov",
      respuestas: [],
    },
    {
      id: "m5",
      origen: "asistencia",
      remitente: "Auxiliar de educación",
      nombre_corto: "",
      seccion_id: "4C",
      seccion_nombre: "4.° C",
      asunto: "Resumen de asistencia · 4.° C",
      cuerpo: "Faltas registradas: 3.",
      fecha: "Ayer, 13:05",
      leido: true,
      puede_responder: false,
      destino_tab: "est",
      respuestas: [],
    },
  ],
  clases_hoy: [
    {
      seccion_id: "4A",
      seccion_nombre: "4.° A",
      aula: "Aula 21",
      estudiantes_total: 31,
      hora_inicio: "09:30",
      hora_fin: "11:00",
      estado: "En curso",
      sesion_id: "4As16",
    },
  ],
  notas_pendientes: [
    {
      seccion_id: "4A",
      seccion_nombre: "4.° A",
      sesion_id: "4As16",
      titulo: "Clase: Pendiente y razón de cambio",
      registrados: 0,
      total: 31,
      porcentaje: 0,
    },
  ],
  alertas: [
    {
      id: "al-1",
      texto: "4 estudiantes de 3.° B tienen nivel C en alguna competencia.",
      severidad: "danger",
      seccion_id: "3B",
      destino_tab: "cierre",
    },
  ],
  etapas_trimestre: [
    { nombre: "Aperturado", fecha: "14 de septiembre", estado: "completada" },
    { nombre: "En evaluación", fecha: "Actual", estado: "actual" },
    { nombre: "Cierre preliminar", fecha: "4 de diciembre", estado: "pendiente" },
    { nombre: "Cerrado", fecha: "18 de diciembre", estado: "pendiente" },
  ],
};

function renderInicioDocente(usuario: UsuarioSesionOut = DOCENTE_DEMO) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <ProveedorTema>
        <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <InicioDocenteVista usuario={usuario} />
        </MemoryRouter>
      </ProveedorTema>
    </QueryClientProvider>,
  );
}

describe("InicioDocenteVista", () => {
  it("muestra tablero docente completo, filtra bandeja y responde en hilo a estudiante sin adjuntos", async () => {
    const user = userEvent.setup();
    let replyCalls = 0;

    server.use(
      http.get("*/api/v1/seguimiento/docentes/doc-demo-1/inicio", () => {
        return HttpResponse.json(INICIO_DOCENTE_DEMO);
      }),
      http.post("*/api/v1/seguimiento/docentes/doc-demo-1/bandeja/:id/leer", () => {
        return HttpResponse.json({ ok: true, mensaje: "Mensaje marcado como leído." });
      }),
      http.post("*/api/v1/seguimiento/docentes/doc-demo-1/bandeja/:id/responder", async ({ request }) => {
        replyCalls += 1;
        const body = (await request.json()) as { texto: string };
        return HttpResponse.json({
          mensaje_id: "m2",
          texto: body.texto,
          fecha: "Hoy, ahora",
        });
      }),
    );

    const { container } = renderInicioDocente();

    await waitFor(() => {
      expect(screen.getByText(/Buenos días, Prof\. Julio/i)).toBeInTheDocument();
    });

    expect(container.querySelector('input[type="file"]')).toBeNull();
    expect(screen.getByText("Bandeja de entrada")).toBeInTheDocument();
    expect(screen.getByText("Clases de hoy")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Notas pendientes" })).toBeInTheDocument();
    expect(screen.getByText("Requiere tu atención")).toBeInTheDocument();
    expect(screen.getByText("Cierre preliminar del III Trimestre: 4 de diciembre")).toBeInTheDocument();

    // Filtrar por Estudiantes
    await user.click(screen.getByRole("button", { name: "Estudiantes" }));
    expect(screen.getByText("Consulta sobre la ficha de funciones lineales")).toBeInTheDocument();
    expect(
      screen.queryByText("Cierre preliminar del III Trimestre: 4 de diciembre"),
    ).not.toBeInTheDocument();

    // Abrir consulta de estudiante, validar texto vacío y luego responder
    await user.click(screen.getByText("Consulta sobre la ficha de funciones lineales"));
    await user.click(screen.getByRole("button", { name: "Responder" }));
    expect(replyCalls).toBe(0);
    expect(screen.getByText(/mínimo 2 caracteres/i)).toBeInTheDocument();

    await user.type(
      screen.getByPlaceholderText(/Escribe una respuesta para Diego/i),
      "Lo revisamos en clase hoy.",
    );
    await user.click(screen.getByRole("button", { name: "Responder" }));

    await waitFor(() => {
      expect(screen.getByText("Lo revisamos en clase hoy.")).toBeInTheDocument();
    });
    expect(replyCalls).toBe(1);

    // Verificar que comunicado institucional no ofrece caja de respuesta
    await user.click(screen.getByRole("button", { name: "Institución" }));
    await user.click(screen.getByText("Cierre preliminar del III Trimestre: 4 de diciembre"));
    expect(screen.queryByRole("button", { name: "Responder" })).not.toBeInTheDocument();
  });

  it("permite marcar todo como leido y maneja error de servidor con reintento", async () => {
    const user = userEvent.setup();
    let intentarOk = false;

    server.use(
      http.get("*/api/v1/seguimiento/docentes/doc-demo-1/inicio", () => {
        if (!intentarOk) {
          return HttpResponse.json(
            { type: "about:blank", title: "Error", status: 500, detail: "Falla temporal." },
            { status: 500 },
          );
        }
        return HttpResponse.json(INICIO_DOCENTE_DEMO);
      }),
      http.post("*/api/v1/seguimiento/docentes/doc-demo-1/bandeja/leer-todo", () => {
        return HttpResponse.json({ ok: true, mensaje: "Bandeja marcada como leída." });
      }),
    );

    renderInicioDocente();

    await waitFor(() => {
      expect(screen.getByText(/No se pudo cargar tu tablero docente/i)).toBeInTheDocument();
    });

    intentarOk = true;
    await user.click(screen.getByRole("button", { name: /Reintentar/i }));

    await waitFor(() => {
      expect(screen.getByText("Bandeja de entrada")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /Marcar todo como leído/i }));
    await user.click(screen.getByRole("button", { name: /No leídos/i }));

    await waitFor(() => {
      expect(screen.getByText(/No hay mensajes en esta vista/i)).toBeInTheDocument();
    });
  });
});
