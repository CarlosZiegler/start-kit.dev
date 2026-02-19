"use client";

import { Shield } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authClient } from "@/lib/auth/auth-client";

import { TwoFactorAuthModal } from "./settings.two-factor.modal";

export function TwoFactorSection() {
  const { t } = useTranslation();
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const [showTwoFactor, setShowTwoFactor] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("SETTINGS_SECURITY_2FA_TITLE")}</CardTitle>
        <CardDescription>
          {t("SETTINGS_SECURITY_2FA_ENABLE_DESC")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">
                {t("SETTINGS_SECURITY_2FA_METHOD_APP")}
              </p>
              <p className="text-muted-foreground text-sm">
                {t("SETTINGS_SECURITY_2FA_METHOD_DESC")}
              </p>
            </div>
          </div>
          <Button
            onClick={() => setShowTwoFactor(true)}
            variant={user?.twoFactorEnabled ? "destructive" : "outline"}
          >
            {user?.twoFactorEnabled ? t("DISABLE_2FA") : t("ENABLE_2FA")}
          </Button>
        </div>
      </CardContent>
      <TwoFactorAuthModal
        onOpenChange={setShowTwoFactor}
        open={showTwoFactor}
      />
    </Card>
  );
}
