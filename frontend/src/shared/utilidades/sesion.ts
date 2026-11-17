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
