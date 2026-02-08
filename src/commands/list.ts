import { Command } from "commander";
import { OnePasswordBackend } from "../backends/onepassword";
import { resolve, basename } from "path";

export const listCommand = new Command("list")
  .description("List keys stored in 1Password for this project")
  .option("-e, --env <env>", "filter by environment")
  .option("--all", "list all projects", false)
  .option("--project <name>", "project name (defaults to directory name)")
  .argument("[dir]", "project directory", ".")
  .action(async (dir: string, opts) => {
    const projectRoot = resolve(dir);
    const project = opts.all ? undefined : (opts.project || basename(projectRoot));
    const env = opts.env;

    const backend = new OnePasswordBackend();

    if (!(await backend.isAvailable())) {
      console.error(
        "Error: 1Password CLI (op) not found. Install: brew install --cask 1password-cli"
      );
      process.exit(1);
    }

    const refs = await backend.list(project, env);

    if (refs.length === 0) {
      const scope = opts.all ? "any project" : `${project}${env ? `.${env}` : ""}`;
      console.log(`No keys found for ${scope}.`);
      return;
    }

    // Group by provider
    const grouped = new Map<string, typeof refs>();
    for (const ref of refs) {
      const key = `${ref.provider} (${ref.project}.${ref.env})`;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(ref);
    }

    console.log(`Found ${refs.length} keys:\n`);
    for (const [group, items] of grouped) {
      console.log(`  ${group}`);
      for (const item of items) {
        console.log(`    · ${item.field}`);
      }
    }
  });
