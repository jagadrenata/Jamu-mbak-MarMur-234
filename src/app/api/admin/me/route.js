import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/helpers";

export async function GET() {
  const { admin, response } = await requireAdmin();

  if (response) return response;

  return NextResponse.json({ admin });
}