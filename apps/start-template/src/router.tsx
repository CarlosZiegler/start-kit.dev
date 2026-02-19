import { QueryCache, QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { toast } from "sonner";

import { DefaultCatchBoundary } from "./components/error-boundary";
import { NotFound } from "./components/not-found";
import { authQueryOptions } from "./lib/auth/queries";
import { orpc } from "./orpc/orpc-client";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        staleTime: 1000 * 60 * 2, // 2 minutes
      },
    },
    queryCache: new QueryCache({
      onError: (error) => {
        if (
          error.cause &&
          // @ts-expect-error - cause is not typed
          "status" in error.cause &&
          error.cause.status === 401
        ) {
          queryClient.setQueryData(authQueryOptions().queryKey, null);
          window.location.href = "/sign-in";
          return;
        }
        toast.error(`Error: ${error.message}`, {
          action: {
            label: "retry",
            onClick: () => {
              queryClient.invalidateQueries();
            },
          },
        });
      },
    }),
  });

  const router = createRouter({
    routeTree,
    context: { queryClient, orpc, session: null },
    // react-query will handle data fetching & caching
    // https://tanstack.com/router/latest/docs/framework/react/guide/data-loading#passing-all-loader-events-to-an-external-cache
    defaultPreloadStaleTime: 0,
    defaultPreload: "intent",
    defaultErrorComponent: DefaultCatchBoundary,
    defaultNotFoundComponent: () => <NotFound />,
    scrollRestoration: true,
    defaultStructuralSharing: true,
  });

  setupRouterSsrQueryIntegration({
    router,
    queryClient,
    handleRedirects: true,
    wrapQueryClient: true,
  });
  return router;
}
