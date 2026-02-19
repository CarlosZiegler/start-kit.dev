import { existsSync, readFileSync } from "node:fs";

const STATE_FILE = ".setup-state.json";

type Phase = "branding" | "features" | "database" | "env" | "infra";

type SetupState = {
  version: number;
  completedPhases: Phase[];
  branding?: {
    appName: string;
    description: string;
    domain: string;
  };
  features?: {
    stripe: boolean;
    ai: boolean;
    storage: boolean;
    redis: boolean;
    email: boolean;
  };
  database?: {
    provider: "instagres" | "own";
    migrated: boolean;
  };
  env?: {
    placeholders: string[];
    written: boolean;
  };
  infra?: {
    seaweedfs: boolean;
    redis: boolean;
  };
};

const DEFAULT_STATE: SetupState = {
  version: 1,
  completedPhases: [],
};

function getStatePath(): string {
  return `${process.cwd()}/${STATE_FILE}`;
}

export function loadState(): SetupState {
  const path = getStatePath();
  if (!existsSync(path)) {
    return { ...DEFAULT_STATE };
  }
  const content = readFileSync(path, "utf-8");
  return JSON.parse(content) as SetupState;
}

export async function saveState(state: SetupState): Promise<void> {
  // biome-ignore lint/correctness/noUndeclaredVariables: Bun global is available at runtime
  await Bun.write(getStatePath(), JSON.stringify(state, null, 2));
}

export function isPhaseCompleted(state: SetupState, phase: Phase): boolean {
  return state.completedPhases.includes(phase);
}

export function markPhaseCompleted(
  state: SetupState,
  phase: Phase
): SetupState {
  if (!state.completedPhases.includes(phase)) {
    state.completedPhases.push(phase);
  }
  return state;
}

export type { SetupState, Phase };
