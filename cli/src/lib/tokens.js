import fs from "node:fs";
import path from "node:path";

const TOKEN_FILES = {
  laravel: "resources/css/tokens.css",
  nextjs: "app/tokens.css",
  html: "css/tokens.css",
  "wp-theme": "assets/tokens.css",
  "wp-plugin": "assets/tokens.css",
};

export function writeTokens(destRoot, theme, stackId) {
  const rel = TOKEN_FILES[stackId];
  if (!rel) {
    throw new Error(`No token file mapping for stack ${stackId}`);
  }
  const lines = [":root {"];
  for (const [key, value] of Object.entries(theme.tokens)) {
    lines.push(`  --${key}: ${value};`);
  }
  lines.push("}", "");
  const file = path.join(destRoot, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${lines.join("\n")}\n`);
  return rel;
}
