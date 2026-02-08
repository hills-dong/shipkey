import { readdir, readFile } from "fs/promises";
import { join, relative, dirname } from "path";
import { parseDotenv } from "./parsers/dotenv";
import type { ScanResult, SubProjectGroup, ScannedFile, EnvVar } from "./types";

const ENV_PATTERNS = [
  /^\.env$/,
  /^\.env\..+$/, // .env.local, .env.example, etc.
  /^\.dev\.vars$/,
  /^\.dev\.vars\..+$/, // .dev.vars.example
];

const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
  ".turbo",
  ".cache",
]);

function isEnvFile(filename: string): boolean {
  return ENV_PATTERNS.some((p) => p.test(filename));
}

function isTemplate(filename: string): boolean {
  return filename.includes(".example") || filename.includes(".template");
}

async function walkDir(
  dir: string,
  rootDir: string,
  files: { path: string; fullPath: string }[]
): Promise<void> {
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      await walkDir(join(dir, entry.name), rootDir, files);
    } else if (isEnvFile(entry.name)) {
      const fullPath = join(dir, entry.name);
      files.push({
        path: relative(rootDir, fullPath),
        fullPath,
      });
    }
  }
}

export async function scan(projectRoot: string): Promise<ScanResult> {
  const foundFiles: { path: string; fullPath: string }[] = [];
  await walkDir(projectRoot, projectRoot, foundFiles);

  const groupMap = new Map<string, ScannedFile[]>();

  for (const file of foundFiles) {
    const content = await readFile(file.fullPath, "utf-8");
    const parsed = parseDotenv(content);
    const template = isTemplate(file.path);

    const vars: EnvVar[] = parsed.map((v) => ({
      key: v.key,
      value: template ? undefined : v.value,
      source: file.path,
      isTemplate: template,
    }));

    const groupKey = dirname(file.path) === "." ? "." : dirname(file.path);

    if (!groupMap.has(groupKey)) {
      groupMap.set(groupKey, []);
    }

    groupMap.get(groupKey)!.push({
      path: file.path,
      isTemplate: template,
      vars,
    });
  }

  const groups: SubProjectGroup[] = Array.from(groupMap.entries()).map(
    ([path, files]) => ({ path, files })
  );

  const totalFiles = foundFiles.length;
  const totalVars = groups.reduce(
    (sum, g) => sum + g.files.reduce((s, f) => s + f.vars.length, 0),
    0
  );

  return { projectRoot, groups, totalVars, totalFiles };
}
