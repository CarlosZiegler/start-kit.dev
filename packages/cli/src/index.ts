#!/usr/bin/env bun

import { intro, isCancel, log, outro, select } from "@clack/prompts";

import {
  isPhaseCompleted,
  loadState,
  type Phase,
  type SetupState,
} from "./lib/state";
import { runBranding } from "./phases/branding";
import { runDatabase } from "./phases/database";
import { runEnv } from "./phases/env";
import { runFeatures } from "./phases/features";
import { runInfra } from "./phases/infra";
import { runScaffold } from "./phases/scaffold";

const PHASES: {
  key: Phase;
  label: string;
  run: (state: SetupState) => Promise<SetupState>;
}[] = [
  { key: "branding", label: "Branding", run: runBranding },
  { key: "features", label: "Features", run: runFeatures },
  { key: "database", label: "Database", run: runDatabase },
  { key: "env", label: "Environment", run: runEnv },
  { key: "infra", label: "Infrastructure", run: runInfra },
];

function showPhaseStatus(state: SetupState): void {
  for (const phase of PHASES) {
    const done = isPhaseCompleted(state, phase.key);
    const icon = done ? "\u2713" : "\u25CB";
    log.info(`${icon} ${phase.label}${done ? " (completed)" : ""}`);
  }
}

async function getResumeStartIndex(state: SetupState): Promise<number> {
  const firstIncomplete = PHASES.findIndex(
    (p) => !isPhaseCompleted(state, p.key)
  );

  const options: { value: string; label: string }[] = [];
  if (firstIncomplete >= 0) {
    options.push({
      value: "continue",
      label: `Continue from ${PHASES[firstIncomplete].label}`,
    });
  }
  options.push(
    { value: "start-over", label: "Start over" },
    { value: "jump", label: "Jump to a specific phase" }
  );

  const choice = await select({
    message: "What would you like to do?",
    options,
  });
  if (isCancel(choice)) {
    process.exit(0);
  }

  if (choice === "continue") {
    return firstIncomplete;
  }
  if (choice === "start-over") {
    return -1;
  }

  return await selectPhase(state);
}

async function selectPhase(state: SetupState): Promise<number> {
  const jumpTo = await select({
    message: "Which phase?",
    options: PHASES.map((p, i) => ({
      value: i,
      label: p.label,
      hint: isPhaseCompleted(state, p.key) ? "completed" : undefined,
    })),
  });
  if (isCancel(jumpTo)) {
    process.exit(0);
  }
  return jumpTo as number;
}

async function runSinglePhase(
  targetStep: Phase,
  state: SetupState
): Promise<void> {
  const phase = PHASES.find((p) => p.key === targetStep);
  if (!phase) {
    log.error(`Unknown phase: ${targetStep}`);
    log.info(`Available: ${PHASES.map((p) => p.key).join(", ")}`);
    process.exit(1);
  }
  await phase.run(state);
  outro(`Phase "${phase.label}" complete!`);
}

async function runWizard(state: SetupState): Promise<void> {
  showPhaseStatus(state);

  let startFrom = 0;
  let currentState = state;

  if (state.completedPhases.length > 0) {
    const resumeIndex = await getResumeStartIndex(state);
    if (resumeIndex === -1) {
      currentState = { version: 1, completedPhases: [] };
    } else {
      startFrom = resumeIndex;
    }
  }

  for (let i = startFrom; i < PHASES.length; i++) {
    const phase = PHASES[i];
    log.step(`Phase ${i + 1}/${PHASES.length}: ${phase.label}`);
    currentState = await phase.run(currentState);
  }

  outro("Setup complete! Run `bun dev` to start your app.");
}

function showUsage(): void {
  console.log("Usage:");
  console.log(
    "  bunx create-start-kit create [project-name]   Create a new project"
  );
  console.log(
    "  bunx create-start-kit init [--step <phase>]    Setup existing project"
  );
  console.log("");
  console.log("Phases: branding, features, database, env, infra");
}

async function handleCreate(args: string[]): Promise<void> {
  const projectName = args.at(1);

  intro("Start Kit — Create New Project");

  const targetDir = await runScaffold(projectName);

  // Change working directory to the new project
  process.chdir(targetDir);

  log.step("Now let's configure your project...");

  const state = loadState();
  await runWizard(state);
}

async function handleInit(args: string[]): Promise<void> {
  const stepIndex = args.indexOf("--step");
  const targetStep =
    stepIndex >= 0 ? (args.at(stepIndex + 1) as Phase) : undefined;

  intro("Start Kit Setup");

  const state = loadState();

  if (targetStep) {
    await runSinglePhase(targetStep, state);
  } else {
    await runWizard(state);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const command = args.at(0);

  if (command === "create") {
    await handleCreate(args);
    return;
  }

  if (command === "init") {
    await handleInit(args);
    return;
  }

  showUsage();
}

main().catch((error) => {
  console.error("Setup failed:", error);
  process.exit(1);
});
