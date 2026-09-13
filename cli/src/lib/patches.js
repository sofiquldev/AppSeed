import fs from "node:fs";
import path from "node:path";

export function applyPatch(destRoot, patch) {
  const file = path.join(destRoot, patch.file);
  if (!fs.existsSync(file)) {
    throw new Error(`Patch target missing: ${patch.file}`);
  }

  const original = fs.readFileSync(file, "utf8");
  const next = insertAtMarker(original, patch.marker, patch.insert);
  if (next === original) {
    throw new Error(`Marker <${patch.marker}> not found in ${patch.file}`);
  }
  fs.writeFileSync(file, next);
}

export function insertAtMarker(source, marker, insert) {
  const patterns = [
    [`// <${marker}>`, `// </${marker}>`],
    [`{{-- <${marker}> --}}`, `{{-- </${marker}> --}}`],
    [`{/* <${marker}> */}`, `{/* </${marker}> */}`],
    [`# <${marker}>`, `# </${marker}>`],
  ];

  for (const [open, close] of patterns) {
    const start = source.indexOf(open);
    const end = source.indexOf(close);
    if (start === -1 || end === -1 || end < start) continue;
    const before = source.slice(0, end);
    const after = source.slice(end);
    const needsNl = !before.endsWith("\n");
    return `${before}${needsNl ? "\n" : ""}${insert}${insert.endsWith("\n") ? "" : "\n"}${after}`;
  }

  return source;
}
