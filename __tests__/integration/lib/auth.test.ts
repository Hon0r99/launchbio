import { describe, it, expect, beforeEach, vi } from "vitest";
import * as auth from "@/lib/auth";
import bcrypt from "bcryptjs";
import { createPrismaMock } from "../../helpers/prisma-mock";
import { createCookiesMock } from "../../helpers/cookies-mock";

// Mock NextAuth to always fail (so it falls back to legacy)
vi.mock("@/lib/auth-server", () => ({
  auth: vi.fn().mockRejectedValue(new Error("NextAuth not configured in tests")),
}));

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

describe("auth", () => {
  let mockPrisma: ReturnType<typeof createPrismaMock>;
  let mockCookieStore: ReturnType<typeof createCookiesMock>["mockCookieStore"];

  beforeEach(async () => {
    vi.clearAllMocks();
    const { prisma } = await import("@/lib/prisma");
    mockPrisma = prisma as ReturnType<typeof createPrismaMock>;
    const { cookies } = await import("next/headers");
    const { mockCookieStore: store } = createCookiesMock();
    mockCookieStore = store;
    vi.mocked(cookies).mockResolvedValue(store as any);
  });

  describe("registerUser", () => {
    it("should successfully register new user", async () => {
      const email = "test@example.com";
      const password = "ValidPass123";

      vi.mocked(mockPrisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(mockPrisma.user.create).mockResolvedValue({
        id: "user-1",
        email,
        passwordHash: "hashed",
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const user = await auth.registerUser(email, password);

      expect(user.email).toBe(email);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { email } });
      expect(mockPrisma.user.create).toHaveBeenCalled();
      const createCall = vi.mocked(mockPrisma.user.create).mock.calls[0][0];
      expect(createCall.data.email).toBe(email);
      expect(createCall.data.passwordHash).toBeDefined();
      expect(createCall.data.passwordHash).not.toBe(password);
    });

    it("should throw error on duplicate email", async () => {
      const email = "existing@example.com";
      const password = "ValidPass123";

      vi.mocked(mockPrisma.user.findUnique).mockResolvedValue({
        id: "user-1",
        email,
        passwordHash: "hashed",
      } as any);

      await expect(auth.registerUser(email, password)).rejects.toThrow("User already exists");
      expect(mockPrisma.user.create).not.toHaveBeenCalled();
    });

    it("should throw error on weak password", async () => {
      const email = "test@example.com";
      const password = "weak";

      await expect(auth.registerUser(email, password)).rejects.toThrow();
      expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
    });

    it("should hash password", async () => {
      const email = "test@example.com";
      const password = "ValidPass123";

      vi.mocked(mockPrisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(mockPrisma.user.create).mockResolvedValue({
        id: "user-1",
        email,
        passwordHash: "hashed",
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      await auth.registerUser(email, password);

      const createCall = vi.mocked(mockPrisma.user.create).mock.calls[0][0];
      const passwordHash = createCall.data.passwordHash;
      expect(bcrypt.compareSync(password, passwordHash)).toBe(true);
    });
  });

  describe("authenticateUser", () => {
    it("should successfully authenticate user", async () => {
      const email = "test@example.com";
      const password = "ValidPass123";
      const passwordHash = bcrypt.hashSync(password, 10);

      vi.mocked(mockPrisma.user.findUnique).mockResolvedValue({
        id: "user-1",
        email,
        passwordHash,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const user = await auth.authenticateUser(email, password);

      expect(user.email).toBe(email);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { email } });
    });

    it("should throw error on invalid email", async () => {
      const email = "nonexistent@example.com";
      const password = "ValidPass123";

      vi.mocked(mockPrisma.user.findUnique).mockResolvedValue(null);

      await expect(auth.authenticateUser(email, password)).rejects.toThrow("Invalid credentials");
    });

    it("should throw error on invalid password", async () => {
      const email = "test@example.com";
      const password = "WrongPass123";
      const correctPassword = "ValidPass123";
      const passwordHash = bcrypt.hashSync(correctPassword, 10);

      vi.mocked(mockPrisma.user.findUnique).mockResolvedValue({
        id: "user-1",
        email,
        passwordHash,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      await expect(auth.authenticateUser(email, password)).rejects.toThrow("Invalid credentials");
    });
  });

  describe("signIn", () => {
    it("should successfully sign in and create session", async () => {
      const email = "test@example.com";
      const password = "ValidPass123";
      const passwordHash = bcrypt.hashSync(password, 10);
      const userId = "user-1";

      vi.mocked(mockPrisma.user.findUnique).mockResolvedValue({
        id: userId,
        email,
        passwordHash,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      vi.mocked(mockPrisma.legacySession.create).mockResolvedValue({
        id: "session-1",
        token: "token-123",
        userId,
        createdAt: new Date(),
        expiresAt: new Date(),
      } as any);

      const user = await auth.signIn(email, password);

      expect(user.email).toBe(email);
      expect(mockPrisma.legacySession.create).toHaveBeenCalled();
      expect(mockCookieStore.set).toHaveBeenCalled();
    });
  });

  describe("signOut", () => {
    it("should delete session and clear cookie", async () => {
      const token = "session-token";

      mockCookieStore.get.mockReturnValue({ value: token } as any);
      vi.mocked(mockPrisma.legacySession.deleteMany).mockResolvedValue({ count: 1 } as any);

      await auth.signOut();

      expect(mockPrisma.legacySession.deleteMany).toHaveBeenCalledWith({ where: { token } });
      expect(mockCookieStore.set).toHaveBeenCalledWith("lb_session", "", expect.any(Object));
    });

    it("should handle missing token", async () => {
      mockCookieStore.get.mockReturnValue(undefined);

      await auth.signOut();

      expect(mockPrisma.legacySession.deleteMany).not.toHaveBeenCalled();
      expect(mockCookieStore.set).toHaveBeenCalledWith("lb_session", "", expect.any(Object));
    });
  });

  describe("getCurrentUser", () => {
    it("should return user with valid session", async () => {
      const token = "valid-token";
      const userId = "user-1";
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // one day from now

      mockCookieStore.get.mockReturnValue({ value: token } as any);
      vi.mocked(mockPrisma.legacySession.findUnique).mockResolvedValue({
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

      const user = await auth.getCurrentUser();

      expect(user).not.toBeNull();
      expect(user?.email).toBe("test@example.com");
    });

    it("should return null when token", async () => {
      mockCookieStore.get.mockReturnValue(undefined);

      const user = await auth.getCurrentUser();

      expect(user).toBeNull();
      expect(mockPrisma.legacySession.findUnique).not.toHaveBeenCalled();
    });

    it("should return null when non-existent session", async () => {
      const token = "invalid-token";

      mockCookieStore.get.mockReturnValue({ value: token } as any);
      vi.mocked(mockPrisma.legacySession.findUnique).mockResolvedValue(null);

      const user = await auth.getCurrentUser();

      expect(user).toBeNull();
      expect(mockCookieStore.set).toHaveBeenCalledWith("lb_session", "", expect.any(Object));
    });

    it("should return null when expired session", async () => {
      const token = "expired-token";
      const userId = "user-1";
      const expiresAt = new Date(Date.now() - 1000); // in the past

      mockCookieStore.get.mockReturnValue({ value: token } as any);
      vi.mocked(mockPrisma.legacySession.findUnique).mockResolvedValue({
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

      const user = await auth.getCurrentUser();

      expect(user).toBeNull();
      expect(mockPrisma.legacySession.delete).toHaveBeenCalledWith({ where: { token } });
      expect(mockCookieStore.set).toHaveBeenCalledWith("lb_session", "", expect.any(Object));
    });
  });

  describe("requireUser", () => {
    it("should return user when authorized", async () => {
      const token = "valid-token";
      const userId = "user-1";
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);

      mockCookieStore.get.mockReturnValue({ value: token } as any);
      vi.mocked(mockPrisma.legacySession.findUnique).mockResolvedValue({
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

      const user = await auth.requireUser();

      expect(user).not.toBeNull();
      expect(user.email).toBe("test@example.com");
    });

    it("should throw error when unauthorized user", async () => {
      mockCookieStore.get.mockReturnValue(undefined);

      await expect(auth.requireUser()).rejects.toThrow("Unauthorized");
    });
  });
});

