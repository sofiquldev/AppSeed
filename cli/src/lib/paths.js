import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));

export function findRoot(start = process.cwd()) {
  if (process.env.APPSEED_ROOT) {
    return path.resolve(process.env.APPSEED_ROOT);
  }

  let dir = path.resolve(start);
  while (true) {
    if (fs.existsSync(path.join(dir, "stacks")) && fs.existsSync(path.join(dir, "cli"))) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }

  const fromPackage = path.resolve(here, "../../..");
  if (fs.existsSync(path.join(fromPackage, "stacks"))) {
    return fromPackage;
  }

  throw new Error("Could not find the AppSeed root (looking for /stacks and /cli).");
}

export function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

export function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}
