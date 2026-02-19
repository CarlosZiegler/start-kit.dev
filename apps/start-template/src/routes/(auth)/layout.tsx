import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/ui/logo";
import { Separator } from "@/components/ui/separator";
import { authQueryOptions } from "@/lib/auth/queries";

export const Route = createFileRoute("/(auth)")({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    const RedirectUrl = "/overview";

    const user = await context.queryClient.ensureQueryData({
      ...authQueryOptions(),
      revalidateIfStale: true,
    });
    if (user) {
      throw redirect({
        to: RedirectUrl,
      });
    }

    return {
      redirectUrl: RedirectUrl,
    };
  },
});

function RouteComponent() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-background to-muted/20">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link className="flex items-center space-x-2" to="/">
              <Logo className="h-8 w-8" />
              <span className="font-bold text-xl">Start Kit</span>
            </Link>

            <div className="flex items-center space-x-4">
              <Link className={buttonVariants({ variant: "ghost" })} to="/">
                {t("BACK_TO_HOME")}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          {/* Auth Card */}
          <Card className="border-0 bg-card/80 shadow-xl backdrop-blur-sm">
            <CardContent className="p-8">
              <Outlet />
            </CardContent>
          </Card>

          {/* Footer Links */}
          <div className="space-y-2 text-center text-muted-foreground text-sm">
            <div className="flex items-center justify-center space-x-4">
              <Link
                className="transition-colors hover:text-foreground"
                to="/sign-in"
              >
                {t("SIGN_IN")}
              </Link>
              <Separator className="h-4" orientation="vertical" />
              <Link
                className="transition-colors hover:text-foreground"
                to="/sign-up"
              >
                {t("SIGN_UP")}
              </Link>
              <Separator className="h-4" orientation="vertical" />
              <Link
                className="transition-colors hover:text-foreground"
                to="/forgot-password"
              >
                {t("FORGOT_PASSWORD")}
              </Link>
            </div>
            <p className="text-xs">
              {t("BY_CONTINUING")}{" "}
              <Link
                className="underline transition-colors hover:text-foreground"
                to="/terms"
              >
                {t("TERMS_OF_SERVICE")}
              </Link>{" "}
              {t("AND")}{" "}
              <Link
                className="underline transition-colors hover:text-foreground"
                to="/privacy"
              >
                {t("PRIVACY_POLICY")}
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
