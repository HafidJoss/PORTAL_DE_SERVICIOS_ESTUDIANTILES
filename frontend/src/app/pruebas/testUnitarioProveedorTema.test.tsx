// Spec: plataforma-web · Requirement: Preferencia de tema claro y oscuro en el navegador (RC01)
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { ProveedorTema, useTema } from "../proveedorTema";

function SelectorTemaPrueba() {
  const { theme, setTheme } = useTema();
  return (
    <div>
      <span data-testid="tema-actual">{theme}</span>
      <button onClick={() => setTheme("oscuro")}>Oscuro</button>
      <button onClick={() => setTheme("claro")}>Claro</button>
    </div>
  );
}

describe("ProveedorTema", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  });

  it("inicia en claro y persiste el tema oscuro tras recargar", async () => {
    const user = userEvent.setup();
    const { unmount } = render(
      <ProveedorTema>
        <SelectorTemaPrueba />
      </ProveedorTema>,
    );

    expect(screen.getByTestId("tema-actual")).toHaveTextContent("claro");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");

    await user.click(screen.getByRole("button", { name: "Oscuro" }));

    expect(screen.getByTestId("tema-actual")).toHaveTextContent("oscuro");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(localStorage.getItem("portal-est-theme")).toBe("oscuro");

    unmount();

    render(
      <ProveedorTema>
        <SelectorTemaPrueba />
      </ProveedorTema>,
    );

    expect(screen.getByTestId("tema-actual")).toHaveTextContent("oscuro");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });
});
