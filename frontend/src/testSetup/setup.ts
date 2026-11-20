import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Compatibilidad con Node 25/26+: expone localStorage global stub sin métodos si falta --localstorage-file
if (
  typeof globalThis.localStorage === "undefined" ||
  typeof globalThis.localStorage.clear !== "function"
) {
  const almacen = new Map<string, string>();
  const storageShim: Storage = {
    get length() {
      return almacen.size;
    },
    clear() {
      almacen.clear();
    },
    getItem(key: string) {
      return almacen.has(key) ? almacen.get(key)! : null;
    },
    key(index: number) {
      return Array.from(almacen.keys())[index] ?? null;
    },
    removeItem(key: string) {
      almacen.delete(key);
    },
    setItem(key: string, value: string) {
      almacen.set(key, String(value));
    },
  };
  Object.defineProperty(globalThis, "localStorage", {
    value: storageShim,
    configurable: true,
    writable: true,
  });
  if (typeof window !== "undefined") {
    Object.defineProperty(window, "localStorage", {
      value: storageShim,
      configurable: true,
      writable: true,
    });
  }
}

afterEach(() => {
  cleanup();
});
