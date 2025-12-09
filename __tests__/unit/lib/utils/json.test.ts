import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { safeJsonParse, safeJsonStringify } from "@/lib/utils/json";

describe("safeJsonParse", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should parse valid JSON", () => {
    const result = safeJsonParse('{"key": "value"}', {});
    expect(result).toEqual({ key: "value" });
  });

  it("should return fallback for invalid JSON", () => {
    const fallback = { default: true };
    const result = safeJsonParse('{"invalid": json}', fallback);
    expect(result).toBe(fallback);
    expect(console.error).toHaveBeenCalled();
  });

  it("should return fallback for null", () => {
    const fallback = { default: true };
    const result = safeJsonParse(null, fallback);
    expect(result).toBe(fallback);
  });

  it("should return fallback for undefined", () => {
    const fallback = { default: true };
    const result = safeJsonParse(undefined, fallback);
    expect(result).toBe(fallback);
  });

  it("should return fallback for empty string", () => {
    const fallback = { default: true };
    const result = safeJsonParse("", fallback);
    expect(result).toBe(fallback);
  });

  it("should parse array", () => {
    const result = safeJsonParse('[{"label": "Button", "url": "https://example.com"}]', []);
    expect(result).toEqual([{ label: "Button", url: "https://example.com" }]);
  });

  it("should parse number", () => {
    const result = safeJsonParse("123", 0);
    expect(result).toBe(123);
  });

  it("should parse string", () => {
    const result = safeJsonParse('"test"', "");
    expect(result).toBe("test");
  });

  it("should parse boolean", () => {
    const result = safeJsonParse("true", false);
    expect(result).toBe(true);
  });

  it("should use typed fallback", () => {
    type Button = { label: string; url: string };
    const fallback: Button[] = [];
    const result = safeJsonParse<Button[]>('[]', fallback);
    expect(result).toEqual([]);
  });
});

describe("safeJsonStringify", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should stringify object", () => {
    const result = safeJsonStringify({ key: "value" });
    expect(result).toBe('{"key":"value"}');
  });

  it("should return fallback on error", () => {
    const circular: any = {};
    circular.self = circular;
    const result = safeJsonStringify(circular, "{}");
    expect(result).toBe("{}");
    expect(console.error).toHaveBeenCalled();
  });

  it("should use default fallback", () => {
    const circular: any = {};
    circular.self = circular;
    const result = safeJsonStringify(circular);
    expect(result).toBe("{}");
  });

  it("should stringify array", () => {
    const result = safeJsonStringify([1, 2, 3]);
    expect(result).toBe("[1,2,3]");
  });

  it("should stringify string", () => {
    const result = safeJsonStringify("test");
    expect(result).toBe('"test"');
  });

  it("should stringify number", () => {
    const result = safeJsonStringify(123);
    expect(result).toBe("123");
  });

  it("should stringify boolean", () => {
    const result = safeJsonStringify(true);
    expect(result).toBe("true");
  });

  it("should stringify null", () => {
    const result = safeJsonStringify(null);
    expect(result).toBe("null");
  });
});

