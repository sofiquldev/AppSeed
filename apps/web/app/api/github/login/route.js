import { NextResponse } from "next/server";
import {
  githubOAuthConfigured,
  githubRedirectUri,
  writeGithubState,
} from "../../../../lib/github-oauth.js";

export const runtime = "nodejs";

export async function GET(request) {
  if (!githubOAuthConfigured()) {
    const home = new URL("/", request.url);
    home.searchParams.set("github", "setup");
    return NextResponse.redirect(home);
  }

  const state = crypto.randomUUID();
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID,
    redirect_uri: githubRedirectUri(request),
    scope: "repo",
    state,
  });
  const response = NextResponse.redirect(`https://github.com/login/oauth/authorize?${params}`);
  writeGithubState(response, state);
  return response;
}
