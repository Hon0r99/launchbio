import { describe, it, expect, beforeEach, vi } from "vitest";
import { POST } from "@/app/api/checkout/route";
import * as actions from "@/lib/actions";

vi.mock("@/lib/actions", () => ({
  startCheckout: vi.fn(),
}));

describe("POST /api/checkout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should successfully create checkout session", async () => {
    const editToken = "edit-token-123";
    const mockUrl = "https://checkout.stripe.com/session-123";

    vi.mocked(actions.startCheckout).mockResolvedValue({ url: mockUrl });

    const request = new Request("https://example.com/api/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        origin: "https://example.com",
      },
      body: JSON.stringify({ editToken }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.url).toBe(mockUrl);
    expect(actions.startCheckout).toHaveBeenCalledWith(editToken, "https://example.com");
  });

  it("should return error when editToken is missing", async () => {
    const request = new Request("https://example.com/api/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("No token");
    expect(actions.startCheckout).not.toHaveBeenCalled();
  });

  it("should handle Stripe errors", async () => {
    const editToken = "edit-token-123";

    vi.mocked(actions.startCheckout).mockRejectedValue(new Error("Stripe error"));

    const request = new Request("https://example.com/api/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        origin: "https://example.com",
      },
      body: JSON.stringify({ editToken }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Stripe error");
  });

  it("should handle errors without message", async () => {
    const editToken = "edit-token-123";

    // Create error object without message
    const errorWithoutMessage: any = {};
    vi.mocked(actions.startCheckout).mockRejectedValue(errorWithoutMessage);

    const request = new Request("https://example.com/api/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        origin: "https://example.com",
      },
      body: JSON.stringify({ editToken }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Checkout failed");
  });
});

