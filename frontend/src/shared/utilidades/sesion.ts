import type { HijoVinculadoOut, UsuarioSesionOut } from "../../api/generated/model";

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

/** Resuelve el identificador del apoderado cuando la sesión corresponde al rol Apoderado. */
export function resolverApoderadoId(usuario: UsuarioSesionOut): string {
  if (usuario.apoderado_id) {
    return usuario.apoderado_id;
  }
  if (usuario.rol === "Apoderado") {
    return usuario.id;
  }
  return "";
}

/** Resuelve el hijo vinculado activo (o el primero por defecto) para un Apoderado. */
export function resolverHijoActivo(
  usuario: UsuarioSesionOut,
  hijoActivoId?: string | null,
): HijoVinculadoOut | null {
  const hijos = usuario.hijos_vinculados ?? [];
  if (hijos.length === 0) {
    return null;
  }
  if (hijoActivoId) {
    const encontrado = hijos.find((h) => h.estudiante_id === hijoActivoId);
    if (encontrado) {
      return encontrado;
    }
  }
  return hijos[0];
}

/** Resuelve el estudiante objetivo y el apoderado_id opcional para vistas académicas multi-rol. */
export function resolverContextoEstudiante(
  usuario: UsuarioSesionOut,
  hijoActivoId?: string | null,
): { estudianteId: string; apoderadoId?: string } {
  if (usuario.rol === "Apoderado") {
    const hijo = resolverHijoActivo(usuario, hijoActivoId);
    const apoderadoId = resolverApoderadoId(usuario);
    return {
      estudianteId: hijo?.estudiante_id ?? "",
      apoderadoId: apoderadoId || undefined,
    };
  }
  return {
    estudianteId: resolverEstudianteId(usuario),
    apoderadoId: undefined,
  };
}
