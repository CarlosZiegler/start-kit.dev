import { existsSync } from "node:fs";
import { isCancel, log, spinner, text } from "@clack/prompts";
import { downloadTemplate } from "giget";

import { exec } from "../lib/helpers";
import { isValidAppName, toKebabCase } from "../lib/validators";

const TEMPLATE_URI = "gh:CarlosZiegler/start-kit.dev/apps/start-template#main";

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

  await exec(`git -C "${targetDir}" init`);
}

async function installDeps(targetDir: string): Promise<void> {
  const s = spinner();
  s.start("Installing dependencies...");

  const result = await exec(`cd "${targetDir}" && bun install`);

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
  const targetDir = `${process.cwd()}/${dirName}`;

  if (existsSync(targetDir)) {
    log.error(`Directory "${dirName}" already exists.`);
    process.exit(1);
  }

  log.info(`Creating project in ./${dirName}`);

  await fetchTemplate(targetDir);
  await installDeps(targetDir);

  // Remove the state file if it exists from the template
  await exec(`rm -f "${targetDir}/.setup-state.json"`);

  log.success(`Project created in ./${dirName}`);

  return targetDir;
}
