// Spec: identidad, plataforma-web · Resolución segura de identificadores por rol
import { describe, expect, it } from "vitest";

import type { UsuarioSesionOut } from "../../api/generated/model";
import {
  resolverApoderadoId,
  resolverContextoEstudiante,
  resolverDocenteId,
  resolverEstudianteId,
  resolverHijoActivo,
} from "../utilidades/sesion";

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


describe("sesion · resolverApoderadoId y resolverHijoActivo", () => {
  it("resuelve apoderado_id y el hijo vinculado activo con respaldo al primero", () => {
    const apoderado: UsuarioSesionOut = {
      ...BASE_USUARIO,
      id: "apo-1",
      rol: "Apoderado",
      estudiante_id: null,
      apoderado_id: "apo-demo-1",
      hijos_vinculados: [
        {
          estudiante_id: "est-demo-1",
          codigo: "20260001",
          nombres: "Luis Ángel",
          apellidos: "Quispe Huamán",
          grado_seccion: "3.° de Secundaria B",
          iniciales: "LQ",
          tutor: "Prof. Mendoza",
        },
        {
          estudiante_id: "est-demo-2",
          codigo: "20260002",
          nombres: "Sofía",
          apellidos: "Quispe Huamán",
          grado_seccion: "1.° de Secundaria A",
          iniciales: "SQ",
          tutor: "Prof. Torres",
        },
      ],
    };

    expect(resolverApoderadoId(apoderado)).toBe("apo-demo-1");
    expect(resolverApoderadoId({ ...apoderado, apoderado_id: null })).toBe("apo-1");
    expect(resolverApoderadoId(BASE_USUARIO)).toBe("");
    expect(resolverHijoActivo(apoderado)?.estudiante_id).toBe("est-demo-1");
    expect(resolverHijoActivo(apoderado, "est-demo-2")?.estudiante_id).toBe("est-demo-2");
    expect(resolverHijoActivo(apoderado, "no-existe")?.estudiante_id).toBe("est-demo-1");
    expect(resolverHijoActivo(BASE_USUARIO)).toBeNull();
  });
});

describe("sesion · resolverContextoEstudiante", () => {
  it("resuelve estudianteId y apoderadoId según rol y menor activo", () => {
    const apoderado: UsuarioSesionOut = {
      ...BASE_USUARIO,
      id: "apo-demo-1",
      rol: "Apoderado",
      estudiante_id: null,
      apoderado_id: "apo-demo-1",
      hijos_vinculados: [
        {
          estudiante_id: "est-demo-1",
          codigo: "20260001",
          nombres: "Luis Ángel",
          apellidos: "Quispe Huamán",
          grado_seccion: "3.° de Secundaria B",
          iniciales: "LQ",
          tutor: "Prof. Mendoza",
        },
        {
          estudiante_id: "est-demo-2",
          codigo: "20260002",
          nombres: "Sofía",
          apellidos: "Quispe Huamán",
          grado_seccion: "1.° de Secundaria A",
          iniciales: "SQ",
          tutor: "Prof. Torres",
        },
      ],
    };

    expect(resolverContextoEstudiante(BASE_USUARIO)).toEqual({
      estudianteId: "est-1",
      apoderadoId: undefined,
    });
    expect(resolverContextoEstudiante(apoderado, "est-demo-2")).toEqual({
      estudianteId: "est-demo-2",
      apoderadoId: "apo-demo-1",
    });
    expect(
      resolverContextoEstudiante({ ...BASE_USUARIO, rol: "Docente", estudiante_id: null }),
    ).toEqual({
      estudianteId: "",
      apoderadoId: undefined,
    });
  });
});
