import { NextResponse } from "next/server";
import { revalidatePage } from "@/lib/actions";

export async function POST(req: Request) {
  const { editToken } = await req.json();
  if (!editToken) return NextResponse.json({ ok: false }, { status: 400 });
  await revalidatePage(editToken);
  return NextResponse.json({ ok: true });
}

