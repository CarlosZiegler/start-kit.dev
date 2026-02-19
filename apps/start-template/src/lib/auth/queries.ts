import { queryOptions } from "@tanstack/react-query";

import { authClient } from "@/lib/auth/auth-client";

import { getUser } from "./auth-server-fn";
export const authQueryOptions = () =>
  queryOptions({
    queryKey: ["session"],
    queryFn: ({ signal }) => getUser({ signal }),
  });

export const sessionKeys = {
  all: ["auth"] as const,
  sessions: () => [...sessionKeys.all, "sessions"] as const,
};

export const activeSessionsOptions = () =>
  queryOptions({
    queryKey: sessionKeys.sessions(),
    queryFn: async () => {
      const res = await authClient.listSessions();
      if (res?.error) {
        throw new Error(res.error.message || "Failed to list sessions", {
          cause: res.error,
        });
      }
      return res;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
