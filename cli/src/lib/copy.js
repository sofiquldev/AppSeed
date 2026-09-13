import fs from "node:fs";
import path from "node:path";

const SKIP = new Set(["node_modules", "vendor", ".next", "dist", ".git"]);

export function copyDir(src, dest, { overwrite = false, claimed = new Map(), owner = "stack" } = {}) {
  if (!fs.existsSync(src)) {
    throw new Error(`Missing source: ${src}`);
  }

  const copied = [];
  walk(src, "", (rel, from) => {
    const to = path.join(dest, rel);
    if (fs.existsSync(to) && !overwrite) {
      const prev = claimed.get(rel);
      throw new Error(`Conflict on ${rel}${prev ? ` (already written by ${prev})` : ""}.`);
    }
    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.copyFileSync(from, to);
    claimed.set(rel, owner);
    copied.push(rel);
  });
  return copied;
}

function walk(root, rel, visit) {
  const dir = rel ? path.join(root, rel) : root;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue;
    const child = rel ? path.join(rel, entry.name) : entry.name;
    if (entry.isDirectory()) {
      walk(root, child, visit);
    } else if (entry.isFile()) {
      visit(child, path.join(root, child));
    }
  }
}
