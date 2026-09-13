import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

export function smokeCheck(destRoot, stack) {
  const missing = (stack.smoke?.requiredFiles || []).filter(
    (rel) => !fs.existsSync(path.join(destRoot, rel)),
  );
  if (missing.length) {
    throw new Error(`Smoke check failed. Missing files: ${missing.join(", ")}`);
  }

  const command = stack.smoke?.command;
  if (!command) {
    return { ok: true, skippedCommand: true };
  }

  const which = spawnSync("sh", ["-c", `command -v ${command}`], { encoding: "utf8" });
  if (which.status !== 0) {
    return { ok: true, skippedCommand: true, reason: `${command} not installed` };
  }

  const result = spawnSync(command, stack.smoke.args || [], {
    cwd: destRoot,
    encoding: "utf8",
  });

  if (result.status !== 0) {
    throw new Error(
      `Smoke command failed (${command}): ${result.stderr || result.stdout || "unknown error"}`,
    );
  }

  return { ok: true, output: (result.stdout || "").trim() };
}
