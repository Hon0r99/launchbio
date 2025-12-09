import { describe, it, expect, beforeEach, vi } from "vitest";
import * as actions from "@/lib/actions";
import { createPrismaMock } from "../../helpers/prisma-mock";
import { createCookiesMock } from "../../helpers/cookies-mock";
import Stripe from "stripe";

// Mock modules
vi.mock("@/lib/prisma", async () => {
  const { createPrismaMock } = await import("../../helpers/prisma-mock");
  return {
    prisma: createPrismaMock(),
  };
});

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Create a shared mock function that will be used by all Stripe instances
const sharedCreateMock = vi.fn();

vi.mock("stripe", () => {
  const StripeMock = class {
    checkout: {
      sessions: {
        create: ReturnType<typeof vi.fn>;
      };
    };

    constructor(apiKey: string, config?: any) {
      if (!apiKey) {
        throw new Error("Neither apiKey nor config.authenticator provided");
      }
      this.checkout = {
        sessions: {
          create: sharedCreateMock,
        },
      };
    }
  };
  return {
    default: StripeMock,
  };
});

describe("actions", () => {
  let mockPrisma: ReturnType<typeof createPrismaMock>;
  let mockCookieStore: ReturnType<typeof createCookiesMock>["mockCookieStore"];

  beforeEach(async () => {
    vi.clearAllMocks();
    sharedCreateMock.mockClear();
    const { prisma } = await import("@/lib/prisma");
    mockPrisma = prisma as ReturnType<typeof createPrismaMock>;
    const { cookies } = await import("next/headers");
    const { mockCookieStore: store } = createCookiesMock();
    mockCookieStore = store;
    vi.mocked(cookies).mockResolvedValue(store as any);
  });

  describe("createPageAction", () => {
    it("should create page for authenticated user", async () => {
      const userId = "user-1";
      const token = "valid-token";
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);

      mockCookieStore.get.mockReturnValue({ value: token } as any);
      vi.mocked(mockPrisma.session.findUnique).mockResolvedValue({
        id: "session-1",
        token,
        userId,
        expiresAt,
        createdAt: new Date(),
        user: {
          id: userId,
          email: "test@example.com",
          passwordHash: "hashed",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      } as any);

      const formData = new FormData();
      formData.set("title", "Test Launch");
      formData.set("description", "Test description");
      formData.set("eventDate", "2024-12-31");
      formData.set("eventTime", "12:00");
      formData.set("bgType", "dark-gradient");
      formData.set("buttons", JSON.stringify([{ label: "Button", url: "https://example.com" }]));

      vi.mocked(mockPrisma.page.create).mockResolvedValue({
        id: "page-1",
        slug: "test-launch-abc123",
        editToken: "edit-token-123",
        title: "Test Launch",
        description: "Test description",
        eventDateTime: new Date("2024-12-31T12:00:00Z"),
        bgType: "dark-gradient",
        buttons: JSON.stringify([{ label: "Button", url: "https://example.com" }]),
        showBranding: true,
        isPro: false,
        views: 0,
        ownerEmail: null,
        afterLaunchText: null,
        analyticsId: null,
        ownerId: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const result = await actions.createPageAction(formData);

      expect(result.slug).toBeDefined();
      expect(result.editToken).toBeDefined();
      expect(mockPrisma.page.create).toHaveBeenCalled();
    });

    it("should create page for unauthenticated user", async () => {
      mockCookieStore.get.mockReturnValue(undefined);

      const formData = new FormData();
      formData.set("title", "Test Launch");
      formData.set("eventDate", "2024-12-31");
      formData.set("eventTime", "12:00");
      formData.set("bgType", "dark-gradient");
      formData.set("buttons", JSON.stringify([{ label: "Button", url: "https://example.com" }]));

      vi.mocked(mockPrisma.page.create).mockResolvedValue({
        id: "page-1",
        slug: "test-launch-abc123",
        editToken: "edit-token-123",
        title: "Test Launch",
        eventDateTime: new Date("2024-12-31T12:00:00Z"),
        bgType: "dark-gradient",
        buttons: JSON.stringify([{ label: "Button", url: "https://example.com" }]),
        showBranding: true,
        isPro: false,
        views: 0,
        ownerId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const result = await actions.createPageAction(formData);

      expect(result.slug).toBeDefined();
      const createCall = vi.mocked(mockPrisma.page.create).mock.calls[0][0];
      // ownerId can be null or undefined for unauthenticated user
      expect(createCall.data.ownerId === null || createCall.data.ownerId === undefined).toBe(true);
    });

    it("should throw error on invalid data", async () => {
      const formData = new FormData();
      formData.set("title", ""); // Empty title

      await expect(actions.createPageAction(formData)).rejects.toThrow("Invalid data");
    });

    it("should throw error when using PRO theme without PRO plan", async () => {
      const formData = new FormData();
      formData.set("title", "Test Launch");
      formData.set("eventDate", "2024-12-31");
      formData.set("eventTime", "12:00");
      formData.set("bgType", "ocean-blue"); // PRO theme
      formData.set("buttons", JSON.stringify([{ label: "Button", url: "https://example.com" }]));

      await expect(actions.createPageAction(formData)).rejects.toThrow("PRO themes require Launch Pack upgrade");
    });
  });

  describe("updatePageAction", () => {
    it("should update own page", async () => {
      const userId = "user-1";
      const editToken = "edit-token-123";
      const token = "valid-token";
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);

      mockCookieStore.get.mockReturnValue({ value: token } as any);
      vi.mocked(mockPrisma.session.findUnique).mockResolvedValue({
        id: "session-1",
        token,
        userId,
        expiresAt,
        createdAt: new Date(),
        user: {
          id: userId,
          email: "test@example.com",
          passwordHash: "hashed",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      } as any);

      vi.mocked(mockPrisma.page.findUnique).mockResolvedValue({
        id: "page-1",
        ownerId: userId,
        isPro: false,
      } as any);

      const formData = new FormData();
      formData.set("title", "Updated Title");
      formData.set("eventDate", "2024-12-31");
      formData.set("eventTime", "12:00");
      formData.set("bgType", "dark-gradient");
      formData.set("buttons", JSON.stringify([{ label: "Button", url: "https://example.com" }]));

      vi.mocked(mockPrisma.page.update).mockResolvedValue({
        id: "page-1",
        slug: "test-launch-abc123",
        title: "Updated Title",
      } as any);

      const result = await actions.updatePageAction(editToken, formData);

      expect(result).toBeDefined();
      expect(mockPrisma.page.update).toHaveBeenCalled();
    });

    it("should throw error when trying to update other page", async () => {
      const userId = "user-1";
      const otherUserId = "user-2";
      const editToken = "edit-token-123";
      const token = "valid-token";
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);

      mockCookieStore.get.mockReturnValue({ value: token } as any);
      vi.mocked(mockPrisma.session.findUnique).mockResolvedValue({
        id: "session-1",
        token,
        userId,
        expiresAt,
        createdAt: new Date(),
        user: {
          id: userId,
          email: "test@example.com",
          passwordHash: "hashed",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      } as any);

      vi.mocked(mockPrisma.page.findUnique).mockResolvedValue({
        id: "page-1",
        ownerId: otherUserId, // Other user
      } as any);

      const formData = new FormData();
      formData.set("title", "Updated Title");
      formData.set("eventDate", "2024-12-31");
      formData.set("eventTime", "12:00");
      formData.set("bgType", "dark-gradient");
      formData.set("buttons", JSON.stringify([{ label: "Button", url: "https://example.com" }]));

      await expect(actions.updatePageAction(editToken, formData)).rejects.toThrow("Unauthorized");
    });

    it("should throw error when page does not exist", async () => {
      const editToken = "invalid-token";

      vi.mocked(mockPrisma.page.findUnique).mockResolvedValue(null);

      const formData = new FormData();
      formData.set("title", "Updated Title");
      formData.set("eventDate", "2024-12-31");
      formData.set("eventTime", "12:00");
      formData.set("bgType", "dark-gradient");
      formData.set("buttons", JSON.stringify([{ label: "Button", url: "https://example.com" }]));

      await expect(actions.updatePageAction(editToken, formData)).rejects.toThrow("Page not found");
    });

    it("should throw error when using PRO theme without PRO plan", async () => {
      const userId = "user-1";
      const editToken = "edit-token-123";
      const token = "valid-token";
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);

      mockCookieStore.get.mockReturnValue({ value: token } as any);
      vi.mocked(mockPrisma.session.findUnique).mockResolvedValue({
        id: "session-1",
        token,
        userId,
        expiresAt,
        createdAt: new Date(),
        user: {
          id: userId,
          email: "test@example.com",
          passwordHash: "hashed",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      } as any);

      vi.mocked(mockPrisma.page.findUnique).mockResolvedValue({
        id: "page-1",
        ownerId: userId,
        isPro: false, // Not PRO
      } as any);

      const formData = new FormData();
      formData.set("title", "Updated Title");
      formData.set("eventDate", "2024-12-31");
      formData.set("eventTime", "12:00");
      formData.set("bgType", "ocean-blue"); // PRO theme
      formData.set("buttons", JSON.stringify([{ label: "Button", url: "https://example.com" }]));

      await expect(actions.updatePageAction(editToken, formData)).rejects.toThrow("PRO themes require Launch Pack upgrade");
    });
  });

  describe("incrementViews", () => {
    it("should increment view counter", async () => {
      const slug = "test-launch-abc123";

      vi.mocked(mockPrisma.page.update).mockResolvedValue({
        id: "page-1",
        slug,
        views: 1,
      } as any);

      await actions.incrementViews(slug);

      expect(mockPrisma.page.update).toHaveBeenCalledWith({
        where: { slug },
        data: { views: { increment: 1 } },
      });
    });
  });

  describe("markPro", () => {
    it("should update status to PRO", async () => {
      const editToken = "edit-token-123";
      const slug = "test-launch-abc123";

      vi.mocked(mockPrisma.page.update).mockResolvedValue({
        id: "page-1",
        slug,
        editToken,
        isPro: true,
        showBranding: false,
      } as any);

      const result = await actions.markPro(editToken);

      expect(result.isPro).toBe(true);
      expect(result.showBranding).toBe(false);
      expect(mockPrisma.page.update).toHaveBeenCalledWith({
        where: { editToken },
        data: { isPro: true, showBranding: false },
      });
    });
  });

  describe("startCheckout", () => {
    it("should create Stripe checkout session", async () => {
      const userId = "user-1";
      const editToken = "edit-token-123";
      const token = "valid-token";
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);
      const origin = "https://example.com";

      process.env.STRIPE_SECRET_KEY = "sk_test_123";

      mockCookieStore.get.mockReturnValue({ value: token } as any);
      vi.mocked(mockPrisma.session.findUnique).mockResolvedValue({
        id: "session-1",
        token,
        userId,
        expiresAt,
        createdAt: new Date(),
        user: {
          id: userId,
          email: "test@example.com",
          passwordHash: "hashed",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      } as any);

      vi.mocked(mockPrisma.page.findUnique).mockResolvedValue({
        id: "page-1",
        slug: "test-launch",
        editToken,
      } as any);

      // Mock Stripe session creation using the shared mock
      sharedCreateMock.mockResolvedValue({
        url: "https://checkout.stripe.com/session-123",
      });

      const result = await actions.startCheckout(editToken, origin);

      expect(result.url).toBe("https://checkout.stripe.com/session-123");
      expect(sharedCreateMock).toHaveBeenCalled();
    });

    it("should throw error when unauthorized user", async () => {
      mockCookieStore.get.mockReturnValue(undefined);

      await expect(actions.startCheckout("edit-token", "https://example.com")).rejects.toThrow("Sign in to upgrade to Pro");
    });

    it("should throw error when Stripe configuration", async () => {
      delete process.env.STRIPE_SECRET_KEY;

      const userId = "user-1";
      const token = "valid-token";
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);

      mockCookieStore.get.mockReturnValue({ value: token } as any);
      vi.mocked(mockPrisma.session.findUnique).mockResolvedValue({
        id: "session-1",
        token,
        userId,
        expiresAt,
        createdAt: new Date(),
        user: {
          id: userId,
          email: "test@example.com",
          passwordHash: "hashed",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      } as any);

      await expect(actions.startCheckout("edit-token", "https://example.com")).rejects.toThrow("Stripe is not configured");
    });

    it("should throw error when page does not exist", async () => {
      const userId = "user-1";
      const token = "valid-token";
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);

      process.env.STRIPE_SECRET_KEY = "sk_test_123";

      mockCookieStore.get.mockReturnValue({ value: token } as any);
      vi.mocked(mockPrisma.session.findUnique).mockResolvedValue({
        id: "session-1",
        token,
        userId,
        expiresAt,
        createdAt: new Date(),
        user: {
          id: userId,
          email: "test@example.com",
          passwordHash: "hashed",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      } as any);

      vi.mocked(mockPrisma.page.findUnique).mockResolvedValue(null);

      // Mock Stripe for this test - ensure create method exists
      const StripeMock = Stripe as any;
      if (!StripeMock.prototype.checkout) {
        StripeMock.prototype.checkout = { sessions: { create: vi.fn() } };
      }

      await expect(actions.startCheckout("invalid-token", "https://example.com")).rejects.toThrow("Page not found");
    });
  });

  describe("revalidatePage", () => {
    it("should revalidate existing page", async () => {
      const editToken = "edit-token-123";
      const slug = "test-launch-abc123";

      vi.mocked(mockPrisma.page.findUnique).mockResolvedValue({
        id: "page-1",
        slug,
        editToken,
      } as any);

      await actions.revalidatePage(editToken);

      expect(mockPrisma.page.findUnique).toHaveBeenCalledWith({ where: { editToken } });
    });

    it("should handle non-existent page", async () => {
      const editToken = "invalid-token";

      vi.mocked(mockPrisma.page.findUnique).mockResolvedValue(null);

      await actions.revalidatePage(editToken);

      expect(mockPrisma.page.findUnique).toHaveBeenCalledWith({ where: { editToken } });
    });
  });
});

