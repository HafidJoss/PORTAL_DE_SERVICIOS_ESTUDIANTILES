// Spec: plataforma-web, evaluacion · Hook compartido useEsMovil (< 1024 px, AC04)
import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { useEsMovil } from "../hooks/useEsMovil";

describe("useEsMovil", () => {
  const anchoOriginal = window.innerWidth;

  afterEach(() => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: anchoOriginal,
    });
  });

  it("detecta viewport movil (< 1024 px) y reacciona al evento resize", () => {
    Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: 390 });
    const { result } = renderHook(() => useEsMovil());
    expect(result.current).toBe(true);

    act(() => {
      Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: 1280 });
      window.dispatchEvent(new Event("resize"));
    });
    expect(result.current).toBe(false);
  });
});
