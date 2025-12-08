"use server";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const SESSION_COOKIE = "lb_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

function hashPassword(password: string) {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
}

function verifyPassword(password: string, hash: string) {
  return bcrypt.compareSync(password, hash);
}

export async function registerUser(email: string, password: string) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error("User already exists");
  const passwordHash = hashPassword(password);
  const user = await prisma.user.create({
    data: { email, passwordHash },
  });
  return user;
}

export async function authenticateUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("Invalid credentials");
  if (!verifyPassword(password, user.passwordHash)) {
    throw new Error("Invalid credentials");
  }
  return user;
}

async function createSession(userId: string) {
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000);
  await prisma.session.create({
    data: { token, userId, expiresAt },
  });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_TTL_SECONDS,
    path: "/",
  });
}

export async function signIn(email: string, password: string) {
  const user = await authenticateUser(email, password);
  await createSession(user.id);
  return user;
}

export async function signOut() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { token } });
  }
  cookieStore.set(SESSION_COOKIE, "", { maxAge: 0, path: "/" });
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });
  if (!session) {
    cookieStore.set(SESSION_COOKIE, "", { maxAge: 0, path: "/" });
    return null;
  }
  if (session.expiresAt.getTime() < Date.now()) {
    await prisma.session.delete({ where: { token } });
    cookieStore.set(SESSION_COOKIE, "", { maxAge: 0, path: "/" });
    return null;
  }
  return session.user;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

