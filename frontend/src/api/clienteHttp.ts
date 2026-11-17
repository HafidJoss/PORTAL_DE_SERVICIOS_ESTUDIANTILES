export interface ProblemDetail {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
}

export class ProblemDetailError extends Error {
  readonly status: number;
  readonly title: string;
  readonly detail: string;
  readonly problemType: string;
  readonly instance?: string;

  constructor(problem: ProblemDetail) {
    super(problem.detail || problem.title);
    this.name = "ProblemDetailError";
    this.status = problem.status;
    this.title = problem.title;
    this.detail = problem.detail;
    this.problemType = problem.type || "about:blank";
    this.instance = problem.instance;
  }
}

let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  unauthorizedHandler = handler;
}

const METODOS_MUTADORES = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function leerCookie(nombre: string): string | null {
  if (typeof document === "undefined") return null;
  const pares = document.cookie ? document.cookie.split(";") : [];
  for (const par of pares) {
    const [clave, ...resto] = par.trim().split("=");
    if (clave === nombre) {
      return decodeURIComponent(resto.join("="));
    }
  }
  return null;
}

async function parsearCuerpo(response: Response): Promise<unknown> {
  if (response.status === 204) return undefined;
  const texto = await response.text();
  if (!texto) return undefined;
  try {
    return JSON.parse(texto);
  } catch {
    return texto;
  }
}

export const customFetch = async <T>(
  url: string,
  options?: RequestInit,
): Promise<T> => {
  const metodo = (options?.method ?? "GET").toUpperCase();
  const headers = new Headers(options?.headers);

  if (METODOS_MUTADORES.has(metodo) && !headers.has("X-CSRF-Token")) {
    const csrf = leerCookie("csrf_token");
    if (csrf) {
      headers.set("X-CSRF-Token", csrf);
    }
  }

  const response = await fetch(url, {
    ...options,
    method: metodo,
    credentials: options?.credentials ?? "include",
    headers,
  });

  const payload = await parsearCuerpo(response);

  if (!response.ok) {
    if (response.status === 401) {
      unauthorizedHandler?.();
    }

    const problem: ProblemDetail =
      typeof payload === "object" && payload !== null && "title" in payload
        ? {
            type: String((payload as Record<string, unknown>).type ?? "about:blank"),
            title: String((payload as Record<string, unknown>).title ?? "Error en la solicitud"),
            status: Number((payload as Record<string, unknown>).status ?? response.status),
            detail: String(
              (payload as Record<string, unknown>).detail ??
                (response.statusText || "Ocurrió un error al procesar la solicitud."),
            ),
            instance: (payload as Record<string, unknown>).instance
              ? String((payload as Record<string, unknown>).instance)
              : undefined,
          }
        : {
            type: "about:blank",
            title: response.statusText || "Error de comunicación",
            status: response.status,
            detail:
              typeof payload === "string" && payload
                ? payload
                : "No se pudo completar la operación.",
          };

    throw new ProblemDetailError(problem);
  }

  return {
    data: payload,
    status: response.status,
    headers: response.headers,
  } as T;
};
