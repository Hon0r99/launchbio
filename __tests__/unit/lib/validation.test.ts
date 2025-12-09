import { describe, it, expect } from "vitest";
import { validatePassword, pageSchema } from "@/lib/validation";
import { backgroundOptions } from "@/lib/themes";

describe("validatePassword", () => {
  it("should return error for password shorter than 8 characters", () => {
    const result = validatePassword("Short1");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("at least 8 characters");
  });

  it("should return error when uppercase letter is missing", () => {
    const result = validatePassword("lowercase123");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("uppercase");
  });

  it("should return error when lowercase letter is missing", () => {
    const result = validatePassword("UPPERCASE123");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("lowercase");
  });

  it("should return error when number is missing", () => {
    const result = validatePassword("NoNumbers");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("number");
  });

  it("should accept valid password", () => {
    const result = validatePassword("ValidPass123");
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("should accept valid password with minimum length", () => {
    const result = validatePassword("MinLen8A");
    expect(result.valid).toBe(true);
  });

  it("should accept valid password with various characters", () => {
    const result = validatePassword("Complex!Pass123");
    expect(result.valid).toBe(true);
  });
});

describe("pageSchema", () => {
  const validPageData = {
    title: "Test Launch",
    description: "Test description",
    eventDate: "2024-12-31",
    eventTime: "12:00",
    bgType: "dark-gradient" as const,
    buttons: [{ label: "Button", url: "https://example.com" }],
  };

  it("should validate correct data", () => {
    const result = pageSchema.safeParse(validPageData);
    expect(result.success).toBe(true);
  });

  it("should reject empty title", () => {
    const result = pageSchema.safeParse({
      ...validPageData,
      title: "",
    });
    expect(result.success).toBe(false);
  });

  it("should reject title shorter than 2 characters", () => {
    const result = pageSchema.safeParse({
      ...validPageData,
      title: "A",
    });
    expect(result.success).toBe(false);
  });

  it("should accept optional description", () => {
    const result = pageSchema.safeParse({
      ...validPageData,
      description: undefined,
    });
    expect(result.success).toBe(true);
  });

  it("should reject invalid email in ownerEmail", () => {
    const result = pageSchema.safeParse({
      ...validPageData,
      ownerEmail: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("should accept valid email in ownerEmail", () => {
    const result = pageSchema.safeParse({
      ...validPageData,
      ownerEmail: "test@example.com",
    });
    expect(result.success).toBe(true);
  });

  it("should accept empty string in ownerEmail", () => {
    const result = pageSchema.safeParse({
      ...validPageData,
      ownerEmail: "",
    });
    expect(result.success).toBe(true);
  });

  it("should reject invalid bgType", () => {
    const result = pageSchema.safeParse({
      ...validPageData,
      bgType: "invalid-bg-type",
    });
    expect(result.success).toBe(false);
  });

  it("should accept all valid bgType", () => {
    for (const bgType of backgroundOptions) {
      const result = pageSchema.safeParse({
        ...validPageData,
        bgType,
      });
      expect(result.success).toBe(true);
    }
  });

  it("should reject empty buttons array", () => {
    const result = pageSchema.safeParse({
      ...validPageData,
      buttons: [],
    });
    expect(result.success).toBe(false);
  });

  it("should reject button with empty label", () => {
    const result = pageSchema.safeParse({
      ...validPageData,
      buttons: [{ label: "", url: "https://example.com" }],
    });
    expect(result.success).toBe(false);
  });

  it("should reject button with empty url", () => {
    const result = pageSchema.safeParse({
      ...validPageData,
      buttons: [{ label: "Button", url: "" }],
    });
    expect(result.success).toBe(false);
  });

  it("should accept multiple buttons", () => {
    const result = pageSchema.safeParse({
      ...validPageData,
      buttons: [
        { label: "Button 1", url: "https://example.com" },
        { label: "Button 2", url: "https://example2.com" },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("should accept optional fields", () => {
    const result = pageSchema.safeParse({
      ...validPageData,
      afterLaunchText: "After launch text",
      analyticsId: "G-XXXX",
      showBranding: true,
    });
    expect(result.success).toBe(true);
  });

  it("should accept minimum length eventDate", () => {
    const result = pageSchema.safeParse({
      ...validPageData,
      eventDate: "2024",
    });
    expect(result.success).toBe(true);
  });

  it("should accept minimum length eventTime", () => {
    const result = pageSchema.safeParse({
      ...validPageData,
      eventTime: "12",
    });
    expect(result.success).toBe(true);
  });
});

