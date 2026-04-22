import "@testing-library/jest-dom";

// jsdom 29 does not expose a working localStorage by default in the Vitest worker.
// Provide a simple in-memory implementation so LanguageContext can use it.
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem:    (key: string)          => store[key] ?? null,
    setItem:    (key: string, val: string) => { store[key] = val; },
    removeItem: (key: string)          => { delete store[key]; },
    clear:      ()                     => { store = {}; },
    get length() { return Object.keys(store).length; },
    key:        (i: number)            => Object.keys(store)[i] ?? null,
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
  writable: true,
});
