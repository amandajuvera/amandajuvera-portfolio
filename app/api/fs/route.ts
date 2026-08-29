import { NextResponse } from "next/server";
import { buildTree } from "@/lib/tree";

// Project rows are editable from /admin, so don't cache the listing.
export const dynamic = "force-dynamic";

export async function GET() {
  const tree = await buildTree();
  return NextResponse.json({
    root: "~/amanda-juvera",
    generated: new Date().toISOString(),
    tree,
  });
}
