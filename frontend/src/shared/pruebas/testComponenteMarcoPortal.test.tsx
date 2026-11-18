// Spec: plataforma-web · Requirement: Shell responsivo e identidad visual del portal (RC01, AC07)
import { act, fireEvent, render, screen } from "@testing-library/react";
import { BookOpenCheck, FileSpreadsheet, Home, Library, Mail, NotebookPen } from "lucide-react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ProveedorTema } from "../../app/proveedorTema";
import { MarcoPortal, type ElementoNavPortal } from "../componentes/marcoPortal";

function definirAnchoVentana(ancho: number) {
  Object.defineProperty(window, "innerWidth", {
    writable: true,
    configurable: true,
    value: ancho,
  });
}

function renderPortal() {
  return render(
    <MemoryRouter
      initialEntries={["/inicio"]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <ProveedorTema>
        <MarcoPortal
          usuarioNombre="Luis Ángel Quispe"
          usuarioDetalle="Estudiante · 3.° B"
        >
          <div>Contenido de prueba</div>
        </MarcoPortal>
      </ProveedorTema>
    </MemoryRouter>,
  );
}

describe("MarcoPortal", () => {
  afterEach(() => {
    act(() => {
      definirAnchoVentana(1280);
    });
  });

  it("muestra barra lateral con escudo, enlaces y avatar de iniciales en escritorio", () => {
    definirAnchoVentana(1280);
    renderPortal();

    expect(
      screen.getByRole("navigation", { name: "Navegación principal" }),
    ).toBeInTheDocument();
    expect(screen.getByAltText(/Escudo G\.U\.E\. Mariscal Cáceres/i)).toBeInTheDocument();
    expect(screen.getByText("LQ")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Inicio/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Libreta/i })).toBeInTheDocument();
    expect(
      screen.queryByRole("navigation", { name: "Navegación móvil" }),
    ).not.toBeInTheDocument();
  });

  it("oculta la barra lateral y muestra topbar y navegacion inferior en 360x640", () => {
    definirAnchoVentana(360);
    renderPortal();

    expect(
      screen.queryByRole("navigation", { name: "Navegación principal" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: "Navegación móvil" }),
    ).toBeInTheDocument();
    expect(screen.getByText("LQ")).toBeInTheDocument();
    expect(screen.getByText("Contenido de prueba")).toBeInTheDocument();
  });

  // Spec: plataforma-web · Scenario: Menú lateral e insignias para sesión con rol Docente en escritorio
  it("renderiza menu docente parametrizado con subtitulo e insignias en escritorio", () => {
    const navDocente: ElementoNavPortal[] = [
      { to: "/inicio", label: "Inicio", Icon: Home, badge: 4 },
      { to: "/cursos", label: "Mis cursos", Icon: Library, badge: 3 },
      { to: "/nota-del-dia", label: "Nota del día", Icon: NotebookPen },
      { to: "/mensajes", label: "Mensajes", Icon: Mail },
      { to: "/siagie", label: "Exportar SIAGIE", Icon: FileSpreadsheet },
    ];
    const movDocente: ElementoNavPortal[] = [
      { to: "/inicio", label: "Inicio", Icon: Home, badge: 4 },
      { to: "/cursos", label: "Cursos", Icon: Library, badge: 3 },
      { to: "/nota-del-dia", label: "Hoy", Icon: NotebookPen },
      { to: "/mensajes", label: "Mensajes", Icon: BookOpenCheck },
    ];

    definirAnchoVentana(1280);
    render(
      <MemoryRouter
        initialEntries={["/inicio"]}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <ProveedorTema>
          <MarcoPortal
            usuarioNombre="Julio Gamboa Rojas"
            usuarioDetalle="Docente · Matemática"
            subtituloPortal="Portal Docente"
            navItems={navDocente}
            navMovilItems={movDocente}
          >
            <div>Vista docente</div>
          </MarcoPortal>
        </ProveedorTema>
      </MemoryRouter>,
    );

    expect(screen.getByText("Portal Docente")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Mis cursos/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Nota del día/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Exportar SIAGIE/i })).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  // Spec: plataforma-web · Scenario: Barra inferior compacta para sesión Docente en móvil
  it("renderiza navegacion movil docente sin barra lateral en 360x640", () => {
    const navDocente: ElementoNavPortal[] = [
      { to: "/inicio", label: "Inicio", Icon: Home },
      { to: "/cursos", label: "Mis cursos", Icon: Library, badge: 3 },
    ];

    definirAnchoVentana(360);
    render(
      <MemoryRouter
        initialEntries={["/inicio"]}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <ProveedorTema>
          <MarcoPortal
            usuarioNombre="Julio Gamboa Rojas"
            usuarioDetalle="Docente · Matemática"
            subtituloPortal="Portal Docente"
            navItems={navDocente}
            navMovilItems={navDocente}
          >
            <div>Vista docente móvil</div>
          </MarcoPortal>
        </ProveedorTema>
      </MemoryRouter>,
    );

    expect(
      screen.queryByRole("navigation", { name: "Navegación principal" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: "Navegación móvil" }),
    ).toBeInTheDocument();
    expect(screen.getByText("JR")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  // Spec: plataforma-web · Scenario: Selector contextual de menor en MarcoPortal escritorio y móvil (AC07)
  it("muestra y permite cambiar de menor en escritorio (1280px) y movil (360px)", () => {
    const onSeleccionar = vi.fn();
    const navApoderado: ElementoNavPortal[] = [
      { to: "/inicio", label: "Inicio", Icon: Home },
      { to: "/cursos", label: "Cursos", Icon: Library },
    ];
    const selector = {
      etiquetaAccion: "Cambiar de menor",
      seleccionadoId: "est-demo-1",
      onSeleccionar,
      opciones: [
        {
          id: "est-demo-1",
          etiqueta: "Luis Ángel Quispe Huamán",
          detalle: "3.° de Secundaria B",
          iniciales: "LQ",
        },
        {
          id: "est-demo-2",
          etiqueta: "Sofía Quispe Huamán",
          detalle: "1.° de Secundaria A",
          iniciales: "SQ",
        },
      ],
    };

    definirAnchoVentana(1280);
    const { unmount } = render(
      <MemoryRouter
        initialEntries={["/inicio"]}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <ProveedorTema>
          <MarcoPortal
            usuarioNombre="Rosa Huamán Ccori"
            usuarioDetalle="Apoderado · 2 hijos"
            subtituloPortal="Portal de Familias"
            navItems={navApoderado}
            navMovilItems={navApoderado}
            selectorContexto={selector}
          >
            <div>Vista apoderado</div>
          </MarcoPortal>
        </ProveedorTema>
      </MemoryRouter>,
    );

    expect(screen.getByText("Portal de Familias")).toBeInTheDocument();
    expect(screen.getByText("Luis Ángel Quispe Huamán")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Cambiar de menor/i }));
    fireEvent.click(screen.getByRole("button", { name: /Sofía Quispe Huamán/i }));
    expect(onSeleccionar).toHaveBeenCalledWith("est-demo-2");

    unmount();
    onSeleccionar.mockClear();

    definirAnchoVentana(360);
    render(
      <MemoryRouter
        initialEntries={["/inicio"]}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <ProveedorTema>
          <MarcoPortal
            usuarioNombre="Rosa Huamán Ccori"
            usuarioDetalle="Apoderado · 2 hijos"
            subtituloPortal="Portal de Familias"
            navItems={navApoderado}
            navMovilItems={navApoderado}
            selectorContexto={selector}
          >
            <div>Vista apoderado móvil</div>
          </MarcoPortal>
        </ProveedorTema>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: /Cambiar de menor/i }));
    fireEvent.click(screen.getByRole("button", { name: /Sofía Quispe Huamán/i }));
    expect(onSeleccionar).toHaveBeenCalledWith("est-demo-2");
  });
});
