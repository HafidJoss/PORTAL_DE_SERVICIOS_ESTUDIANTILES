// Spec: evaluacion · Requirement: Filtrado y resumen de actividades en Trabajos y pendientes (RF23, HU10, RC08)
// Spec: evaluacion · Requirement: Detalle expandible diferenciando trabajo y sesión de clase (RF23, HU10, AC06)
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import type { ListaActividadesOut, UsuarioSesionOut } from "../../../api/generated/model";
import { ProveedorTema } from "../../../app/proveedorTema";
import { TrabajosVista } from "../vistas/trabajosVista";

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

const RESPUESTA_ACTIVIDADES: ListaActividadesOut = {
  pendientes: 2,
  vencen_pronto: 1,
  actividades: [
    {
      id: "act-t1",
      tipo: "trabajo",
      titulo: "Ficha: funciones lineales",
      curso: "Matemática",
      asignada: "11 nov",
      fecha_entrega: "18 nov",
      estado: "pendiente",
      urgente: true,
      competencia: "Resuelve problemas de regularidad, equivalencia y cambio",
      capacidad: "Traduce datos y condiciones a expresiones algebraicas",
      descripcion: "Resuelve los ejercicios 1 al 12 en tu cuaderno.",
    },
    {
      id: "act-t2",
      tipo: "trabajo",
      titulo: "Línea de tiempo de la Independencia",
      curso: "Ciencias Sociales",
      asignada: "02 nov",
      fecha_entrega: "08 nov",
      estado: "vencido",
      urgente: false,
      competencia: "Construye interpretaciones históricas",
      capacidad: "Comprende el tiempo histórico",
      descripcion: "Elabora el esquema en papelógrafo.",
    },
    {
      id: "act-s1",
      tipo: "sesion_clase",
      titulo: "Sesión 16: método de igualación",
      curso: "Matemática",
      asignada: "12 nov",
      fecha_entrega: null,
      estado: "calificado",
      urgente: false,
      competencia: "Resuelve problemas de regularidad, equivalencia y cambio",
      capacidad: "Usa estrategias y procedimientos",
      descripcion: "Trabajo guiado en pizarra.",
      nivel: "AD",
      comentario: "Participación sobresaliente al resolver sistemas.",
    },
  ],
};

function renderTrabajos(usuario: UsuarioSesionOut = ESTUDIANTE_DEMO) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <ProveedorTema>
        <TrabajosVista usuario={usuario} />
      </ProveedorTema>
    </QueryClientProvider>,
  );
}

describe("TrabajosVista", () => {
  it("filtra por Pendientes, Entregados y Todos sin permitir subida de archivos", async () => {
    const user = userEvent.setup();
    server.use(
      http.get("*/api/v1/evaluacion/estudiantes/est-1/actividades", () => {
        return HttpResponse.json(RESPUESTA_ACTIVIDADES);
      }),
    );

    const { container } = renderTrabajos();

    await waitFor(() => {
      expect(screen.getByText("Ficha: funciones lineales")).toBeInTheDocument();
    });

    // Sin subida de archivos (RC08) y aviso de entrega presencial
    expect(container.querySelector('input[type="file"]')).toBeNull();
    expect(screen.getByText(/el portal no recibe archivos/i)).toBeInTheDocument();

    // Por defecto en "Pendientes": se ven pendiente y vencido, no calificado
    expect(screen.getByText("Línea de tiempo de la Independencia")).toBeInTheDocument();
    expect(screen.queryByText("Sesión 16: método de igualación")).not.toBeInTheDocument();

    // Cambio a "Entregados"
    await user.click(screen.getByRole("tab", { name: /^Entregados/i }));
    expect(screen.getByText("Sesión 16: método de igualación")).toBeInTheDocument();
    expect(screen.queryByText("Ficha: funciones lineales")).not.toBeInTheDocument();

    // Cambio a "Todos"
    await user.click(screen.getByRole("tab", { name: /^Todos/i }));
    expect(screen.getByText("Ficha: funciones lineales")).toBeInTheDocument();
    expect(screen.getByText("Sesión 16: método de igualación")).toBeInTheDocument();
  });

  it("expande detalle diferenciando trabajo de sesion_clase (Nota del dia)", async () => {
    const user = userEvent.setup();
    server.use(
      http.get("*/api/v1/evaluacion/estudiantes/est-1/actividades", () => {
        return HttpResponse.json(RESPUESTA_ACTIVIDADES);
      }),
    );

    renderTrabajos();

    await waitFor(() => {
      expect(screen.getByText("Ficha: funciones lineales")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("tab", { name: /^Todos/i }));

    const btnTrabajo = screen.getByRole("button", { name: /Ficha: funciones lineales/i });
    expect(btnTrabajo).toHaveAttribute("aria-expanded", "false");
    await user.click(btnTrabajo);
    expect(btnTrabajo).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText(/Resuelve los ejercicios 1 al 12 en tu cuaderno/i)).toBeInTheDocument();
    expect(screen.getByText(/Fecha límite: 18 nov/i)).toBeInTheDocument();

    const btnSesion = screen.getByRole("button", { name: /Sesión 16: método de igualación/i });
    await user.click(btnSesion);
    expect(screen.getAllByText(/Nota del día/i).length).toBeGreaterThan(0);
    expect(screen.getByText("AD")).toBeInTheDocument();
    expect(screen.getByText(/Participación sobresaliente al resolver sistemas/i)).toBeInTheDocument();
  });

  it("muestra estado vacio cuando una pestana no tiene actividades y permite reintentar ante error", async () => {
    const user = userEvent.setup();
    let devolverError = true;
    server.use(
      http.get("*/api/v1/evaluacion/estudiantes/est-1/actividades", () => {
        if (devolverError) {
          return HttpResponse.json(
            { type: "about:blank", title: "Error", status: 500, detail: "Falla temporal" },
            { status: 500 },
          );
        }
        return HttpResponse.json({ pendientes: 0, vencen_pronto: 0, actividades: [] });
      }),
    );

    renderTrabajos();

    await waitFor(() => {
      expect(screen.getByText(/No pudimos cargar tus trabajos/i)).toBeInTheDocument();
    });

    devolverError = false;
    await user.click(screen.getByRole("button", { name: /Reintentar/i }));

    await waitFor(() => {
      expect(screen.getByText(/No tienes actividades en esta vista/i)).toBeInTheDocument();
    });
  });

  it("restringe el acceso si el usuario no tiene perfil de estudiante", () => {
    renderTrabajos({
      id: "apo-1",
      dni: "41234567",
      nombres: "María",
      apellidos: "Huamán",
      rol: "Apoderado",
      estudiante_id: null,
    });

    expect(screen.getByText(/Vista disponible solo para estudiantes/i)).toBeInTheDocument();
  });
});
