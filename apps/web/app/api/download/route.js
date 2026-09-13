import path from "node:path";
import fs from "node:fs";
import { NextResponse } from "next/server";
import { findRoot } from "../../../../../cli/src/lib/paths.js";
import { zipDirectory } from "../../../../../cli/src/lib/zip.js";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    const name = new URL(request.url).searchParams.get("name") || "";
    if (!/^[a-z0-9-_]+$/.test(name)) {
      throw new Error("Invalid project name");
    }

    const root = findRoot();
    const outputDir = path.resolve(root, "output");
    const dest = path.resolve(outputDir, name);
    if (!dest.startsWith(`${outputDir}${path.sep}`) || !fs.existsSync(dest)) {
      throw new Error("Generated project not found");
    }

    const body = zipDirectory(dest);
    return new NextResponse(body, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${name}.zip"`,
        "Content-Length": String(body.length),
      },
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 404 });
  }
}
