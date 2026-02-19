import { createORPCClient, onError } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { RouterClient } from "@orpc/server";
import { createRouterClient } from "@orpc/server";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

import { type AppRouterClient, router } from ".";
import { createORPCContext } from "./orpc-server";

const getOrpcClient = createIsomorphicFn()
  .server(() =>
    createRouterClient(router, {
      context: () =>
        createORPCContext({
          headers: getRequestHeaders(),
        }),
    })
  )
  .client((): RouterClient<typeof router> => {
    const link = new RPCLink({
      url: `${window.location.origin}/api/rpc`,
      fetch(url, options) {
        return globalThis.fetch(url, {
          ...options,
          credentials: "include",
        });
      },
      interceptors: [
        onError((error) => {
          if (error instanceof Error && error.name !== "AbortError") {
            console.error(error);
          }
        }),
      ],
    });

    return createORPCClient(link);
  });

export const client: AppRouterClient = getOrpcClient();

export const orpc = createTanstackQueryUtils(client);
