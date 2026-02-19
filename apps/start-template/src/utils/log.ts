import { createIsomorphicFn } from "@tanstack/react-start";
import pc from "picocolors";

const isDev = import.meta.env.DEV;

type LogData = Record<string, unknown>;

const formatData = (data?: LogData): string => {
  if (!data || Object.keys(data).length === 0) {
    return "";
  }
  return ` ${pc.dim(JSON.stringify(data))}`;
};

const timestamp = () => pc.dim(new Date().toISOString().slice(11, 23));

const createServerLogger = () => ({
  debug: (data: LogData | string, msg?: string) => {
    if (!isDev) {
      return;
    }
    const [message, extra] =
      typeof data === "string" ? [data, undefined] : [msg ?? "", data];
    process.stdout.write(
      `${timestamp()} ${pc.blue("DEBUG")} ${message}${formatData(extra)}\n`
    );
  },
  info: (data: LogData | string, msg?: string) => {
    const [message, extra] =
      typeof data === "string" ? [data, undefined] : [msg ?? "", data];
    process.stdout.write(
      `${timestamp()} ${pc.green("INFO")}  ${message}${formatData(extra)}\n`
    );
  },
  warn: (data: LogData | string, msg?: string) => {
    const [message, extra] =
      typeof data === "string" ? [data, undefined] : [msg ?? "", data];
    process.stdout.write(
      `${timestamp()} ${pc.yellow("WARN")}  ${message}${formatData(extra)}\n`
    );
  },
  error: (data: LogData | string, msg?: string) => {
    const [message, extra] =
      typeof data === "string" ? [data, undefined] : [msg ?? "", data];
    process.stderr.write(
      `${timestamp()} ${pc.red("ERROR")} ${message}${formatData(extra)}\n`
    );
  },
});

const createClientLogger = () => ({
  debug: (data: LogData | string, msg?: string) => {
    if (!isDev) {
      return;
    }
    const [message, extra] =
      typeof data === "string" ? [data, undefined] : [msg ?? "", data];
    // biome-ignore lint/suspicious/noConsole: client logger requires console
    console.debug(`[DEBUG] ${message}`, extra ?? "");
  },
  info: (data: LogData | string, msg?: string) => {
    if (!isDev) {
      return;
    }
    const [message, extra] =
      typeof data === "string" ? [data, undefined] : [msg ?? "", data];
    // biome-ignore lint/suspicious/noConsole: client logger requires console
    console.info(`[INFO] ${message}`, extra ?? "");
  },
  warn: (data: LogData | string, msg?: string) => {
    const [message, extra] =
      typeof data === "string" ? [data, undefined] : [msg ?? "", data];
    // biome-ignore lint/suspicious/noConsole: client logger requires console
    console.warn(`[WARN] ${message}`, extra ?? "");
  },
  error: (data: LogData | string, msg?: string) => {
    const [message, extra] =
      typeof data === "string" ? [data, undefined] : [msg ?? "", data];
    // biome-ignore lint/suspicious/noConsole: client logger requires console
    console.error(`[ERROR] ${message}`, extra ?? "");
  },
});

const getLogger = createIsomorphicFn()
  .server(createServerLogger)
  .client(createClientLogger);

export const log = getLogger();
