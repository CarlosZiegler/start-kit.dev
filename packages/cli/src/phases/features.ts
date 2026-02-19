import { isCancel, log, multiselect } from "@clack/prompts";

import type { SetupState } from "../lib/state";
import { markPhaseCompleted, saveState } from "../lib/state";

const FEATURE_OPTIONS = [
  { value: "stripe", label: "Stripe", hint: "payments & subscriptions" },
  { value: "ai", label: "AI Chat", hint: "OpenAI / Anthropic / Gemini" },
  { value: "storage", label: "Storage", hint: "S3 / SeaweedFS / R2 / Minio" },
  { value: "redis", label: "Redis", hint: "resumable chat streams" },
  { value: "email", label: "Email", hint: "Resend — transactional emails" },
] as const;

export async function runFeatures(state: SetupState): Promise<SetupState> {
  const selected = await multiselect({
    message: "Which features do you want to enable?",
    options: FEATURE_OPTIONS.map((f) => ({
      value: f.value,
      label: `${f.label} (${f.hint})`,
    })),
    initialValues: state.features
      ? Object.entries(state.features)
          .filter(([, v]) => v)
          .map(([k]) => k)
      : [],
    required: false,
  });
  if (isCancel(selected)) {
    process.exit(0);
  }

  const features = {
    stripe: selected.includes("stripe"),
    ai: selected.includes("ai"),
    storage: selected.includes("storage"),
    redis: selected.includes("redis"),
    email: selected.includes("email"),
  };

  const enabled = Object.entries(features)
    .filter(([, v]) => v)
    .map(([k]) => k);

  if (enabled.length > 0) {
    log.success(`Enabled: ${enabled.join(", ")}`);
  } else {
    log.info("No optional features selected — core app only");
  }

  state.features = features;
  markPhaseCompleted(state, "features");
  await saveState(state);

  return state;
}
