import { NextResponse } from "next/server";
import { githubOAuthConfigured, readGithubSession } from "../../../../lib/github-oauth.js";

export const runtime = "nodejs";

export async function GET(request) {
  const session = readGithubSession(request);
  return NextResponse.json({
    oauth: githubOAuthConfigured(),
    login: session?.login || null,
  });
}
