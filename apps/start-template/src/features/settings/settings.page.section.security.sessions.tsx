"use client";

import { Monitor } from "lucide-react";
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

import { ActiveSessionsModal } from "./settings.active-sessions.modal";

export function SessionsSection() {
  const { t } = useTranslation();
  const [showActiveSessions, setShowActiveSessions] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("SETTINGS_SECURITY_SESSIONS_TITLE")}</CardTitle>
        <CardDescription>
          {t("SETTINGS_SECURITY_SESSIONS_DESC")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Monitor className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">
                {t("SETTINGS_SECURITY_SESSIONS_CURRENT")}
              </p>
              <p className="text-muted-foreground text-sm">
                {t("SETTINGS_SECURITY_SESSIONS_ACTIVE_NOW")}
              </p>
            </div>
          </div>
          <Button onClick={() => setShowActiveSessions(true)} variant="outline">
            {t("SETTINGS_SECURITY_SESSIONS_VIEW_ALL")}
          </Button>
        </div>
      </CardContent>
      <ActiveSessionsModal
        onOpenChange={setShowActiveSessions}
        open={showActiveSessions}
      />
    </Card>
  );
}
