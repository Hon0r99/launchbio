import { describe, it, expect, beforeEach, vi } from "vitest";
import { POST } from "@/app/api/views/route";
import * as actions from "@/lib/actions";

vi.mock("@/lib/actions", () => ({
  incrementViews: vi.fn(),
}));

describe("POST /api/views", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should successfully increment views", async () => {
    const slug = "test-launch-abc123";

    vi.mocked(actions.incrementViews).mockResolvedValue(undefined);

    const request = new Request("https://example.com/api/views", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ slug }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(actions.incrementViews).toHaveBeenCalledWith(slug);
  });

  it("should return error when slug is missing", async () => {
    const request = new Request("https://example.com/api/views", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.ok).toBe(false);
    expect(actions.incrementViews).not.toHaveBeenCalled();
  });

  it("should handle database errors", async () => {
    const slug = "test-launch-abc123";

    vi.mocked(actions.incrementViews).mockRejectedValue(new Error("Database error"));

    const request = new Request("https://example.com/api/views", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ slug }),
    });

    // Suppress error output to console for this test
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.ok).toBe(false);
    expect(consoleError).toHaveBeenCalled();

    consoleError.mockRestore();
  });
});

