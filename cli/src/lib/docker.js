import fs from "node:fs";
import path from "node:path";
import { readJson } from "./paths.js";

export function loadDockerService(serviceId, root) {
  const dir = path.join(root, "docker", "services", serviceId);
  const manifestFile = path.join(dir, "manifest.json");
  if (!fs.existsSync(manifestFile)) {
    throw new Error(`Unknown docker service: ${serviceId}`);
  }
  const dockerfile = path.join(dir, "Dockerfile");
  return {
    ...readJson(manifestFile),
    dir,
    service: readJson(path.join(dir, "service.json")),
    hasDockerfile: fs.existsSync(dockerfile),
    dockerfile: fs.existsSync(dockerfile) ? dockerfile : null,
  };
}

export function resolveDockerPlan({ stack, addons = [] }, root) {
  const ids = [];
  const fromStack = stack?.dockerServices || (stack?.dockerService ? [stack.dockerService] : []);
  for (const id of fromStack) {
    if (!ids.includes(id)) ids.push(id);
  }
  for (const addon of addons) {
    if (addon.dockerService && !ids.includes(addon.dockerService)) {
      ids.push(addon.dockerService);
    }
  }

  const services = ids.map((id) => loadDockerService(id, root));
  const appServices = services.filter((item) => item.kind === "app");
  const extraIds = services.filter((item) => item.kind !== "app").map((item) => item.service.name);

  for (const item of appServices) {
    if (extraIds.length) {
      item.service.depends_on = unique([...(item.service.depends_on || []), ...extraIds]);
    }
  }

  return {
    services,
    dockerfiles: services.filter((item) => item.hasDockerfile).map((item) => item.id),
    images: services.filter((item) => !item.hasDockerfile).map((item) => item.id),
  };
}

export function writeDockerPlan(destRoot, plan) {
  const composeServices = {};
  const volumes = {};

  for (const item of plan.services) {
    const spec = { ...item.service };
    const name = spec.name;
    delete spec.name;

    if (item.hasDockerfile) {
      const rel = path.join("docker", item.id);
      fs.mkdirSync(path.join(destRoot, rel), { recursive: true });
      fs.copyFileSync(item.dockerfile, path.join(destRoot, rel, "Dockerfile"));
      spec.build = spec.build || {
        context: ".",
        dockerfile: `${rel}/Dockerfile`,
      };
    }

    for (const volume of spec.volumes || []) {
      const named = volume.split(":")[0];
      if (named && !named.startsWith(".") && !named.startsWith("/") && !named.includes("\\")) {
        volumes[named] = {};
      }
    }

    composeServices[name] = spec;
  }

  const yaml = emitCompose({ services: composeServices, volumes });
  fs.writeFileSync(path.join(destRoot, "docker-compose.yml"), yaml);

  return {
    compose: "docker-compose.yml",
    dockerfiles: plan.dockerfiles.map((id) => `docker/${id}/Dockerfile`),
    images: plan.images,
  };
}

function unique(list) {
  return [...new Set(list)];
}

function emitCompose({ services, volumes }) {
  const lines = ["services:"];
  for (const [name, spec] of Object.entries(services)) {
    lines.push(`  ${name}:`);
    if (spec.build) {
      lines.push("    build:");
      lines.push(`      context: ${yamlValue(spec.build.context)}`);
      lines.push(`      dockerfile: ${yamlValue(spec.build.dockerfile)}`);
    }
    if (spec.image) lines.push(`    image: ${yamlValue(spec.image)}`);
    if (spec.working_dir) lines.push(`    working_dir: ${yamlValue(spec.working_dir)}`);
    if (spec.command) lines.push(`    command: ${yamlValue(spec.command)}`);
    writeMap(lines, "environment", spec.environment);
    writeList(lines, "ports", spec.ports);
    writeList(lines, "volumes", spec.volumes);
    writeList(lines, "depends_on", spec.depends_on);
  }

  const volumeNames = Object.keys(volumes);
  if (volumeNames.length) {
    lines.push("volumes:");
    for (const name of volumeNames) {
      lines.push(`  ${name}:`);
    }
  }

  return `${lines.join("\n")}\n`;
}

function writeList(lines, key, values) {
  if (!values || !values.length) return;
  lines.push(`    ${key}:`);
  for (const value of values) {
    lines.push(`      - ${yamlValue(value)}`);
  }
}

function writeMap(lines, key, values) {
  if (!values || !Object.keys(values).length) return;
  lines.push(`    ${key}:`);
  for (const [name, value] of Object.entries(values)) {
    lines.push(`      ${name}: ${yamlValue(value)}`);
  }
}

function yamlValue(value) {
  const text = String(value);
  if (/[:#{}[\],&*?|<>=!%@`]/.test(text) || text.includes(" ")) {
    return JSON.stringify(text);
  }
  return text;
}

export function appendEnvSnippet(destFile, snippet) {
  if (!snippet || !fs.existsSync(destFile)) return;
  const current = fs.readFileSync(destFile, "utf8");
  const updates = snippet
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => ({ key: line.slice(0, line.indexOf("=")), line }));
  if (!updates.length) return;

  let next = current.replace(/\r\n/g, "\n");
  const missing = [];
  for (const { key, line } of updates) {
    const re = new RegExp(`^${escapeRegExp(key)}=.*$`, "m");
    if (re.test(next)) {
      next = next.replace(re, line);
    } else {
      missing.push(line);
    }
  }
  if (missing.length) {
    const sep = next.endsWith("\n") ? "\n" : "\n\n";
    next = `${next}${sep}${missing.join("\n")}\n`;
  }
  if (!next.endsWith("\n")) next += "\n";
  fs.writeFileSync(destFile, next);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
