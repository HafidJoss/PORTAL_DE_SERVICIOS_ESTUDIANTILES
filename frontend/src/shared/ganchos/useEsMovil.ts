import { useEffect, useState } from "react";

/** Detecta si el ancho actual de la ventana está por debajo del breakpoint móvil. */
export function useEsMovil(breakpoint = 1024): boolean {
  const [esMovil, setEsMovil] = useState<boolean>(
    () => typeof window !== "undefined" && window.innerWidth < breakpoint,
  );

  useEffect(() => {
    const actualizar = () => setEsMovil(window.innerWidth < breakpoint);
    window.addEventListener("resize", actualizar);
    return () => window.removeEventListener("resize", actualizar);
  }, [breakpoint]);

  return esMovil;
}
