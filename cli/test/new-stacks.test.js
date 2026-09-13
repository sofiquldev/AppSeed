import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { generate } from "../src/lib/merge.js";
import { loadCatalog } from "../src/lib/catalog.js";
import { findRoot } from "../src/lib/paths.js";

test("catalog lists html, wp-theme, and wp-plugin", () => {
  const catalog = loadCatalog(findRoot());
  const ids = catalog.stacks.map((item) => item.id);
  assert.ok(ids.includes("html"));
  assert.ok(ids.includes("wp-theme"));
  assert.ok(ids.includes("wp-plugin"));
  assert.ok(catalog.stacks.find((item) => item.id === "html").fits.includes("landing"));
  assert.ok(catalog.stacks.find((item) => item.id === "wp-plugin").fits.includes("plugin"));
});

test("generates an html landing", async () => {
  const out = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "appseed-html-")), "site");
  const result = await generate({
    root: findRoot(),
    stack: "html",
    name: "site",
    landing: "landing-01",
    theme: "dark",
    out,
    force: true,
  });
  assert.equal(result.ok, true);
  assert.ok(fs.existsSync(path.join(out, "index.html")));
  const tokens = fs.readFileSync(path.join(out, "css/tokens.css"), "utf8");
  assert.match(tokens, /--color-bg: #0b1220/);
  assert.deepEqual(result.docker.images, ["html"]);
});

test("generates a wordpress theme", async () => {
  const out = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "appseed-wp-")), "theme");
  const result = await generate({
    root: findRoot(),
    stack: "wp-theme",
    name: "theme",
    landing: "landing-01",
    theme: "brand",
    out,
    force: true,
  });
  assert.equal(result.ok, true);
  assert.ok(fs.existsSync(path.join(out, "style.css")));
  const compose = fs.readFileSync(path.join(out, "docker-compose.yml"), "utf8");
  assert.match(compose, /wordpress:/);
  assert.match(compose, /mysql:/);
});
