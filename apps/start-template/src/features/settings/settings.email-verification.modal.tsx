"use client";

import { useMutation } from "@tanstack/react-query";
import { Loader2, Mail } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { authClient } from "@/lib/auth/auth-client";

type EmailVerificationModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EmailVerificationModal({
  open,
  onOpenChange,
}: EmailVerificationModalProps) {
  const { t } = useTranslation();
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const sendVerificationEmail = useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      const result = await authClient.sendVerificationEmail({ email });
      if (result.error) {
        throw new Error(
          result.error.message || t("EMAIL_VERIFICATION_FAILED"),
          {
            cause: result.error,
          }
        );
      }
      return result;
    },
    onSuccess: () => {
      toast.success(t("EMAIL_VERIFICATION_SENT"));
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error.message || t("EMAIL_VERIFICATION_FAILED"));
    },
  });

  const handleResendVerification = () => {
    if (!user?.email) {
      toast.error(t("EMAIL_NO_ADDRESS"));
      return;
    }

    sendVerificationEmail.mutate({ email: user.email });
  };

  const isLoading = sendVerificationEmail.isPending;

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="w-11/12 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("EMAIL_VERIFICATION_TITLE")}</DialogTitle>
          <DialogDescription>{t("EMAIL_VERIFICATION_DESC")}</DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">{user?.email}</p>
              <p className="text-muted-foreground text-sm">
                {user?.emailVerified
                  ? t("EMAIL_VERIFIED")
                  : t("EMAIL_NOT_VERIFIED")}
              </p>
            </div>
          </div>
          {!user?.emailVerified && (
            <Button
              disabled={isLoading}
              onClick={handleResendVerification}
              variant="outline"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("EMAIL_RESEND_VERIFICATION")}
            </Button>
          )}
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant="outline">
            {t("CLOSE")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
