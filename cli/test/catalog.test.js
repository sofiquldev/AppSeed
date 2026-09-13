import test from "node:test";
import assert from "node:assert/strict";
import { findUiPreview, loadCatalog, loadUiKit, resolveTheme } from "../src/lib/catalog.js";
import { findRoot } from "../src/lib/paths.js";

test("catalog is scanned from folders, not a static file", () => {
  const catalog = loadCatalog(findRoot());
  assert.ok(catalog.stacks.some((item) => item.id === "laravel"));
  assert.ok(catalog.stacks.some((item) => item.id === "nextjs"));
  assert.ok(catalog.dashboards.some((item) => item.id === "dashboard-01" && item.previewUrl));
  assert.ok(catalog.landings.some((item) => item.id === "landing-01" && item.previewUrl));
  assert.ok(catalog.themes.some((item) => item.id === "dark" && item.tokens["color-bg"]));
  assert.ok(catalog.addons.some((item) => item.id === "minio" && item.group === "storage"));
  assert.ok(catalog.addons.some((item) => item.id === "mysql" && item.group === "database"));
  assert.ok(catalog.addons.some((item) => item.id === "s3" && item.group === "storage"));
  assert.ok(catalog.addons.some((item) => item.id === "wasabi" && item.group === "storage"));
  assert.equal(catalog.addons.find((item) => item.id === "s3").dockerService, null);
  assert.ok(catalog.features.find((item) => item.id === "auth").stacks.includes("laravel"));
});

test("resolveTheme merges custom tokens over light", () => {
  const theme = resolveTheme(
    { theme: "custom", tokens: { "color-accent": "#22c55e" } },
    findRoot(),
  );
  assert.equal(theme.id, "custom");
  assert.equal(theme.tokens["color-accent"], "#22c55e");
  assert.equal(theme.tokens["color-bg"], "#f8fafc");
});

test("ui kits resolve from ui/dashboards and ui/landings", () => {
  const root = findRoot();
  const dash = loadUiKit("dashboard-01", "laravel", root);
  assert.match(dash.stackDir, /ui\/dashboards\/dashboard-01\/laravel$/);
  const preview = findUiPreview("dashboards", "dashboard-01", root);
  assert.match(preview, /preview\.svg$/);
});
