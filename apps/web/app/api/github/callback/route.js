import { NextResponse } from "next/server";
import {
  clearGithubSession,
  githubCookieOptions,
  githubOAuthConfigured,
  githubRedirectUri,
  readGithubState,
  STATE_COOKIE,
  writeGithubSession,
} from "../../../../lib/github-oauth.js";

export const runtime = "nodejs";

export async function GET(request) {
  const url = new URL(request.url);
  const home = new URL("/", url.origin);
  const fail = (reason) => {
    home.searchParams.set("github", "error");
    if (reason) home.searchParams.set("reason", reason);
    const response = NextResponse.redirect(home);
    clearGithubSession(response);
    return response;
  };

  if (!githubOAuthConfigured()) return fail("oauth-disabled");

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state") || "";
  if (!code || state !== readGithubState(request)) return fail("denied");

  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: githubRedirectUri(request),
    }),
  });
  const tokenData = await tokenRes.json().catch(() => ({}));
  if (!tokenData.access_token) return fail("token");

  const userRes = await fetch("https://api.github.com/user", {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${tokenData.access_token}`,
      "User-Agent": "appseed",
    },
  });
  const user = await userRes.json().catch(() => ({}));
  if (!user.login) return fail("user");

  home.searchParams.set("github", "1");
  const response = NextResponse.redirect(home);
  response.cookies.set(STATE_COOKIE, "", githubCookieOptions(0));
  writeGithubSession(response, { token: tokenData.access_token, login: user.login });
  return response;
}
