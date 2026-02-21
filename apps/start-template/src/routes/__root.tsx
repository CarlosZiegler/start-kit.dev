/// <reference types="vite/client" />
/** biome-ignore-all lint/style/noHeadElement: needed to author <head> content */

import type { QueryClient } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { lazy } from "react";
import type * as React from "react";

const TanStackDevtools = import.meta.env.DEV
  ? lazy(() => import("@tanstack/react-devtools").then((m) => ({ default: m.TanStackDevtools })))
  : () => null;

const ReactQueryDevtoolsPanel = import.meta.env.DEV
  ? lazy(() => import("@tanstack/react-query-devtools").then((m) => ({ default: m.ReactQueryDevtoolsPanel })))
  : () => null;

const TanStackRouterDevtoolsPanel = import.meta.env.DEV
  ? lazy(() => import("@tanstack/react-router-devtools").then((m) => ({ default: m.TanStackRouterDevtoolsPanel })))
  : () => null;

import { I18nextProvider } from "react-i18next";
import appCss from "@/app.css?url";
import {
  ConsentAwareAnalytics,
  CookieConsentBanner,
} from "@/components/cookie-consent";
import { DefaultCatchBoundary } from "@/components/error-boundary";
import { NotFound } from "@/components/not-found";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import type { AuthSession } from "@/lib/auth/auth-client";
import { authQueryOptions } from "@/lib/auth/queries";
import { CookieConsentProvider } from "@/lib/cookie-consent-context";
import i18n, { setSSRLanguage } from "@/lib/intl/i18n";
import type { orpc } from "@/orpc/orpc-client";
import { DEFAULT_SITE_NAME, seo } from "@/utils/seo";

type RootContext = {
  orpc: typeof orpc;
  queryClient: QueryClient;
  session: AuthSession | null;
};

export const Route = createRootRouteWithContext<RootContext>()({
  beforeLoad: async ({ context }) => {
    // we're using react-query for client-side caching to reduce client-to-server calls, see /src/router.tsx
    // better-auth's cookieCache is also enabled server-side to reduce server-to-db calls, see /src/lib/auth/auth.ts
    context.queryClient.prefetchQuery(authQueryOptions());
    const lang = await setSSRLanguage();
    return { lang };
  },
  loader: ({ context }) => {
    return { lang: context.lang };
  },
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      ...seo({
        title: DEFAULT_SITE_NAME,
        description:
          "An open-source, production-ready template featuring Authentication, Payments, Database, i18n, and more.",
        image: "/images/landing/hero-bg.png",
      }).meta,
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/apple-touch-icon.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        href: "/favicon-32x32.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        href: "/favicon-16x16.png",
      },
      { rel: "manifest", href: "/site.webmanifest", color: "#ffffff" },
      { rel: "icon", href: "/favicon.ico" },
    ],
  }),
  errorComponent: DefaultCatchBoundary,
  notFoundComponent: () => <NotFound />,
  shellComponent: RootDocument,
  wrapInSuspense: true,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  const { lang } = Route.useLoaderData();
  const htmlLang = lang || i18n.language;
  return (
    <html lang={htmlLang} suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          disableTransitionOnChange
          enableSystem
        >
          <I18nextProvider defaultNS={"translation"} i18n={i18n}>
            <CookieConsentProvider>
              {children}
              <Toaster />
              <CookieConsentBanner variant="small" />
              {import.meta.env.DEV && (
                <TanStackDevtools
                  config={{ defaultOpen: false }}
                  eventBusConfig={{ connectToServerBus: true }}
                  plugins={[
                    { name: "Tanstack Query", render: <ReactQueryDevtoolsPanel /> },
                    { name: "Tanstack Router", render: <TanStackRouterDevtoolsPanel /> },
                  ]}
                />
              )}

              <Scripts />
              <ConsentAwareAnalytics />
            </CookieConsentProvider>
          </I18nextProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
