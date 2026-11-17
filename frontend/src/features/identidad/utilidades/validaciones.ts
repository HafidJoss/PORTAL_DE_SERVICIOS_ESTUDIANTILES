export function normalizarDni(valor: string): string {
  return valor.replace(/\D/g, "").slice(0, 8);
}

export function normalizarCodigoActivacion(valor: string): string {
  return valor.trim().toUpperCase().slice(0, 6);
}

export function validarLogin(dni: string, contrasena: string): string | null {
  if (!/^\d{8}$/.test(dni)) {
    return "Ingresa tu número de DNI de 8 dígitos.";
  }
  if (!contrasena.trim()) {
    return "Ingresa tu contraseña.";
  }
  return null;
}

export function validarActivacion(
  dni: string,
  codigo: string,
  nuevaContrasena: string,
  confirmarContrasena: string,
  aceptaPrivacidad: boolean,
): string | null {
  if (!/^\d{8}$/.test(dni)) {
    return "El DNI debe tener 8 dígitos.";
  }
  if (codigo.trim().length !== 6) {
    return "El código de activación tiene 6 caracteres.";
  }
  if (nuevaContrasena.length < 8) {
    return "La contraseña debe tener al menos 8 caracteres.";
  }
  if (nuevaContrasena !== confirmarContrasena) {
    return "Las contraseñas no coinciden.";
  }
  if (!aceptaPrivacidad) {
    return "Debes aceptar el Aviso de privacidad.";
  }
  return null;
}

export function validarCambioContrasena(
  contrasenaActual: string,
  nuevaContrasena: string,
  confirmarContrasena: string,
): string | null {
  if (!contrasenaActual) {
    return "Ingresa tu contraseña actual.";
  }
  if (nuevaContrasena.length < 8) {
    return "La nueva contraseña debe tener al menos 8 caracteres.";
  }
  if (nuevaContrasena !== confirmarContrasena) {
    return "Las contraseñas no coinciden.";
  }
  return null;
}
