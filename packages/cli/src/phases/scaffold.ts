import { existsSync, readdirSync, renameSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { isCancel, log, spinner, text } from "@clack/prompts";
import { downloadTemplate } from "giget";

import { exec } from "../lib/helpers";
import { isValidAppName, toKebabCase } from "../lib/validators";

const TEMPLATE_URI = "gh:CarlosZiegler/start-kit.dev/apps/start-template#main";

/**
 * On Windows, giget's tar extraction with subdirectory templates can produce
 * paths with a leading "/" (e.g. "/package.json") after stripping the subdir
 * prefix. node-tar on Unix strips leading slashes, but on Windows this can
 * cause files to be extracted to the drive root instead of the target directory.
 *
 * As a workaround, if package.json is missing after extraction, we check for a
 * nested subdir structure and move files up.
 */
function fixExtraction(targetDir: string): void {
  if (existsSync(join(targetDir, "package.json"))) return;

  // Check for nested extraction: targetDir/apps/start-template/package.json
  const nested = join(targetDir, "apps", "start-template");
  if (existsSync(join(nested, "package.json"))) {
    const tempDir = `${targetDir}-temp-${Date.now()}`;
    renameSync(nested, tempDir);
    rmSync(targetDir, { recursive: true, force: true });
    renameSync(tempDir, targetDir);
    return;
  }

  // Check if extraction produced an empty dir or files at wrong level
  const entries = readdirSync(targetDir);
  if (entries.length === 1) {
    const singleDir = join(targetDir, entries[0]);
    if (
      existsSync(join(singleDir, "package.json")) &&
      existsSync(singleDir)
    ) {
      const tempDir = `${targetDir}-temp-${Date.now()}`;
      renameSync(singleDir, tempDir);
      rmSync(targetDir, { recursive: true, force: true });
      renameSync(tempDir, targetDir);
    }
  }
}

async function fetchTemplate(targetDir: string): Promise<void> {
  const s = spinner();
  s.start("Downloading template...");

  try {
    await downloadTemplate(TEMPLATE_URI, {
      dir: targetDir,
      force: false,
    });
    s.stop("Template downloaded");
  } catch (error) {
    s.stop("Download failed");
    log.error(String(error));
    process.exit(1);
  }

  fixExtraction(targetDir);

  if (!existsSync(join(targetDir, "package.json"))) {
    log.error(
      "Template extraction failed: package.json not found in target directory."
    );
    log.info(
      "This is a known issue with template extraction on some platforms."
    );
    log.info(`Target directory contents: ${readdirSync(targetDir).join(", ") || "(empty)"}`);
    process.exit(1);
  }

  const gitInit = await exec(["git", "init"], { cwd: targetDir });

  if (gitInit.exitCode !== 0) {
    log.warn("Could not initialize git repository");
    log.warn(gitInit.stderr || "git init failed");
  }
}

async function installDeps(targetDir: string): Promise<void> {
  const s = spinner();
  s.start("Installing dependencies...");

  const result = await exec(["bun", "install"], { cwd: targetDir });

  if (result.exitCode !== 0) {
    s.stop("Install failed");
    log.error(result.stderr);
    log.info(`Try manually: cd ${targetDir} && bun install`);
    process.exit(1);
  }

  s.stop("Dependencies installed");
}

export async function runScaffold(projectNameArg?: string): Promise<string> {
  let projectName = projectNameArg;

  if (!projectName) {
    const name = await text({
      message: "What's your project name?",
      placeholder: "my-saas-app",
      validate: (v = "") => {
        if (!isValidAppName(v)) {
          return "Name must be 2-50 characters";
        }
      },
    });
    if (isCancel(name)) {
      process.exit(0);
    }
    projectName = name;
  }

  const dirName = toKebabCase(projectName as string);
  const targetDir = resolve(process.cwd(), dirName);

  if (existsSync(targetDir)) {
    log.error(`Directory "${dirName}" already exists.`);
    process.exit(1);
  }

  log.info(`Creating project in ./${dirName}`);

  await fetchTemplate(targetDir);
  await installDeps(targetDir);

  // Remove the state file if it exists from the template
  rmSync(resolve(targetDir, ".setup-state.json"), { force: true });

  log.success(`Project created in ./${dirName}`);

  return targetDir;
}
