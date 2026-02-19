import { Cookie } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useCookieConsent } from "@/lib/cookie-consent-context";
import { cn } from "@/lib/utils";

type ConsentPreferences = {
  analytics: boolean;
  marketing: boolean;
  replay: boolean;
};

type CookieConsentBannerProps = {
  variant?: "default" | "small" | "mini";
  className?: string;
  cookiePolicyHref?: string;
  privacyPolicyHref?: string;
  showManagePreferences?: boolean;
};

const DEFAULT_PREFERENCES: ConsentPreferences = {
  analytics: false,
  marketing: false,
  replay: false,
};

function PreferenceRow({
  title,
  description,
  checked,
  onCheckedChange,
  disabled = false,
}: {
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-md border p-3">
      <div className="space-y-1">
        <p className="font-medium text-sm leading-none">{title}</p>
        <p className="text-muted-foreground text-xs">{description}</p>
      </div>
      <Switch
        aria-label={title}
        checked={checked}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
      />
    </div>
  );
}

export function CookieConsentBanner({
  variant = "small",
  className,
  cookiePolicyHref = "/privacy#cookie-policy",
  privacyPolicyHref = "/privacy",
  showManagePreferences = true,
}: CookieConsentBannerProps) {
  const { t } = useTranslation();
  const [isManagingPreferences, setIsManagingPreferences] = useState(false);
  const [preferences, setPreferences] =
    useState<ConsentPreferences>(DEFAULT_PREFERENCES);
  const { acceptAll, hasDecision, isLoaded, rejectAll, savePreferences } =
    useCookieConsent();

  if (!isLoaded || hasDecision) {
    return null;
  }

  const widthClass = variant === "mini" ? "sm:max-w-lg" : "sm:max-w-2xl";

  return (
    <div
      className={cn(
        "pointer-events-none fixed right-0 bottom-0 left-0 z-50 p-3 sm:right-auto sm:bottom-4 sm:left-4 sm:w-full",
        widthClass,
        className
      )}
    >
      <Card className="pointer-events-auto border shadow-lg">
        <CardHeader className="space-y-2 pb-3">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-base sm:text-lg">
              {t("COOKIE_CONSENT_TITLE")}
            </CardTitle>
            <Cookie aria-hidden="true" className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <CardDescription className="text-sm leading-relaxed">
            {t("COOKIE_CONSENT_DESCRIPTION")}
          </CardDescription>
          <p className="text-muted-foreground text-xs leading-relaxed">
            {t("COOKIE_CONSENT_LEGAL_NOTE")}{" "}
            <a
              className="text-primary underline underline-offset-4 hover:no-underline"
              href={cookiePolicyHref}
            >
              {t("COOKIE_CONSENT_COOKIE_POLICY")}
            </a>{" "}
            {t("COOKIE_CONSENT_AND")}{" "}
            <a
              className="text-primary underline underline-offset-4 hover:no-underline"
              href={privacyPolicyHref}
            >
              {t("COOKIE_CONSENT_PRIVACY_POLICY")}
            </a>
            .
          </p>
        </CardHeader>

        {showManagePreferences && isManagingPreferences ? (
          <CardContent className="space-y-3 pt-0">
            <PreferenceRow
              checked={true}
              description={t("COOKIE_CONSENT_PREF_ESSENTIAL_DESC")}
              disabled={true}
              title={t("COOKIE_CONSENT_PREF_ESSENTIAL")}
            />
            <PreferenceRow
              checked={preferences.analytics}
              description={t("COOKIE_CONSENT_PREF_ANALYTICS_DESC")}
              onCheckedChange={(checked) => {
                setPreferences((current) => ({
                  ...current,
                  analytics: checked,
                }));
              }}
              title={t("COOKIE_CONSENT_PREF_ANALYTICS")}
            />
            <PreferenceRow
              checked={preferences.marketing}
              description={t("COOKIE_CONSENT_PREF_MARKETING_DESC")}
              onCheckedChange={(checked) => {
                setPreferences((current) => ({
                  ...current,
                  marketing: checked,
                }));
              }}
              title={t("COOKIE_CONSENT_PREF_MARKETING")}
            />
            <PreferenceRow
              checked={preferences.replay}
              description={t("COOKIE_CONSENT_PREF_REPLAY_DESC")}
              onCheckedChange={(checked) => {
                setPreferences((current) => ({ ...current, replay: checked }));
              }}
              title={t("COOKIE_CONSENT_PREF_REPLAY")}
            />
          </CardContent>
        ) : null}

        <CardFooter className="flex flex-col gap-2 sm:flex-row">
          <Button
            className="w-full sm:flex-1"
            onClick={rejectAll}
            type="button"
            variant="outline"
          >
            {t("COOKIE_CONSENT_REJECT_ALL")}
          </Button>
          <Button
            className="w-full sm:flex-1"
            onClick={acceptAll}
            type="button"
            variant="outline"
          >
            {t("COOKIE_CONSENT_ACCEPT_ALL")}
          </Button>
          {showManagePreferences ? (
            isManagingPreferences ? (
              <Button
                className="w-full sm:flex-1"
                onClick={() => {
                  savePreferences(preferences);
                }}
                type="button"
              >
                {t("COOKIE_CONSENT_SAVE_PREFERENCES")}
              </Button>
            ) : (
              <Button
                className="w-full sm:flex-1"
                onClick={() => {
                  setIsManagingPreferences(true);
                }}
                type="button"
                variant="outline"
              >
                {t("COOKIE_CONSENT_MANAGE_PREFERENCES")}
              </Button>
            )
          ) : null}
        </CardFooter>
      </Card>
    </div>
  );
}
