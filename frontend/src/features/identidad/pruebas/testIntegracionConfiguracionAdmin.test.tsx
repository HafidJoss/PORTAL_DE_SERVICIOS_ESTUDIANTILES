// Spec: identidad · Requirement: Configuración personal y avisos del Administrador en solo lectura (RF14, RC07, RC08)
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { UsuarioSesionOut } from "../../../api/generated/model";
import { ProveedorTema } from "../../../app/proveedorTema";
import { ConfiguracionVista } from "../vistas/configuracionVista";

const ADMIN_DEMO: UsuarioSesionOut = {
  id: "adm-demo-1",
  dni: "10456723",
  nombres: "Marco",
  apellidos: "Ayala Sulca",
  rol: "Administrador",
  institucion: "G.U.E. Mariscal Cáceres",
  alcance: "Primaria y Secundaria",
};

describe("ConfiguracionVista (Administrador)", () => {
  it("muestra avatar de iniciales sin subida de foto, datos institucionales y avisos administrativos", () => {
    const qc = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });

    const { container } = render(
      <QueryClientProvider client={qc}>
        <ProveedorTema>
          <ConfiguracionVista usuario={ADMIN_DEMO} />
        </ProveedorTema>
      </QueryClientProvider>,
    );

    expect(screen.getByText("MA")).toBeInTheDocument();
    expect(container.querySelector('input[type="file"]')).toBeNull();
    expect(screen.getByText("10456723")).toBeInTheDocument();
    expect(screen.getByText("G.U.E. Mariscal Cáceres")).toBeInTheDocument();
    expect(screen.getByText("Primaria y Secundaria")).toBeInTheDocument();
    expect(
      screen.getByRole("switch", { name: "Solicitudes de Secretaría y Dirección" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("switch", { name: "Alertas de seguridad" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("switch", { name: "Resumen semanal de la bitácora" }),
    ).toBeInTheDocument();
  });
});
