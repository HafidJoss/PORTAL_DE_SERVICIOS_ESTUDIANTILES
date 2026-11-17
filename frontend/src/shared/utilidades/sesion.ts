import type { UsuarioSesionOut } from "../../api/generated/model";

/** Resuelve el identificador del estudiante cuando la sesión corresponde al rol Estudiante. */
export function resolverEstudianteId(usuario: UsuarioSesionOut): string {
  if (usuario.estudiante_id) {
    return usuario.estudiante_id;
  }
  if (usuario.rol === "Estudiante") {
    return usuario.id;
  }
  return "";
}

/** Resuelve el identificador del docente cuando la sesión corresponde al rol Docente. */
export function resolverDocenteId(usuario: UsuarioSesionOut): string {
  if (usuario.docente_id) {
    return usuario.docente_id;
  }
  if (usuario.rol === "Docente") {
    return usuario.id;
  }
  return "";
}
