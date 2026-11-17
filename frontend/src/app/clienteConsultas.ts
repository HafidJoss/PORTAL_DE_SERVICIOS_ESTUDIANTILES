import { QueryClient } from "@tanstack/react-query";

import { ProblemDetailError } from "../api/clienteHttp";

const ESTADOS_SIN_REINTENTO = new Set([401, 403, 404, 422]);

export function crearClienteConsultas(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          if (
            error instanceof ProblemDetailError &&
            ESTADOS_SIN_REINTENTO.has(error.status)
          ) {
            return false;
          }
          return failureCount < 1;
        },
      },
    },
  });
}
