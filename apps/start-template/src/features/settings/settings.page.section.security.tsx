"use client";

import { useTranslation } from "react-i18next";

import { ChangePasswordSection } from "./settings.page.section.security.change-password";
import { DangerZoneSection } from "./settings.page.section.security.danger-zone";
import { EmailVerificationSection } from "./settings.page.section.security.email-verification";
import { SessionsSection } from "./settings.page.section.security.sessions";
import { TwoFactorSection } from "./settings.page.section.security.two-factor";
import { PasskeysSection } from "./settings.passkeys.section";

export function SecuritySection() {
  const { t } = useTranslation();
  return (
    <div className="w-full items-center justify-center space-y-6 px-4">
      <div>
        <h1 className="text-balance font-semibold text-2xl">
          {t("SETTINGS_SECURITY_TITLE_FULL")}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {t("SETTINGS_SECURITY_DESC")}
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <ChangePasswordSection />
        <TwoFactorSection />
        <PasskeysSection />
        <EmailVerificationSection />
        <SessionsSection />
        <DangerZoneSection />
      </div>
    </div>
  );
}
