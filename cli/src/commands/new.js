import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { generate } from "../lib/merge.js";
import { loadCatalog, listAvailableFeatures } from "../lib/catalog.js";
import { findRoot } from "../lib/paths.js";

export async function newProject(flags) {
  const root = findRoot();
  const catalog = loadCatalog(root);
  const answers = Object.keys(flags).length ? flags : await prompt(catalog, root);

  const result = await generate({
    root,
    name: answers.name,
    stack: answers.stack,
    features: answers.features,
    addons: answers.addons,
    dashboard: answers.dashboard,
    landing: answers.landing,
    theme: answers.theme,
    out: answers.out,
    git: Boolean(answers.git),
    github: Boolean(answers.github),
    token: answers.token,
    private: answers.public ? false : true,
    force: Boolean(answers.force),
    zip: answers.zip || false,
  });

  printResult(result);
  return result;
}

async function prompt(catalog, root) {
  const rl = readline.createInterface({ input, output });
  const ask = async (label, fallback) => {
    const hint = fallback ? ` [${fallback}]` : "";
    const value = (await rl.question(`${label}${hint}: `)).trim();
    return value || fallback;
  };

  const stacks = catalog.stacks.map((s) => s.id).join(", ");
  const stack = await ask(`Stack (${stacks})`, catalog.stacks[0].id);
  const available = listAvailableFeatures(stack, root);
  const features = await ask(`Features (${available.join(", ") || "none"})`, available.join(","));
  const addonIds = (catalog.addons || []).map((item) => item.id);
  const addons = await ask(`Addons (${addonIds.join(", ") || "none"}; one database, one storage)`, "");
  const dashboard = await ask("Dashboard", catalog.dashboards[0].id);
  const landing = await ask("Landing", catalog.landings[0].id);
  const theme = await ask("Theme", catalog.themes[0].id);
  const name = await ask("Project name", `appseed-${stack}`);
  rl.close();

  return { stack, features, addons, dashboard, landing, theme, name };
}

function printResult(result) {
  console.log("");
  console.log(`Created ${result.name} at ${result.dest}`);
  console.log(`Stack: ${result.stack}`);
  console.log(`Features: ${result.features.join(", ") || "none"}`);
  console.log(`Addons: ${result.addons.join(", ") || "none"}`);
  console.log(`UI: ${result.dashboard} / ${result.landing} / ${result.theme}`);
  if (result.docker) {
    console.log(`Dockerfiles: ${result.docker.dockerfiles.join(", ") || "none"}`);
    console.log(`Images: ${result.docker.images.join(", ") || "none"}`);
  }
  if (result.smoke.skippedCommand) {
    console.log(`Smoke: files ok (${result.smoke.reason || "command skipped"})`);
  } else {
    console.log(`Smoke: ${result.smoke.output || "ok"}`);
  }
  if (result.zip) {
    console.log(`Zip: ${result.zip}`);
  }
  if (result.github) {
    console.log("");
    console.log(`Repo: ${result.github.url}`);
    console.log(`Clone: ${result.github.clone}`);
  }
  console.log("");
  console.log("Install:");
  for (const cmd of result.run.install) console.log(`  ${cmd}`);
  console.log("Run:");
  console.log(`  ${result.run.dev}`);
  console.log("Docker:");
  console.log(`  ${result.run.docker}`);
}
