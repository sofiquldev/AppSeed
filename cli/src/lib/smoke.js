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

  const env = { ...process.env };
  delete env.NODE_OPTIONS;
  delete env.NODE_INSPECT_RESUME_ON_START;
  delete env.VSCODE_INSPECTOR_OPTIONS;

  const which = spawnSync("sh", ["-c", `command -v ${command}`], { encoding: "utf8", env });
  if (which.status !== 0) {
    return { ok: true, skippedCommand: true, reason: `${command} not installed` };
  }

  const result = spawnSync(command, stack.smoke.args || [], {
    cwd: destRoot,
    encoding: "utf8",
    env,
    timeout: 15000,
  });

  if (result.error?.code === "ETIMEDOUT" || result.signal === "SIGTERM") {
    throw new Error(`Smoke command timed out (${command})`);
  }

  if (result.status !== 0) {
    throw new Error(
      `Smoke command failed (${command}): ${result.stderr || result.stdout || "unknown error"}`,
    );
  }

  return { ok: true, output: (result.stdout || "").trim() };
}
