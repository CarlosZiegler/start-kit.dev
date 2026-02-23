import { mkdtempSync, realpathSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "bun:test";

import { exec } from "../helpers";

const tempDirs: string[] = [];

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

describe("exec", () => {
  it("runs a command and returns stdout", async () => {
    const result = await exec([process.execPath, "--version"]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout.length).toBeGreaterThan(0);
  });

  it("respects cwd", async () => {
    const cwd = realpathSync(
      mkdtempSync(join(tmpdir(), "create-start-kit-dev-"))
    );
    tempDirs.push(cwd);

    const result = await exec(
      [process.execPath, "-e", "console.log(process.cwd())"],
      { cwd }
    );

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toBe(cwd);
  });

  it("returns non-zero exit code without throwing", async () => {
    const result = await exec([process.execPath, "-e", "process.exit(7)"]);

    expect(result.exitCode).toBe(7);
  });
});
