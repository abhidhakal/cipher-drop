import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  // Await params in newer Next.js versions if needed, but standard is sync properties in this version of object pattern usually.
  // Actually Next.js 15 might require awaiting params. Let's try to be safe.
  const { id } = await Promise.resolve(params); // Safe wrapper

  const drop = await db.fileDrop.findUnique({
    where: { id },
    select: {
      title: true,
      price: true,
      status: true,
      sender: { select: { email: true } },
      receiverId: true
    }
  });

  if (!drop) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(drop);
}
