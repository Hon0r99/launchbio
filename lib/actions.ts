"use server";

import { revalidatePath } from "next/cache";
import Stripe from "stripe";
import { prisma } from "./prisma";
import { createSlugFromTitle } from "./slug";
import { pageSchema } from "./validation";
import { getCurrentUser } from "./auth";

function toDateTime(date: string, time: string) {
  const iso = `${date}T${time}:00Z`;
  return new Date(iso);
}

export async function createPageAction(formData: FormData) {
  const user = await getCurrentUser();
  const parsed = pageSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") ?? undefined,
    eventDate: formData.get("eventDate"),
    eventTime: formData.get("eventTime"),
    bgType: formData.get("bgType"),
    buttons: JSON.parse(String(formData.get("buttons") || "[]")),
    ownerEmail: formData.get("ownerEmail") ?? undefined,
    afterLaunchText: formData.get("afterLaunchText") ?? undefined,
    analyticsId: formData.get("analyticsId") ?? undefined,
    showBranding: formData.get("showBranding") === "true",
  });

  if (!parsed.success) {
    throw new Error("Invalid data");
  }

  const { title, description, eventDate, eventTime, bgType, buttons, ownerEmail } =
    parsed.data;
  const eventDateTime = toDateTime(eventDate, eventTime);
  const slug = createSlugFromTitle(title);
  const editToken = crypto.randomUUID();

  const page = await prisma.page.create({
    data: {
      title,
      description,
      slug,
      editToken,
      eventDateTime,
      bgType,
      buttons: JSON.stringify(buttons),
      ownerEmail: ownerEmail || null,
      ownerId: user?.id,
    },
  });

  revalidatePath("/");
  return { slug: page.slug, editToken: page.editToken };
}

export async function updatePageAction(editToken: string, payload: FormData) {
  const parsed = pageSchema.safeParse({
    title: payload.get("title"),
    description: payload.get("description") ?? undefined,
    eventDate: payload.get("eventDate"),
    eventTime: payload.get("eventTime"),
    bgType: payload.get("bgType"),
    buttons: JSON.parse(String(payload.get("buttons") || "[]")),
    ownerEmail: payload.get("ownerEmail") ?? undefined,
    afterLaunchText: payload.get("afterLaunchText") ?? undefined,
    analyticsId: payload.get("analyticsId") ?? undefined,
    showBranding: payload.get("showBranding") === "true",
  });
  if (!parsed.success) {
    throw new Error("Invalid data");
  }

  const { title, description, eventDate, eventTime, bgType, buttons, ownerEmail } =
    parsed.data;
  const eventDateTime = toDateTime(eventDate, eventTime);

  const page = await prisma.page.update({
    where: { editToken },
    data: {
      title,
      description,
      eventDateTime,
      bgType,
      buttons: JSON.stringify(buttons),
      ownerEmail: ownerEmail || null,
      afterLaunchText: parsed.data.afterLaunchText || null,
      analyticsId: parsed.data.analyticsId || null,
      showBranding:
        parsed.data.showBranding === undefined ? undefined : parsed.data.showBranding,
    },
  });

  revalidatePath(`/u/${page.slug}`);
  revalidatePath(`/edit/${editToken}`);
  return page;
}

export async function incrementViews(slug: string) {
  await prisma.page.update({
    where: { slug },
    data: { views: { increment: 1 } },
  });
}

export async function markPro(editToken: string, opts?: { revalidate?: boolean }) {
  const page = await prisma.page.update({
    where: { editToken },
    data: { isPro: true, showBranding: false },
  });

  if (opts?.revalidate !== false) {
    revalidatePath(`/u/${page.slug}`);
    revalidatePath(`/edit/${editToken}`);
  }

  return page;
}

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key, {
    apiVersion: "2024-12-18.acacia",
  });
}

export async function startCheckout(editToken: string, origin: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Sign in to upgrade to Pro");

  const stripe = getStripe();
  if (!stripe) throw new Error("Stripe is not configured");

  const page = await prisma.page.findUnique({ where: { editToken } });
  if (!page) throw new Error("Page not found");

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: 900,
          product_data: { name: "Launch Pack (one-time)" },
        },
      },
    ],
    metadata: { editToken },
    success_url: `${origin}/edit/success?editToken=${editToken}`,
    cancel_url: `${origin}/edit/${editToken}`,
  });

  return { url: session.url };
}

export async function markProFromSuccess(editToken: string, opts?: { revalidate?: boolean }) {
  const page = await prisma.page.findUnique({ where: { editToken } });
  if (!page) return null;
  if (page.isPro) return page;
  return markPro(editToken, opts);
}

export async function revalidatePage(editToken: string) {
  const page = await prisma.page.findUnique({ where: { editToken } });
  if (!page) return;
  revalidatePath(`/u/${page.slug}`);
  revalidatePath(`/edit/${editToken}`);
}

