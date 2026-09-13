import test from "node:test";
import assert from "node:assert/strict";
import { publishToGithub } from "../src/lib/github.js";

test("github publish refuses to run without a token", async () => {
  await assert.rejects(
    () => publishToGithub({ destRoot: "/tmp/nope", name: "demo", token: "" }),
    /GITHUB_TOKEN/,
  );
});
