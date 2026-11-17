function escaparCeldaCsv(valor: string): string {
  const texto = String(valor ?? "");
  if (/[;"\n\r]/.test(texto)) {
    return `"${texto.replace(/"/g, '""')}"`;
  }
  return texto;
}

/** Serializa encabezados y filas en formato CSV compatible con Excel (BOM UTF-8 + separador `;`). */
export function serializarRegistroAuxiliarCsv(
  encabezados: readonly string[],
  filas: readonly (readonly string[])[],
): string {
  const lineas = [
    encabezados.map(escaparCeldaCsv).join(";"),
    ...filas.map((fila) => fila.map(escaparCeldaCsv).join(";")),
  ];
  return `\uFEFF${lineas.join("\r\n")}`;
}

/** Dispara la descarga local de un archivo CSV en el navegador. */
export function descargarArchivoCsv(nombreArchivo: string, contenidoCsv: string): void {
  const blob = new Blob([contenidoCsv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = nombreArchivo;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  URL.revokeObjectURL(url);
}
