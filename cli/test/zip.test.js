import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { generate } from "../src/lib/merge.js";
import { zipDirectory } from "../src/lib/zip.js";
import { findRoot } from "../src/lib/paths.js";

test("zip contains generated files and skips junk", async () => {
  const root = findRoot();
  const out = fs.mkdtempSync(path.join(os.tmpdir(), "appseed-zip-"));
  const dest = path.join(out, "demo");
  const result = await generate({
    root,
    stack: "nextjs",
    name: "demo",
    out: dest,
    zip: path.join(out, "demo.zip"),
    force: true,
  });

  assert.ok(result.zip);
  assert.ok(fs.existsSync(result.zip));
  assert.equal(result.downloadUrl, null);

  const list = spawnSync("unzip", ["-l", result.zip], { encoding: "utf8" });
  if (list.status === 0) {
    assert.match(list.stdout, /package\.json/);
    assert.match(list.stdout, /GETTING_STARTED\.md/);
    assert.doesNotMatch(list.stdout, /node_modules/);
  } else {
    const raw = zipDirectory(dest);
    assert.ok(raw.length > 100);
    assert.equal(raw.readUInt32LE(0), 0x04034b50);
  }
});
