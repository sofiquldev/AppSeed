import test from "node:test";
import assert from "node:assert/strict";
import { insertAtMarker } from "../src/lib/patches.js";

test("inserts into a js marker block", () => {
  const src = `const x = 1;\n// <appseed:routes>\n// </appseed:routes>\n`;
  const out = insertAtMarker(src, "appseed:routes", "route('/users');\n");
  assert.match(out, /route\('\/users'\)/);
  assert.match(out, /\/\/ <appseed:routes>/);
  assert.match(out, /\/\/ <\/appseed:routes>/);
});

test("inserts into a blade marker block", () => {
  const src = `{{-- <appseed:nav> --}}\n{{-- </appseed:nav> --}}\n`;
  const out = insertAtMarker(src, "appseed:nav", `<a href="/users">Users</a>\n`);
  assert.match(out, /href="\/users"/);
});

test("leaves source alone when marker is missing", () => {
  const src = "hello";
  assert.equal(insertAtMarker(src, "nope", "x"), "hello");
});
