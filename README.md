# AppSeed

[![CI](https://github.com/sofiquldev/AppSeed/actions/workflows/ci.yml/badge.svg)](https://github.com/sofiquldev/AppSeed/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/sofiquldev/AppSeed?display_name=tag)](https://github.com/sofiquldev/AppSeed/releases/latest)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-live-1570ef)](https://sofiquldev.github.io/AppSeed/)

A project composer. You pick a stack, a couple of features, a UI kit. You get a folder that boots.

This is not a React-to-Blade compiler. Each stack keeps its own markup. Themes are CSS variables. Features are per-stack overlays with a manifest.

## What is here

```
cli/                 the composer
stacks/              laravel, nextjs
features/            auth, users
addons/              minio, postgres (compose extras, usually no Dockerfile)
docker/services/     one pack per service: Dockerfile only if we build it
ui/dashboards/       drop a folder, picker picks it up
ui/landings/         same rule
ui/themes/           token JSON
apps/web             picker UI in front of the same merge library
```

## Adding a UI kit

Put a folder here and stop. The picker reads the disk.

```
ui/dashboards/my-dashboard/
  manifest.json
  preview.svg          # or preview.png / screenshot.png
  laravel/             # files copied into a Laravel generate
  nextjs/              # files copied into a Next.js generate
```

```json
{
  "id": "my-dashboard",
  "name": "My Dashboard",
  "kind": "dashboard",
  "description": "Sidebar and a stats row.",
  "preview": "preview.svg"
}
```

Landings go in `ui/landings/<id>/` with the same shape. Themes are `ui/themes/<id>.json` with CSS tokens. If a kit has no `laravel/` folder, it will not show when Laravel is selected.

## Docker: how many files?

Do not make a Dockerfile per combo. Combos explode. Services do not.

| You pick | Dockerfiles we write | Public images |
|---|---|---|
| Laravel | 1 (`docker/laravel/Dockerfile`) | none |
| Next.js | 1 (`docker/nextjs/Dockerfile`) | none |
| Laravel + MinIO + Postgres | 1 | minio, postgres |
| Laravel API + Next.js + MinIO | 2 | minio |

MinIO and Postgres already have images. We only write a Dockerfile for something we build. Compose is merged from `docker/services/<id>/service.json`. A future split app is a list of services, not a new Docker layout. See `presets/laravel-api-nextjs-minio.json`.

## CLI

From the repo root:

```bash
node cli/bin/appseed.js new
```

Or with flags:

```bash
node cli/bin/appseed.js new \
  --stack laravel \
  --features auth,users \
  --addons minio,postgres \
  --dashboard dashboard-01 \
  --landing landing-01 \
  --theme dark \
  --name demo \
  --out ./output/demo
```

`--git` inits a local repo. `--github` creates a GitHub repo and pushes. That needs `GITHUB_TOKEN` (repo scope) or `--token`. `--zip` writes `<name>.zip` next to the project. The picker always offers a zip download after Build, GitHub or not.

```bash
export GITHUB_TOKEN=ghp_...
node cli/bin/appseed.js new --stack nextjs --name demo --github
```

After a successful GitHub run you get the repo URL, a clone command, and the stack’s run instructions.

## Picker UI

```bash
npm install
npm run web
```

Open http://localhost:3000. Same options as the CLI. Build writes to `output/<name>`. Optional GitHub push uses the token field or `GITHUB_TOKEN`.

## After generate

Laravel:

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

Next.js:

```bash
npm install
npm run dev
```

Or `docker compose up` in either project.

Seed login where auth exists: `admin@example.com` / `password`.

## Tests

```bash
npm test
```

## Release

Push a version tag. GitHub Actions runs tests, publishes a zip on the Releases page, and deploys the public site to [GitHub Pages](https://sofiquldev.github.io/AppSeed/).

```bash
git tag v0.1.0
git push origin v0.1.0
```

Or run the **Release** workflow from the Actions tab and type the tag (`v0.1.0`).

The picker (`npm run web`) still runs locally. Pages is the project site, not the generator.

## Later (not now)

Accounts, billing, project history, Stripe / SSLCommerz, and a marketing site wait until someone other than you is generating projects. Do not start those while the CLI still has work.

WordPress, FastAPI, and extra Laravel variants are the same composer with new folders. Add them when the first two stacks are boring.
