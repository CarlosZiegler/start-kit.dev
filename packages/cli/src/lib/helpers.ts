import { readFileSync, writeFileSync } from "node:fs";

const NAME_PATTERN = /name:\s*"[^"]*"/;
const DESCRIPTION_PATTERN = /description:\s*"[^"]*"/;

export function updateJsonFile(
  path: string,
  updates: Record<string, unknown>
): void {
  const content = readFileSync(path, "utf-8");
  const json = JSON.parse(content);
  for (const [key, value] of Object.entries(updates)) {
    json[key] = value;
  }
  writeFileSync(path, `${JSON.stringify(json, null, 2)}\n`);
}

export function updateAppConfig(
  path: string,
  name: string,
  description: string
): void {
  let content = readFileSync(path, "utf-8");
  content = content.replace(NAME_PATTERN, `name: "${name}"`);
  content = content.replace(
    DESCRIPTION_PATTERN,
    `description: "${description}"`
  );
  writeFileSync(path, content);
}

export function writeEnvFile(
  path: string,
  vars: Record<string, string>,
  comments?: Record<string, string>
): void {
  const lines: string[] = [];
  for (const [key, value] of Object.entries(vars)) {
    if (comments?.[key]) {
      lines.push(`# ${comments[key]}`);
    }
    const formatted = value.includes(" ") ? `"${value}"` : value;
    lines.push(`${key}=${formatted}`);
  }
  writeFileSync(path, `${lines.join("\n")}\n`);
}

export function readEnvFile(path: string): Record<string, string> {
  try {
    const content = readFileSync(path, "utf-8");
    const result: Record<string, string> = {};
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const eqIndex = trimmed.indexOf("=");
        if (eqIndex > 0) {
          const key = trimmed.slice(0, eqIndex);
          let value = trimmed.slice(eqIndex + 1);
          if (
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))
          ) {
            value = value.slice(1, -1);
          }
          result[key] = value;
        }
      }
    }
    return result;
  } catch {
    return {};
  }
}

export function generateSecret(bytes = 32): string {
  const buffer = new Uint8Array(bytes);
  crypto.getRandomValues(buffer);
  return btoa(String.fromCharCode(...buffer));
}

export async function exec(
  command: string[],
  options?: { cwd?: string }
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  if (command.length === 0) {
    return { stdout: "", stderr: "No command provided", exitCode: 1 };
  }

  try {
    // biome-ignore lint/correctness/noUndeclaredVariables: Bun global available at runtime
    const proc = Bun.spawn(command, {
      cwd: options?.cwd,
      stdout: "pipe",
      stderr: "pipe",
    });

    const [stdout, stderr] = await Promise.all([
      new Response(proc.stdout).text(),
      new Response(proc.stderr).text(),
    ]);
    const exitCode = await proc.exited;

    return { stdout: stdout.trim(), stderr: stderr.trim(), exitCode };
  } catch (error) {
    return {
      stdout: "",
      stderr: error instanceof Error ? error.message : String(error),
      exitCode: 127,
    };
  }
}

export async function testDbConnection(
  url: string
): Promise<{ ok: boolean; error?: string; version?: string }> {
  try {
    const { SQL } = await import("bun");
    const sql = new SQL(url);
    const [result] = await sql`SELECT version() as version`;
    await sql.close();
    return { ok: true, version: result.version };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
