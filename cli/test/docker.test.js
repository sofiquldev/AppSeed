import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { generate } from "../src/lib/merge.js";
import { loadAddon, loadStack } from "../src/lib/catalog.js";
import { resolveDockerPlan } from "../src/lib/docker.js";
import { findRoot } from "../src/lib/paths.js";

test("laravel + minio + postgres is 1 Dockerfile, 2 images", () => {
  const root = findRoot();
  const plan = resolveDockerPlan({
    stack: loadStack("laravel", root),
    addons: [loadAddon("minio", root), loadAddon("postgres", root)],
  }, root);
  assert.deepEqual(plan.dockerfiles, ["laravel"]);
  assert.deepEqual(plan.images, ["minio", "postgres"]);
});

test("laravel-api + nextjs + minio style combo is 2 Dockerfiles", () => {
  const root = findRoot();
  const laravel = resolveDockerPlan({ stack: loadStack("laravel", root), addons: [] }, root);
  const nextjs = resolveDockerPlan({ stack: loadStack("nextjs", root), addons: [loadAddon("minio", root)] }, root);
  const dockerfiles = [...laravel.dockerfiles, ...nextjs.dockerfiles];
  assert.deepEqual(dockerfiles, ["laravel", "nextjs"]);
});

test("laravel + mysql is 1 Dockerfile and the official mysql image", () => {
  const root = findRoot();
  const plan = resolveDockerPlan({
    stack: loadStack("laravel", root),
    addons: [loadAddon("mysql", root)],
  }, root);
  assert.deepEqual(plan.dockerfiles, ["laravel"]);
  assert.deepEqual(plan.images, ["mysql"]);
});

test("s3 and wasabi add no docker service", () => {
  const root = findRoot();
  const plan = resolveDockerPlan({
    stack: loadStack("laravel", root),
    addons: [loadAddon("s3", root), loadAddon("wasabi", root)],
  }, root);
  assert.deepEqual(plan.images, []);
});

test("generate writes compose and only the Dockerfiles we build", async () => {
  const root = findRoot();
  const out = fs.mkdtempSync(path.join(os.tmpdir(), "appseed-docker-"));
  const result = await generate({
    root,
    stack: "nextjs",
    addons: ["minio", "postgres"],
    name: "docker-demo",
    out,
    force: true,
  });
  assert.deepEqual(result.docker.dockerfiles, ["docker/nextjs/Dockerfile"]);
  assert.deepEqual(result.docker.images, ["minio", "postgres"]);
  assert.ok(fs.existsSync(path.join(out, "docker/nextjs/Dockerfile")));
  assert.equal(fs.existsSync(path.join(out, "docker/minio/Dockerfile")), false);
  const compose = fs.readFileSync(path.join(out, "docker-compose.yml"), "utf8");
  assert.match(compose, /minio:/);
  assert.match(compose, /postgres:/);
  assert.match(compose, /depends_on:/);
  const env = fs.readFileSync(path.join(out, ".env.example"), "utf8");
  assert.match(env, /S3_ENDPOINT/);
  assert.match(env, /DATABASE_URL/);
});
