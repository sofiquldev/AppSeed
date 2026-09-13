import path from "node:path";
import { NextResponse } from "next/server";
import { generate } from "../../../../../cli/src/lib/merge.js";
import { findRoot } from "../../../../../cli/src/lib/paths.js";
import { clearGithubSession, readGithubSession } from "../../../lib/github-oauth.js";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const body = await request.json();
    const root = findRoot();
    const name = body.name || "appseed-app";
    const session = readGithubSession(request);
    const result = await generate({
      root,
      name,
      stack: body.stack,
      features: body.features || [],
      addons: body.addons || [],
      dashboard: body.dashboard,
      landing: body.landing,
      theme: body.theme,
      tokens: body.tokens,
      out: path.join(root, "output", name),
      github: Boolean(body.github),
      token: body.token || session?.token,
      force: true,
    });
    const response = NextResponse.json(result);
    if (body.github) clearGithubSession(response);
    return response;
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
