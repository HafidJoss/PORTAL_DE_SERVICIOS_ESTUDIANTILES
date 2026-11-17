export interface ResultadoValidacionMensajeDocente {
  valido: boolean;
  error: string;
}

/** Valida asunto (>= 3 caracteres) y cuerpo (>= 5 caracteres) del mensaje saliente (RF25). */
export function validarFormularioMensajeDocente({
  asunto,
  cuerpo,
}: {
  asunto: string;
  cuerpo: string;
}): ResultadoValidacionMensajeDocente {
  if (asunto.trim().length < 3) {
    return { valido: false, error: "El asunto debe tener al menos 3 caracteres." };
  }
  if (cuerpo.trim().length < 5) {
    return { valido: false, error: "El mensaje debe tener al menos 5 caracteres." };
  }
  return { valido: true, error: "" };
}

/** Describe a quiénes alcanzará el mensaje antes de confirmar el envío. */
export function describirAlcanceDestinatario(
  seccionNombre: string,
  totalEstudiantes: number,
  estudianteNombre?: string,
): string {
  if (estudianteNombre && estudianteNombre.trim().length > 0) {
    return `Llegará a ${estudianteNombre.trim()} y su apoderado.`;
  }
  return `Llegará a ${totalEstudiantes} estudiantes y sus apoderados (${seccionNombre}).`;
}
