import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/react";
import { ViewTracker } from "@/components/view-tracker";

describe("ViewTracker", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.clearAllMocks();
  });

  it("should send request to increment views", async () => {
    const slug = "test-launch-abc123";
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    } as Response);

    render(<ViewTracker slug={slug} />);

    await vi.waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/views", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
    });
  });

  it("should handle errors without crashing", async () => {
    const slug = "test-launch-abc123";
    vi.mocked(global.fetch).mockRejectedValue(new Error("Network error"));

    // Should not throw error
    expect(() => render(<ViewTracker slug={slug} />)).not.toThrow();

    await vi.waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it("should send request only once", async () => {
    const slug = "test-launch-abc123";
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    } as Response);

    const { rerender } = render(<ViewTracker slug={slug} />);

    await vi.waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    rerender(<ViewTracker slug={slug} />);

    // Should still be only one call
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("should not render visible content", async () => {
    const slug = "test-launch-abc123";
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    } as Response);

    const { container } = render(<ViewTracker slug={slug} />);

    await vi.waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    // Component renders but has no visible content
    expect(container.textContent).toBe("");
  });
});

