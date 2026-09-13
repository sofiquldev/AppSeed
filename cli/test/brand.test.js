import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { generate } from "../src/lib/merge.js";
import { findRoot } from "../src/lib/paths.js";

test("generated html carries the brand footprint from config", async () => {
  const out = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "appseed-brand-")), "site");
  const result = await generate({
    root: findRoot(),
    stack: "html",
    name: "site",
    landing: "landing-01",
    theme: "light",
    out,
    force: true,
  });
  assert.equal(result.ok, true);
  const html = fs.readFileSync(path.join(out, "index.html"), "utf8");
  assert.match(html, /Built with AppSeed/);
  assert.match(html, /https:\/\/appseed\.dev/);
  assert.doesNotMatch(html, /{{APPSEED_/);
  const lock = JSON.parse(fs.readFileSync(path.join(out, "appseed.lock.json"), "utf8"));
  assert.equal(lock.brand.name, "AppSeed");
});
