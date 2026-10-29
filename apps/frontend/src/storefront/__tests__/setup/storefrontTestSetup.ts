/**
 * Storefront test setup (STUDIO-REG-1 · section 3-ب)
 *
 * One setup file for every `src/storefront/__tests__/**` suite. It is wired
 * through `scripts/vitest.storefront.config.ts` (storefront paths only) so the
 * rest of the project keeps its previous vitest behaviour.
 *
 * Why each piece exists (measured on Node 26 + jsdom):
 * 1. `localStorage`/`sessionStorage` are `undefined` inside the jsdom
 *    environment: Node 26 defines `globalThis.localStorage` as a getter that
 *    returns `undefined` unless `--localstorage-file` is passed, and vitest's
 *    jsdom window population skips keys that already exist on `globalThis`.
 *    Suites calling `localStorage.clear()` died in `beforeEach` and zustand
 *    `persist` stores threw `Cannot read properties of undefined (reading
 *    'setItem')` on first render. We install a real in-memory Storage.
 * 2. `window.matchMedia` is not implemented by jsdom; several studio /
 *    storefront components read it during render.
 * 3. `@testing-library/react` only auto-cleans when vitest runs with
 *    `globals: true`. This project imports `describe/it` explicitly, so the DOM
 *    of one test leaked into the next (e.g. two rulers -> "found multiple
 *    elements with the text: 1200"). We register `cleanup` ourselves.
 * 4. Components using `useQuery` crashed with "No QueryClient set" when the
 *    suite rendered them bare. `StorefrontTestProviders` /
 *    `renderWithStorefrontProviders` give those suites a real provider.
 */
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render } from "@testing-library/react";
import type { RenderOptions, RenderResult } from "@testing-library/react";
import { afterEach, beforeEach } from "vitest";

/** Minimal spec-compliant in-memory Storage (no disk, no Node experimental flag). */
export function createMemoryStorage(): Storage {
  let store = new Map<string, string>();

  const storage: Storage = {
    get length() {
      return store.size;
    },
    clear() {
      store = new Map<string, string>();
    },
    getItem(key: string) {
      const normalized = String(key);
      return store.has(normalized) ? (store.get(normalized) as string) : null;
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null;
    },
    removeItem(key: string) {
      store.delete(String(key));
    },
    setItem(key: string, value: string) {
      store.set(String(key), String(value));
    },
  };

  return storage;
}

function defineGlobalProperty(name: "localStorage" | "sessionStorage", value: Storage): void {
  Object.defineProperty(globalThis, name, {
    configurable: true,
    enumerable: true,
    writable: true,
    value,
  });
}

function installMatchMediaPolyfill(): void {
  if (typeof globalThis.matchMedia === "function") return;

  const matchMedia = (query: string): MediaQueryList => {
    const listeners = new Set<(event: MediaQueryListEvent) => void>();
    const mediaQueryList = {
      matches: false,
      media: query,
      onchange: null,
      addEventListener: (_type: string, listener: EventListenerOrEventListenerObject) => {
        if (typeof listener === "function") listeners.add(listener as (event: MediaQueryListEvent) => void);
      },
      removeEventListener: (_type: string, listener: EventListenerOrEventListenerObject) => {
        if (typeof listener === "function") listeners.delete(listener as (event: MediaQueryListEvent) => void);
      },
      addListener: (listener: (event: MediaQueryListEvent) => void) => listeners.add(listener),
      removeListener: (listener: (event: MediaQueryListEvent) => void) => listeners.delete(listener),
      dispatchEvent: () => false,
    };
    return mediaQueryList as unknown as MediaQueryList;
  };

  Object.defineProperty(globalThis, "matchMedia", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: matchMedia,
  });
}

/** Installs the browser API polyfills the storefront suites depend on. Idempotent. */
export function installStorefrontTestPolyfills(): void {
  const hasLocalStorage =
    typeof globalThis.localStorage !== "undefined" && globalThis.localStorage !== null;
  const hasSessionStorage =
    typeof globalThis.sessionStorage !== "undefined" && globalThis.sessionStorage !== null;

  if (!hasLocalStorage) {
    defineGlobalProperty("localStorage", createMemoryStorage());
  }
  if (!hasSessionStorage) {
    defineGlobalProperty("sessionStorage", createMemoryStorage());
  }
  installMatchMediaPolyfill();
}

installStorefrontTestPolyfills();

/** Fresh client per test: no retries, no cache carry-over, no GC timers left behind. */
export function createStorefrontTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

export interface StorefrontTestProvidersProps {
  children: React.ReactNode;
  client?: QueryClient;
}

/** `QueryClientProvider` wrapper for suites that render components using `useQuery`. */
export function StorefrontTestProviders({
  children,
  client,
}: StorefrontTestProvidersProps): React.ReactElement {
  const [queryClient] = React.useState<QueryClient>(() => client ?? createStorefrontTestQueryClient());
  return React.createElement(QueryClientProvider, { client: queryClient }, children);
}

export interface StorefrontRenderOptions extends Omit<RenderOptions, "wrapper"> {
  queryClient?: QueryClient;
}

/** `render()` that always mounts inside a `QueryClientProvider`. */
export function renderWithStorefrontProviders(
  ui: React.ReactElement,
  options: StorefrontRenderOptions = {},
): RenderResult {
  const { queryClient, ...renderOptions } = options;
  const client = queryClient ?? createStorefrontTestQueryClient();
  return render(ui, {
    ...renderOptions,
    wrapper: ({ children }: { children?: React.ReactNode }) =>
      React.createElement(QueryClientProvider, { client }, children),
  });
}

beforeEach(() => {
  installStorefrontTestPolyfills();
  globalThis.localStorage.clear();
  globalThis.sessionStorage.clear();
});

afterEach(() => {
  cleanup();
});
