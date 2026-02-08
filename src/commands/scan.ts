import { Command } from "commander";
import { scan } from "../scanner";
import { resolve } from "path";

export const scanCommand = new Command("scan")
  .description("Scan project for env files and variables")
  .argument("[dir]", "project directory", ".")
  .action(async (dir: string) => {
    const projectRoot = resolve(dir);
    console.log(`Scanning ${projectRoot}...\n`);

    const result = await scan(projectRoot);

    if (result.totalFiles === 0) {
      console.log("No env files found.");
      return;
    }

    console.log(
      `Found ${result.totalVars} variables in ${result.totalFiles} files:\n`
    );

    for (const group of result.groups) {
      for (const file of group.files) {
        const tag = file.isTemplate ? " (template)" : "";
        console.log(
          `  ${file.path}${tag}  → ${file.vars.length} vars`
        );
      }
    }
  });
