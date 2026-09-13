import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { generate } from "../src/lib/merge.js";
import { findRoot } from "../src/lib/paths.js";

function tmp() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "appseed-"));
}

test("generates laravel with auth and users twice", async () => {
  const root = findRoot();
  for (const i of [1, 2]) {
    const out = path.join(tmp(), `demo-${i}`);
    const result = await generate({
      root,
      stack: "laravel",
      features: ["auth", "users"],
      dashboard: "dashboard-01",
      landing: "landing-01",
      theme: "dark",
      name: `demo-${i}`,
      out,
    });
    assert.equal(result.ok, true);
    assert.ok(fs.existsSync(path.join(out, "artisan")));
    assert.ok(fs.existsSync(path.join(out, "GETTING_STARTED.md")));
    assert.ok(fs.existsSync(path.join(out, "app/Http/Controllers/UserController.php")));
    assert.ok(fs.existsSync(path.join(out, "resources/views/auth/forgot-password.blade.php")));
    const routes = fs.readFileSync(path.join(out, "routes/web.php"), "utf8");
    assert.match(routes, /users\.index/);
    const tokens = fs.readFileSync(path.join(out, "resources/css/tokens.css"), "utf8");
    assert.match(tokens, /--color-bg: #0b1220/);
    const lock = JSON.parse(fs.readFileSync(path.join(out, "appseed.lock.json"), "utf8"));
    assert.equal(lock.stack, "laravel");
    assert.deepEqual(lock.features, ["auth", "users"]);
  }
});

test("generates nextjs with auth and users", async () => {
  const root = findRoot();
  const out = path.join(tmp(), "next-demo");
  const result = await generate({
    root,
    stack: "nextjs",
    features: ["auth", "users"],
    dashboard: "dashboard-01",
    landing: "landing-01",
    theme: "brand",
    name: "next-demo",
    out,
  });
  assert.equal(result.ok, true);
  assert.ok(fs.existsSync(path.join(out, "app/login/page.js")));
  assert.ok(fs.existsSync(path.join(out, "app/users/page.js")));
  const nav = fs.readFileSync(path.join(out, "components/AppShell.js"), "utf8");
  assert.match(nav, /href="\/users"/);
  const landing = fs.readFileSync(path.join(out, "components/LandingShell.js"), "utf8");
  assert.match(landing, /href="\/login"/);
  const tokens = fs.readFileSync(path.join(out, "app/tokens.css"), "utf8");
  assert.match(tokens, /--color-accent: #ea580c/);
});

test("generates html with custom tokens", async () => {
  const root = findRoot();
  const out = path.join(tmp(), "custom-html");
  const result = await generate({
    root,
    stack: "html",
    name: "custom-html",
    landing: "landing-01",
    theme: "custom",
    tokens: {
      "color-bg": "#111827",
      "color-text": "#f9fafb",
      "color-accent": "#22c55e",
    },
    out,
  });
  assert.equal(result.ok, true);
  assert.equal(result.theme, "custom");
  const tokens = fs.readFileSync(path.join(out, "css/tokens.css"), "utf8");
  assert.match(tokens, /--color-bg: #111827/);
  assert.match(tokens, /--color-accent: #22c55e/);
  const lock = JSON.parse(fs.readFileSync(path.join(out, "appseed.lock.json"), "utf8"));
  assert.equal(lock.theme, "custom");
  assert.equal(lock.tokens["color-accent"], "#22c55e");
});

test("laravel mysql replaces sqlite and refuses two databases", async () => {
  const root = findRoot();
  const out = path.join(tmp(), "mysql-demo");
  const result = await generate({
    root,
    stack: "laravel",
    addons: ["mysql"],
    name: "mysql-demo",
    out,
  });
  assert.equal(result.ok, true);
  const env = fs.readFileSync(path.join(out, ".env.example"), "utf8");
  assert.match(env, /DB_CONNECTION=mysql/);
  assert.equal((env.match(/^DB_CONNECTION=/gm) || []).length, 1);
  const compose = fs.readFileSync(path.join(out, "docker-compose.yml"), "utf8");
  assert.match(compose, /mysql:/);

  await assert.rejects(
    () => generate({
      root,
      stack: "laravel",
      addons: ["postgres", "mysql"],
      name: "two-db",
      out: path.join(tmp(), "two-db"),
    }),
    /database/,
  );
});

test("laravel s3 writes bucket env and no extra image", async () => {
  const root = findRoot();
  const out = path.join(tmp(), "s3-demo");
  const result = await generate({
    root,
    stack: "laravel",
    addons: ["s3"],
    name: "s3-demo",
    out,
  });
  assert.equal(result.ok, true);
  const env = fs.readFileSync(path.join(out, ".env.example"), "utf8");
  assert.match(env, /FILESYSTEM_DISK=s3/);
  assert.equal((env.match(/^FILESYSTEM_DISK=/gm) || []).length, 1);
  assert.doesNotMatch(env, /AWS_ENDPOINT=/);
  assert.deepEqual(result.docker.images, []);
});

test("fails loud on an unknown stack", async () => {
  await assert.rejects(
    () => generate({ stack: "wordpress", out: path.join(tmp(), "nope") }),
    /Unknown stack/,
  );
});
