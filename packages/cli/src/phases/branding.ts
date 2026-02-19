import { isCancel, log, spinner, text } from "@clack/prompts";

import { updateAppConfig, updateJsonFile } from "../lib/helpers";
import type { SetupState } from "../lib/state";
import { markPhaseCompleted, saveState } from "../lib/state";
import { isValidAppName, isValidDomain, toKebabCase } from "../lib/validators";

export async function runBranding(state: SetupState): Promise<SetupState> {
  const appName = await text({
    message: "What's your app name?",
    placeholder: "My SaaS App",
    initialValue: state.branding?.appName,
    validate: (v) => {
      if (!isValidAppName(v)) {
        return "Name must be 2-50 characters";
      }
    },
  });
  if (isCancel(appName)) {
    process.exit(0);
  }

  const description = await text({
    message: "Short description?",
    placeholder: "A platform for managing widgets",
    initialValue: state.branding?.description,
  });
  if (isCancel(description)) {
    process.exit(0);
  }

  const domain = await text({
    message: "What's your domain? (for emails, auth origins)",
    placeholder: "mysaasapp.com",
    initialValue: state.branding?.domain,
    validate: (v) => {
      if (v && !isValidDomain(v)) {
        return "Enter a valid domain (e.g. myapp.com)";
      }
    },
  });
  if (isCancel(domain)) {
    process.exit(0);
  }

  const s = spinner();
  s.start("Updating files...");

  const kebabName = toKebabCase(appName);

  // Update package.json
  updateJsonFile("package.json", { name: kebabName });

  // Update app.config.ts
  updateAppConfig("src/lib/config/app.config.ts", appName, description);

  s.stop("Files updated");

  log.success(`package.json → name: "${kebabName}"`);
  log.success(`app.config.ts → name: "${appName}"`);

  state.branding = { appName, description, domain: domain || "" };
  markPhaseCompleted(state, "branding");
  await saveState(state);

  return state;
}
