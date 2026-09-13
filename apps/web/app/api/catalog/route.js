import { NextResponse } from "next/server";
import { loadCatalog } from "../../../../../cli/src/lib/catalog.js";
import { findRoot } from "../../../../../cli/src/lib/paths.js";

export const runtime = "nodejs";

export async function GET() {
  try {
    return NextResponse.json(loadCatalog(findRoot()));
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
