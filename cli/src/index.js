import { newProject } from "./commands/new.js";
import { loadCatalog } from "./lib/catalog.js";
import { findRoot } from "./lib/paths.js";

export { generate } from "./lib/merge.js";
export { loadCatalog, loadStack, loadFeature, loadTheme } from "./lib/catalog.js";

export async function run(argv) {
  const [command, ...rest] = argv;
  const flags = parseFlags(rest);

  if (!command || command === "help" || flags.help) {
    printHelp();
    return;
  }

  if (command === "stacks" || command === "list") {
    const catalog = loadCatalog(findRoot());
    for (const stack of catalog.stacks) {
      console.log(`${stack.id}\t${stack.name}`);
    }
    return;
  }

  if (command === "new") {
    return newProject(flags);
  }

  throw new Error(`Unknown command: ${command}. Try \`appseed help\`.`);
}

function parseFlags(args) {
  const flags = {};
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (!arg.startsWith("--")) continue;
    const key = arg.slice(2);
    const next = args[i + 1];
    if (!next || next.startsWith("--")) {
      flags[key] = true;
    } else {
      flags[key] = next;
      i += 1;
    }
  }
  return flags;
}

function printHelp() {
  console.log(`appseed — compose a project from a stack, features, and a UI kit

Usage:
  appseed new
  appseed new --stack laravel --features auth,users --addons mysql,s3 --theme dark --name demo
  appseed new --stack nextjs --out ./output/demo --git
  appseed new --stack laravel --github --token $GITHUB_TOKEN
  appseed stacks

Flags:
  --stack --features --addons --dashboard --landing --theme
  --name --out --git --github --zip --token --public --force
`);
}
