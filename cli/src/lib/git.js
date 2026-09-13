import { spawnSync } from "node:child_process";

function git(args, cwd, extraEnv = {}) {
  const result = spawnSync("git", args, {
    cwd,
    encoding: "utf8",
    env: { ...process.env, ...extraEnv },
  });
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || `git ${args.join(" ")} failed`);
  }
  return (result.stdout || "").trim();
}

export function initLocalRepo(cwd) {
  git(["init"], cwd);
  git(["add", "-A"], cwd);
  git(
    ["-c", "user.name=AppSeed", "-c", "user.email=appseed@local", "commit", "-m", "Initial commit from AppSeed"],
    cwd,
  );
  git(["branch", "-M", "main"], cwd);
  return { branch: "main" };
}

export function addRemoteAndPush(cwd, remoteUrl) {
  git(["remote", "add", "origin", remoteUrl], cwd);
  git(["push", "-u", "origin", "main"], cwd);
}
