import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Shield, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

import { buttonVariants } from "@/components/ui/button";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/(auth)/two-factor/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslation();

  return (
    <>
      <CardHeader className="space-y-2 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
          <Shield className="h-6 w-6 text-blue-600" />
        </div>
        <CardTitle className="font-bold text-2xl">
          {t("TWO_FACTOR_AUTH")}
        </CardTitle>
        <CardDescription>{t("2FA_DESCRIPTION")}</CardDescription>
      </CardHeader>

      <div className="space-y-6">
        <div className="space-y-4 text-center">
          <div className="flex items-center justify-center space-x-2">
            <ShieldCheck className="h-5 w-5 text-green-600" />
            <span className="font-medium text-green-600 text-sm">
              {t("2FA_ENABLED")}
            </span>
          </div>
          <p className="text-muted-foreground text-sm">
            {t("2FA_ENABLED_DESC")}
          </p>
        </div>

        <Separator />

        <div className="text-center">
          <p className="mb-4 text-muted-foreground text-sm">
            {t("2FA_MANAGE")}
          </p>
          <Link className={buttonVariants()} to="/two-factor/otp">
            {t("GO_TO_OTP")}
          </Link>
        </div>

        <div className="text-center text-sm">
          <Link
            className={buttonVariants({ variant: "link", className: "px-0" })}
            to="/overview"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("BACK_TO_DASHBOARD")}
          </Link>
        </div>
      </div>
    </>
  );
}
