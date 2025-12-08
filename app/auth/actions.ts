"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { registerUser, signIn, signOut } from "@/lib/auth";

function getReturnTo(formData: FormData) {
  const rt = String(formData.get("returnTo") || "");
  if (rt.startsWith("/")) return rt;
  return "/dashboard";
}

export async function registerAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  if (!email || !password) {
    throw new Error("Email and password are required");
  }
  const returnTo = getReturnTo(formData);
  await registerUser(email, password);
  await signIn(email, password);
  revalidatePath("/dashboard");
  redirect(returnTo);
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  if (!email || !password) {
    throw new Error("Email and password are required");
  }
  const returnTo = getReturnTo(formData);
  await signIn(email, password);
  revalidatePath("/dashboard");
  redirect(returnTo);
}

export async function logoutAction() {
  await signOut();
  revalidatePath("/");
  redirect("/");
}

