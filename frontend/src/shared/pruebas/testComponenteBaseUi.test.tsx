// Spec: plataforma-web · Requirement: Shell responsivo e identidad visual del portal (RC01, AC07)
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AvatarIniciales } from "../componentes/avatarIniciales";
import { InsigniaNivel } from "../componentes/insigniaNivel";

describe("AvatarIniciales", () => {
  it("muestra las dos iniciales del nombre sin ofrecer subida de archivos", () => {
    const { container } = render(<AvatarIniciales nombre="Luis Ángel Quispe" />);

    expect(screen.getByText("LQ")).toBeInTheDocument();
    expect(container.querySelector('input[type="file"]')).toBeNull();
  });

  it("maneja nombres cortos con una sola palabra", () => {
    render(<AvatarIniciales nombre="Mariscal" />);

    expect(screen.getByText("MA")).toBeInTheDocument();
  });
});

describe("InsigniaNivel", () => {
  it.each(["AD", "A", "B", "C", "—"] as const)(
    "renderiza el nivel de logro %s con su etiqueta accesible",
    (nivel) => {
      render(<InsigniaNivel nivel={nivel} />);
      expect(screen.getByText(nivel)).toBeInTheDocument();
    },
  );
});
