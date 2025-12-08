import { NextResponse } from "next/server";
import { startCheckout } from "@/lib/actions";

export async function POST(req: Request) {
  const { editToken } = await req.json();
  if (!editToken) return NextResponse.json({ error: "No token" }, { status: 400 });
  const origin = req.headers.get("origin") || "";
  try {
    const session = await startCheckout(editToken, origin);
    return NextResponse.json(session);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? "Checkout failed" },
      { status: 500 }
    );
  }
}

