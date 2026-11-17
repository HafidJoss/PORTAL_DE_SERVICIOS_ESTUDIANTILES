// Spec: identidad · Scenarios: Validaciones de login, activación y cambio de contraseña (RF14, RF29)
import { describe, expect, it } from "vitest";

import {
  normalizarCodigoActivacion,
  normalizarDni,
  validarActivacion,
  validarCambioContrasena,
  validarLogin,
} from "../validaciones";

describe("validaciones de identidad", () => {
  it("normaliza DNI solo con digitos hasta 8 caracteres y codigo en mayusculas", () => {
    expect(normalizarDni("72a45-819300")).toBe("72458193");
    expect(normalizarCodigoActivacion("k7m2qx9")).toBe("K7M2QX");
  });

  it("valida login correcto y rechaza DNI invalido o contrasena vacia", () => {
    expect(validarLogin("72458193", "mariscal2026")).toBeNull();
    expect(validarLogin("123", "mariscal2026")).toMatch(/8 dígitos/i);
    expect(validarLogin("72458193", "")).toMatch(/contraseña/i);
  });

  it("valida activacion exigiendo 8 digitos, 6 chars, >=8 chars, coincidencia y privacidad", () => {
    expect(
      validarActivacion("72458193", "K7M2QX", "clave1234", "clave1234", true),
    ).toBeNull();
    expect(
      validarActivacion("7245", "K7M2QX", "clave1234", "clave1234", true),
    ).toMatch(/8 dígitos/i);
    expect(
      validarActivacion("72458193", "K7M", "clave1234", "clave1234", true),
    ).toMatch(/6 caracteres/i);
    expect(
      validarActivacion("72458193", "K7M2QX", "123", "123", true),
    ).toMatch(/8 caracteres/i);
    expect(
      validarActivacion("72458193", "K7M2QX", "clave1234", "otra5678", true),
    ).toMatch(/no coinciden/i);
    expect(
      validarActivacion("72458193", "K7M2QX", "clave1234", "clave1234", false),
    ).toMatch(/Aviso de privacidad/i);
  });

  it("valida cambio de contrasena exigiendo actual, nueva >=8 y coincidencia", () => {
    expect(validarCambioContrasena("actual12", "nueva1234", "nueva1234")).toBeNull();
    expect(validarCambioContrasena("", "nueva1234", "nueva1234")).toMatch(/actual/i);
    expect(validarCambioContrasena("actual12", "123", "123")).toMatch(/8 caracteres/i);
    expect(validarCambioContrasena("actual12", "nueva1234", "distinta")).toMatch(
      /no coinciden/i,
    );
  });
});
