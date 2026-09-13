import fs from "node:fs";
import path from "node:path";
import { findRoot } from "../../../cli/src/lib/paths.js";

const SESSION_COOKIE = "appseed_gh";
const STATE_COOKIE = "appseed_gh_state";

function applyEnvFile(file) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith("\"") && value.endsWith("\"")) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined || process.env[key] === "") {
      process.env[key] = value;
    }
  }
}

export function loadGithubEnv() {
  try {
    const root = findRoot();
    applyEnvFile(path.join(root, ".env"));
    applyEnvFile(path.join(root, ".env.local"));
    applyEnvFile(path.join(root, "apps/web/.env"));
    applyEnvFile(path.join(root, "apps/web/.env.local"));
  } catch {
    // keep process.env as-is
  }
}

export function githubOAuthConfigured() {
  loadGithubEnv();
  return Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET);
}

export function githubRedirectUri(request) {
  if (process.env.GITHUB_REDIRECT_URI) return process.env.GITHUB_REDIRECT_URI;
  const url = new URL(request.url);
  return `${url.origin}/api/github/callback`;
}

export function githubCookieOptions(maxAge) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  };
}

export function readGithubSession(request) {
  const raw = request.cookies.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  try {
    const session = JSON.parse(raw);
    if (!session?.token) return null;
    return session;
  } catch {
    return null;
  }
}

export function writeGithubSession(response, { token, login }) {
  response.cookies.set(SESSION_COOKIE, JSON.stringify({ token, login }), githubCookieOptions(15 * 60));
}

export function clearGithubSession(response) {
  response.cookies.set(SESSION_COOKIE, "", githubCookieOptions(0));
  response.cookies.set(STATE_COOKIE, "", githubCookieOptions(0));
}

export function writeGithubState(response, state) {
  response.cookies.set(STATE_COOKIE, state, githubCookieOptions(10 * 60));
}

export function readGithubState(request) {
  return request.cookies.get(STATE_COOKIE)?.value || "";
}

export { SESSION_COOKIE, STATE_COOKIE };
