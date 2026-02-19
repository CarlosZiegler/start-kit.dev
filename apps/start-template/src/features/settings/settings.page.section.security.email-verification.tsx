"use client";

import { Mail } from "lucide-react";
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

import { EmailVerificationModal } from "./settings.email-verification.modal";

export function EmailVerificationSection() {
  const { t } = useTranslation();
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const [showEmailVerification, setShowEmailVerification] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("EMAIL_VERIFICATION_TITLE")}</CardTitle>
        <CardDescription>{t("EMAIL_VERIFICATION_DESC")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium text-sm">{user?.email}</p>
              <p className="text-muted-foreground text-sm">
                {user?.emailVerified
                  ? t("EMAIL_VERIFIED")
                  : t("EMAIL_NOT_VERIFIED")}
              </p>
            </div>
          </div>
          {!user?.emailVerified && (
            <Button
              onClick={() => setShowEmailVerification(true)}
              variant="outline"
            >
              {t("EMAIL_RESEND_VERIFICATION")}
            </Button>
          )}
        </div>
      </CardContent>
      <EmailVerificationModal
        onOpenChange={setShowEmailVerification}
        open={showEmailVerification}
      />
    </Card>
  );
}
