import fs from "node:fs";
import path from "node:path";
import { findRoot, writeJson } from "./paths.js";
import { assertAddonGroups, loadAddon, loadFeature, loadStack, loadUiKit, resolveTheme } from "./catalog.js";
import { copyDir } from "./copy.js";
import { applyPatch } from "./patches.js";
import { writeTokens } from "./tokens.js";
import { writeGettingStarted } from "./getting-started.js";
import { smokeCheck } from "./smoke.js";
import { initLocalRepo } from "./git.js";
import { publishToGithub } from "./github.js";
import { appendEnvSnippet, resolveDockerPlan, writeDockerPlan } from "./docker.js";
import { zipDirectory } from "./zip.js";
import { applyBrand, loadBrand } from "./brand.js";

export async function generate(input) {
  const root = input.root || findRoot();
  const stackId = required(input.stack, "stack");
  const name = sanitizeName(input.name || path.basename(input.out || "appseed-app"));
  const destRoot = path.resolve(input.out || path.join(root, "output", name));
  const features = normalizeList(input.features);
  const addons = normalizeList(input.addons);
  const dashboard = input.dashboard || "dashboard-01";
  const landing = input.landing || "landing-01";
  const themeId = input.tokens ? "custom" : input.theme || "light";

  if (fs.existsSync(destRoot) && fs.readdirSync(destRoot).length && !input.force) {
    throw new Error(`Refusing to write into a non-empty folder: ${destRoot} (pass force: true)`);
  }

  const stack = loadStack(stackId, root);
  const theme = resolveTheme({ theme: themeId, tokens: input.tokens }, root);
  const claimed = new Map();

  fs.mkdirSync(destRoot, { recursive: true });
  copyDir(path.join(stack.dir, stack.skeleton || "skeleton"), destRoot, {
    overwrite: true,
    claimed,
    owner: "stack",
  });

  const dash = loadUiKit(dashboard, stackId, root);
  if (fs.existsSync(dash.stackDir)) {
    copyDir(dash.stackDir, destRoot, { overwrite: true, claimed, owner: `ui:${dashboard}` });
  }

  const land = loadUiKit(landing, stackId, root);
  if (fs.existsSync(land.stackDir)) {
    copyDir(land.stackDir, destRoot, { overwrite: true, claimed, owner: `ui:${landing}` });
  }

  writeTokens(destRoot, theme, stackId);

  const brand = loadBrand(root);

  for (const featureId of features) {
    const feature = loadFeature(featureId, stackId, root);
    const filesDir = path.join(feature.dir, feature.files || "files");
    if (fs.existsSync(filesDir)) {
      copyDir(filesDir, destRoot, { overwrite: false, claimed, owner: `feature:${featureId}` });
    }
    for (const patch of feature.patches || []) {
      applyPatch(destRoot, patch);
    }
  }

  const loadedAddons = addons.map((id) => loadAddon(id, root));
  assertAddonGroups(loadedAddons);
  const envFile = path.join(destRoot, stack.envFile || ".env.example");
  for (const addon of loadedAddons) {
    const snippet = path.join(addon.dir, "env", `${stackId}.env`);
    if (fs.existsSync(snippet)) {
      appendEnvSnippet(envFile, fs.readFileSync(snippet, "utf8"));
    }
  }

  const dockerPlan = resolveDockerPlan({ stack, addons: loadedAddons }, root);
  const docker = writeDockerPlan(destRoot, dockerPlan);

  applyBrand(destRoot, brand);

  writeGettingStarted(destRoot, {
    name,
    stack,
    features,
    addons,
    dashboard,
    landing,
    theme: themeId,
    docker,
    brand,
  });

  writeJson(path.join(destRoot, "appseed.lock.json"), {
    name,
    stack: stackId,
    features,
    addons,
    dashboard,
    landing,
    theme: themeId,
    tokens: themeId === "custom" ? theme.tokens : undefined,
    brand,
    docker,
    generatedAt: new Date().toISOString(),
  });

  const smoke = smokeCheck(destRoot, stack);

  let git = null;
  let github = null;
  if (input.github) {
    github = await publishToGithub({
      destRoot,
      name,
      token: input.token || process.env.GITHUB_TOKEN,
      isPrivate: input.private !== false,
    });
    git = { branch: "main" };
  } else if (input.git) {
    git = initLocalRepo(destRoot);
  }

  let zip = null;
  if (input.zip) {
    const zipPath = path.resolve(
      typeof input.zip === "string" ? input.zip : path.join(path.dirname(destRoot), `${name}.zip`),
    );
    zipDirectory(destRoot, zipPath);
    zip = zipPath;
  }

  const outputDir = path.join(root, "output");
  const underOutput = destRoot === outputDir || destRoot.startsWith(`${outputDir}${path.sep}`);

  return {
    ok: true,
    name,
    dest: destRoot,
    stack: stackId,
    features,
    addons,
    dashboard,
    landing,
    theme: themeId,
    docker,
    smoke,
    git,
    github,
    zip,
    downloadUrl: underOutput ? `/api/download?name=${name}` : null,
    run: {
      install: stack.run?.install || [],
      dev: stack.run?.dev,
      docker: stack.run?.docker,
    },
  };
}

function required(value, label) {
  if (!value) throw new Error(`Missing ${label}`);
  return value;
}

function normalizeList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return String(value)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function sanitizeName(name) {
  const cleaned = String(name)
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!cleaned) throw new Error("Invalid project name");
  return cleaned;
}
