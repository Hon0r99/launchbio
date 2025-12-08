import { NextResponse } from "next/server";
import { incrementViews } from "@/lib/actions";

export async function POST(req: Request) {
  const { slug } = await req.json();
  if (!slug) return NextResponse.json({ ok: false }, { status: 400 });
  try {
    await incrementViews(slug);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

