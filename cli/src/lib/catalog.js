import fs from "node:fs";
import path from "node:path";
import { findRoot, readJson } from "./paths.js";
import { loadBrand } from "./brand.js";

const PREVIEW_NAMES = ["preview.svg", "preview.png", "preview.jpg", "preview.webp", "screenshot.png"];

export function loadCatalog(root = findRoot()) {
  return {
    stacks: listStacks(root),
    features: listFeatures(root),
    dashboards: listUiKits(root, "dashboards"),
    landings: listUiKits(root, "landings"),
    themes: listThemes(root),
    addons: listAddons(root),
    brand: loadBrand(root),
  };
}

export function listStacks(root = findRoot()) {
  return readChildManifests(path.join(root, "stacks")).map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description || "",
    dockerService: item.dockerService || item.id,
    fits: item.fits || ["landing", "dashboard", "both"],
    hasAuth: item.hasAuth !== false,
    showAddons: item.showAddons !== false,
  }));
}

export function listFeatures(root = findRoot()) {
  const dir = path.join(root, "features");
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const featureDir = path.join(dir, entry.name);
      const stacks = fs.readdirSync(featureDir, { withFileTypes: true })
        .filter((child) => child.isDirectory() && fs.existsSync(path.join(featureDir, child.name, "manifest.json")))
        .map((child) => child.name);
      const first = stacks[0] ? readJson(path.join(featureDir, stacks[0], "manifest.json")) : { id: entry.name };
      return {
        id: first.id || entry.name,
        name: first.name || entry.name,
        description: first.description || "",
        stacks,
      };
    })
    .filter((item) => item.stacks.length);
}

export function listUiKits(root, kind) {
  const dir = path.join(root, "ui", kind);
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(dir, entry.name, "manifest.json")))
    .map((entry) => {
      const kitDir = path.join(dir, entry.name);
      const manifest = readJson(path.join(kitDir, "manifest.json"));
      const preview = findPreviewFile(kitDir, manifest.preview);
      const stacks = fs.readdirSync(kitDir, { withFileTypes: true })
        .filter((child) => child.isDirectory())
        .map((child) => child.name);
      return {
        id: manifest.id || entry.name,
        name: manifest.name || entry.name,
        kind: manifest.kind || kind.replace(/s$/, ""),
        description: manifest.description || "",
        stacks,
        preview: preview ? path.basename(preview) : null,
        previewUrl: preview ? `/api/ui/preview?kind=${kind}&id=${manifest.id || entry.name}` : null,
      };
    });
}

export function listThemes(root = findRoot()) {
  const dir = path.join(root, "ui", "themes");
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((name) => name.endsWith(".json"))
    .map((name) => {
      const theme = readJson(path.join(dir, name));
      return {
        id: theme.id || name.replace(/\.json$/, ""),
        name: theme.name || theme.id,
        tokens: theme.tokens || {},
      };
    });
}

export function listAddons(root = findRoot()) {
  return readChildManifests(path.join(root, "addons"))
    .map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description || "",
      group: item.group || null,
      order: item.order ?? 99,
      dockerService: item.dockerService || null,
    }))
    .sort((a, b) => (a.order - b.order) || a.name.localeCompare(b.name));
}

export function loadStack(stackId, root = findRoot()) {
  const file = path.join(root, "stacks", stackId, "manifest.json");
  if (!fs.existsSync(file)) {
    throw new Error(`Unknown stack: ${stackId}`);
  }
  return { ...readJson(file), dir: path.join(root, "stacks", stackId) };
}

export function loadFeature(featureId, stackId, root = findRoot()) {
  const dir = path.join(root, "features", featureId, stackId);
  const file = path.join(dir, "manifest.json");
  if (!fs.existsSync(file)) {
    throw new Error(`Feature "${featureId}" is not available for stack "${stackId}".`);
  }
  return { ...readJson(file), dir };
}

export function loadAddon(addonId, root = findRoot()) {
  const dir = path.join(root, "addons", addonId);
  const file = path.join(dir, "manifest.json");
  if (!fs.existsSync(file)) {
    throw new Error(`Unknown addon: ${addonId}`);
  }
  return { ...readJson(file), dir };
}

export function assertAddonGroups(addons) {
  const seen = new Map();
  for (const addon of addons) {
    const group = addon.group;
    if (!group) continue;
    if (seen.has(group)) {
      throw new Error(`Pick one ${group} option, not both ${seen.get(group)} and ${addon.id}.`);
    }
    seen.set(group, addon.id);
  }
}

export function loadTheme(themeId, root = findRoot()) {
  const file = path.join(root, "ui", "themes", `${themeId}.json`);
  if (!fs.existsSync(file)) {
    throw new Error(`Unknown theme: ${themeId}`);
  }
  return readJson(file);
}

export function resolveTheme({ theme, tokens } = {}, root = findRoot()) {
  const base = loadTheme("light", root);
  if (tokens && typeof tokens === "object" && Object.keys(tokens).length) {
    return {
      id: "custom",
      name: "Custom",
      tokens: { ...base.tokens, ...tokens },
    };
  }
  if (theme && theme !== "custom") {
    return loadTheme(theme, root);
  }
  return base;
}

export function loadUiKit(kitId, stackId, root = findRoot()) {
  const dir = findUiKitDir(kitId, root);
  const stackDir = path.join(dir, stackId);
  return { ...readJson(path.join(dir, "manifest.json")), dir, stackDir };
}

export function findUiPreview(kind, kitId, root = findRoot()) {
  const allowed = new Set(["dashboards", "landings"]);
  if (!allowed.has(kind) || !/^[a-z0-9-]+$/.test(kitId)) {
    throw new Error("Invalid preview request");
  }
  const dir = path.join(root, "ui", kind, kitId);
  if (!fs.existsSync(path.join(dir, "manifest.json"))) {
    throw new Error(`Unknown UI kit: ${kitId}`);
  }
  const manifest = readJson(path.join(dir, "manifest.json"));
  const preview = findPreviewFile(dir, manifest.preview);
  if (!preview) {
    throw new Error(`No preview for ${kitId}`);
  }
  return preview;
}

export function listAvailableFeatures(stackId, root = findRoot()) {
  return listFeatures(root)
    .filter((item) => item.stacks.includes(stackId))
    .map((item) => item.id);
}

function findUiKitDir(kitId, root) {
  const candidates = [
    path.join(root, "ui", "dashboards", kitId),
    path.join(root, "ui", "landings", kitId),
    path.join(root, "ui", kitId),
  ];
  for (const dir of candidates) {
    if (fs.existsSync(path.join(dir, "manifest.json"))) return dir;
  }
  throw new Error(`Unknown UI kit: ${kitId}`);
}

function findPreviewFile(dir, named) {
  const names = named ? [named, ...PREVIEW_NAMES] : PREVIEW_NAMES;
  for (const name of names) {
    const file = path.join(dir, name);
    if (fs.existsSync(file) && file.startsWith(dir)) return file;
  }
  return null;
}

function readChildManifests(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(dir, entry.name, "manifest.json")))
    .map((entry) => readJson(path.join(dir, entry.name, "manifest.json")));
}
