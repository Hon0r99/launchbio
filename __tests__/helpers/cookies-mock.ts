import { vi } from "vitest";

export function createCookiesMock() {
  const cookies = new Map<string, string>();
  const mockCookieStore = {
    get: vi.fn((name: string) => {
      const value = cookies.get(name);
      return value ? { value } : undefined;
    }),
    set: vi.fn((name: string, value: string, options?: any) => {
      cookies.set(name, value);
    }),
    delete: vi.fn((name: string) => {
      cookies.delete(name);
    }),
  };

  return {
    cookies,
    mockCookieStore,
  };
}

