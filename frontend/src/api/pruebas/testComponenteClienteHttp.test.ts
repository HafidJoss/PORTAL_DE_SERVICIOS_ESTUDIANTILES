// Spec: plataforma-web · Requirement: Comunicación desacoplada y manejo uniforme de errores RFC 9457 (RC03, AC04)
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import {
  customFetch,
  ProblemDetailError,
  setUnauthorizedHandler,
} from "../clienteHttp";

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  server.resetHandlers();
  setUnauthorizedHandler(null);
  document.cookie = "csrf_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
});
afterAll(() => server.close());

describe("customFetch", () => {
  it("envia credentials include y header X-CSRF-Token en mutaciones", async () => {
    document.cookie = "csrf_token=tok_seguro_123; path=/";
    let receivedCsrf: string | null = null;
    let receivedCredentials: RequestCredentials | undefined;

    server.use(
      http.post("http://localhost/api/v1/identidad/logout", ({ request }) => {
        receivedCsrf = request.headers.get("X-CSRF-Token");
        receivedCredentials = request.credentials;
        return HttpResponse.json({ mensaje: "ok" }, { status: 200 });
      }),
    );

    const res = await customFetch<{ data: { mensaje: string }; status: number; headers: Headers }>(
      "http://localhost/api/v1/identidad/logout",
      { method: "POST" },
    );

    expect(res.status).toBe(200);
    expect(res.data.mensaje).toBe("ok");
    expect(receivedCsrf).toBe("tok_seguro_123");
    expect(receivedCredentials).toBe("include");
  });

  it("traduce respuestas 409 RFC 9457 a ProblemDetailError", async () => {
    server.use(
      http.post("http://localhost/api/v1/evaluacion/mensajes/1/respuestas", () => {
        return HttpResponse.json(
          {
            type: "about:blank",
            title: "Conflicto de estado",
            status: 409,
            detail: "El trimestre ya está cerrado.",
          },
          { status: 409, headers: { "Content-Type": "application/problem+json" } },
        );
      }),
    );

    await expect(
      customFetch("http://localhost/api/v1/evaluacion/mensajes/1/respuestas", {
        method: "POST",
      }),
    ).rejects.toMatchObject({
      name: "ProblemDetailError",
      status: 409,
      title: "Conflicto de estado",
      detail: "El trimestre ya está cerrado.",
    });
  });

  it("dispara onUnauthorized en 401 sin ocultar el error", async () => {
    const onUnauthorized = vi.fn();
    setUnauthorizedHandler(onUnauthorized);

    server.use(
      http.get("http://localhost/api/v1/identidad/sesion", () => {
        return HttpResponse.json(
          {
            type: "about:blank",
            title: "No autenticado",
            status: 401,
            detail: "La sesión ha expirado.",
          },
          { status: 401 },
        );
      }),
    );

    await expect(
      customFetch("http://localhost/api/v1/identidad/sesion"),
    ).rejects.toBeInstanceOf(ProblemDetailError);
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });

  it("conserva la sesion en 403 y expone error claro de acceso denegado", async () => {
    const onUnauthorized = vi.fn();
    setUnauthorizedHandler(onUnauthorized);

    server.use(
      http.get("http://localhost/api/v1/seguimiento/estudiantes/otro/inicio", () => {
        return HttpResponse.json(
          {
            type: "about:blank",
            title: "Acceso denegado",
            status: 403,
            detail: "No tienes permiso para ver a este estudiante.",
          },
          { status: 403 },
        );
      }),
    );

    await expect(
      customFetch("http://localhost/api/v1/seguimiento/estudiantes/otro/inicio"),
    ).rejects.toMatchObject({
      status: 403,
      title: "Acceso denegado",
      detail: "No tienes permiso para ver a este estudiante.",
    });
    expect(onUnauthorized).not.toHaveBeenCalled();
  });
});
