import { describe, it, expect } from "vitest";
import { createSlugFromTitle } from "@/lib/slug";

describe("createSlugFromTitle", () => {
  it("should normalize title to lowercase", () => {
    const slug = createSlugFromTitle("MY PRODUCT LAUNCH");
    expect(slug).toMatch(/^my-product-launch-/);
  });

  it("should replace special characters with hyphens", () => {
    const slug = createSlugFromTitle("Product & Launch 2024!");
    expect(slug).toMatch(/^product-launch-2024-/);
  });

  it("should remove hyphens at the beginning and end", () => {
    const slug = createSlugFromTitle("---Product Launch---");
    expect(slug).not.toMatch(/^-/);
    expect(slug).toMatch(/^product-launch-/);
  });

  it("should truncate long titles to 40 characters", () => {
    const longTitle = "A".repeat(100);
    const slug = createSlugFromTitle(longTitle);
    // Base part should be truncated, but nanoid is added
    expect(slug.length).toBeLessThan(50);
    expect(slug).toMatch(/^a+-[a-z0-9]{6}$/);
  });

  it("should handle empty string", () => {
    const slug = createSlugFromTitle("");
    expect(slug).toMatch(/^launch-[a-z0-9]{6}$/);
  });

  it("should handle string with only special characters", () => {
    const slug = createSlugFromTitle("!!!@@@###");
    expect(slug).toMatch(/^launch-[a-z0-9]{6}$/);
  });

  it("should generate unique slugs for same titles", () => {
    const slug1 = createSlugFromTitle("Test Product");
    const slug2 = createSlugFromTitle("Test Product");
    // They should differ due to nanoid
    expect(slug1).not.toBe(slug2);
    // But base part should be the same
    expect(slug1.split("-").slice(0, -1).join("-")).toBe(
      slug2.split("-").slice(0, -1).join("-")
    );
  });

  it("should add nanoid at the end", () => {
    const slug = createSlugFromTitle("Test");
    // nanoid generates 6 characters from a-z0-9 alphabet
    expect(slug).toMatch(/^test-[a-z0-9]{6}$/);
  });

  it("should handle Cyrillic and other Unicode characters", () => {
    const slug = createSlugFromTitle("Запуск Продукта 2024");
    // Cyrillic is removed, but numbers remain, then nanoid is added
    expect(slug).toMatch(/^2024-[a-z0-9]{6}$/);
  });

  it("should handle numbers in title", () => {
    const slug = createSlugFromTitle("Product 2024 Launch");
    expect(slug).toMatch(/^product-2024-launch-/);
  });

  it("should handle multiple spaces", () => {
    const slug = createSlugFromTitle("Product    Launch   2024");
    expect(slug).toMatch(/^product-launch-2024-/);
  });
});

