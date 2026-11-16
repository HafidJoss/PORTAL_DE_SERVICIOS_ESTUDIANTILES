import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type TemaPortal = "claro" | "oscuro";

const STORAGE_KEY = "portal-est-theme";

interface ThemeContextValue {
  theme: TemaPortal;
  setTheme: (next: TemaPortal) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function leerTemaInicial(): TemaPortal {
  try {
    const guardado = localStorage.getItem(STORAGE_KEY);
    if (guardado === "oscuro" || guardado === "claro") {
      return guardado;
    }
  } catch {
    // Ignorar errores de acceso a almacenamiento
  }
  return "claro";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<TemaPortal>(leerTemaInicial);

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      theme === "oscuro" ? "dark" : "light",
    );
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Ignorar errores de cuota o privacidad
    }
  }, [theme]);

  const setTheme = useCallback((next: TemaPortal) => {
    setThemeState(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === "oscuro" ? "claro" : "oscuro"));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme debe usarse dentro de ThemeProvider");
  }
  return ctx;
}
