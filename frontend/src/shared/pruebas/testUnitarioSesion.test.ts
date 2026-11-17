// Spec: identidad, plataforma-web · Resolución segura de identificadores por rol
import { describe, expect, it } from "vitest";

import type { UsuarioSesionOut } from "../../api/generated/model";
import { resolverDocenteId, resolverEstudianteId } from "../utilidades/sesion";

const BASE_USUARIO: UsuarioSesionOut = {
  id: "u-1",
  dni: "72458193",
  nombres: "Luis Ángel",
  apellidos: "Quispe Huamán",
  rol: "Estudiante",
  estudiante_id: "est-1",
};

describe("sesion · resolverEstudianteId y resolverDocenteId", () => {
  it("resuelve estudiante_id solo para Estudiante", () => {
    expect(resolverEstudianteId(BASE_USUARIO)).toBe("est-1");
    expect(resolverDocenteId(BASE_USUARIO)).toBe("");
  });

  it("resuelve docente_id para Docente usando docente_id o id de respaldo", () => {
    const docente: UsuarioSesionOut = {
      ...BASE_USUARIO,
      id: "doc-1",
      rol: "Docente",
      estudiante_id: null,
      docente_id: "doc-demo-1",
    };
    expect(resolverDocenteId(docente)).toBe("doc-demo-1");
    expect(resolverDocenteId({ ...docente, docente_id: null })).toBe("doc-1");
    expect(resolverEstudianteId(docente)).toBe("");
  });
});
