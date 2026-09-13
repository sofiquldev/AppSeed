import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { findUiPreview } from "../../../../../../cli/src/lib/catalog.js";
import { findRoot } from "../../../../../../cli/src/lib/paths.js";

export const runtime = "nodejs";

const TYPES = {
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const kind = searchParams.get("kind");
    const id = searchParams.get("id");
    const file = findUiPreview(kind, id, findRoot());
    const type = TYPES[path.extname(file)] || "application/octet-stream";
    return new NextResponse(fs.readFileSync(file), {
      headers: {
        "Content-Type": type,
        "Cache-Control": "public, max-age=60",
      },
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 404 });
  }
}
