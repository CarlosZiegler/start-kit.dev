/** biome-ignore-all lint/style/useNamingConvention: API response uses snake_case */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import type { ComponentType } from "react";
import { useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import QrCodeModule from "react-qr-code";

const QrCode = ((
  QrCodeModule as unknown as { default?: ComponentType<{ value: string }> }
).default || QrCodeModule) as ComponentType<{ value: string }>;

import { toast } from "sonner";
import z from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth/auth-client";
import {
  otpSchema,
  twoFactorPasswordSchema,
} from "@/lib/validations/settings";

type TwoFactorAuthModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function TwoFactorAuthModal({
  open,
  onOpenChange,
}: TwoFactorAuthModalProps) {
  const { t } = useTranslation();
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const getTotpUri = useMutation({
    mutationFn: async ({ password }: { password: string }) => {
      const result = await authClient.twoFactor.getTotpUri({ password });
      if (result.error) {
        throw new Error(
          result.error.message || t("SETTINGS_SECURITY_2FA_FAILED_QR"),
          {
            cause: result.error,
          }
        );
      }
      return result;
    },
  });
  const enableTwoFactor = useMutation({
    mutationFn: async ({ password }: { password: string }) => {
      const result = await authClient.twoFactor.enable({ password });
      if (result.error) {
        throw new Error(
          result.error.message || t("SETTINGS_SECURITY_2FA_FAILED_ENABLE"),
          {
            cause: result.error,
          }
        );
      }
      return result;
    },
  });
  const disableTwoFactor = useMutation({
    mutationFn: async ({ password }: { password: string }) => {
      const result = await authClient.twoFactor.disable({ password });
      if (result.error) {
        throw new Error(
          result.error.message || t("SETTINGS_SECURITY_2FA_FAILED_ENABLE"),
          {
            cause: result.error,
          }
        );
      }
      return result;
    },
  });
  const verifyTotp = useMutation({
    mutationFn: async ({ code }: { code: string }) => {
      const result = await authClient.twoFactor.verifyTotp({ code });
      if (result.error) {
        throw new Error(
          result.error.message || t("SETTINGS_SECURITY_2FA_INVALID_OTP"),
          {
            cause: result.error,
          }
        );
      }
      return result;
    },
  });

  const [showQrCode, setShowQrCode] = useState(false);
  const [totpUri, setTotpUri] = useState("");

  const passwordForm = useForm<z.infer<typeof twoFactorPasswordSchema>>({
    resolver: zodResolver(twoFactorPasswordSchema),
    defaultValues: { password: "" },
  });

  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  const isTwoFactorEnabled = !!user?.twoFactorEnabled;
  const isBusy =
    passwordForm.formState.isSubmitting ||
    otpForm.formState.isSubmitting ||
    disableTwoFactor.isPending ||
    enableTwoFactor.isPending ||
    verifyTotp.isPending;

  const onSubmitPassword = (value: z.infer<typeof twoFactorPasswordSchema>) => {
    if (isTwoFactorEnabled) {
      // Disable 2FA
      disableTwoFactor.mutate(
        { password: value.password },
        {
          onSuccess: () => {
            toast.success(t("SETTINGS_SECURITY_2FA_DISABLED"));
            onOpenChange(false);
            passwordForm.reset();
          },
          onError: (error: Error) => {
            toast.error(
              error.message || t("SETTINGS_SECURITY_2FA_FAILED_ENABLE")
            );
          },
        }
      );
    } else if (showQrCode) {
      // Get QR code
      getTotpUri.mutate(
        { password: value.password },
        {
          onSuccess: (data: { data?: { totpURI?: string } }) => {
            setTotpUri(data.data?.totpURI || "");
            passwordForm.reset();
          },
          onError: (error: Error) => {
            toast.error(error.message || t("SETTINGS_SECURITY_2FA_FAILED_QR"));
          },
        }
      );
    } else {
      // Enable 2FA - first step
      enableTwoFactor.mutate(
        { password: value.password },
        {
          onSuccess: (data: { data?: { totpURI?: string } }) => {
            setTotpUri(data.data?.totpURI || "");
            setShowQrCode(true);
          },
          onError: (error: Error) => {
            toast.error(
              error.message || t("SETTINGS_SECURITY_2FA_FAILED_ENABLE")
            );
          },
        }
      );
    }
  };

  const onSubmitOtp = (value: z.infer<typeof otpSchema>) => {
    verifyTotp.mutate(
      { code: value.otp },
      {
        onSuccess: () => {
          toast.success(t("SETTINGS_SECURITY_2FA_ENABLED"));
          setShowQrCode(false);
          setTotpUri("");
          onOpenChange(false);
          otpForm.reset();
        },
        onError: (error: Error) => {
          toast.error(error.message || t("SETTINGS_SECURITY_2FA_INVALID_OTP"));
          otpForm.setValue("otp", "");
        },
      }
    );
  };

  const handleReset = () => {
    setShowQrCode(false);
    setTotpUri("");
    passwordForm.reset();
    otpForm.reset();
  };

  const buttonLabel = isTwoFactorEnabled ? t("DISABLE_2FA") : t("ENABLE_2FA");
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="w-11/12 sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{buttonLabel}</DialogTitle>
          <DialogDescription>
            {isTwoFactorEnabled
              ? t("SETTINGS_SECURITY_2FA_DISABLE_DESC")
              : t("SETTINGS_SECURITY_2FA_ENABLE_DESC")}
          </DialogDescription>
        </DialogHeader>

        {showQrCode && totpUri !== "" ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-center">
              <QrCode value={totpUri} />
            </div>
            <Label>{t("SETTINGS_SECURITY_2FA_SCAN_QR")}</Label>
            <FormProvider {...otpForm}>
              <form onSubmit={otpForm.handleSubmit(onSubmitOtp)}>
                <Controller
                  control={otpForm.control}
                  name="otp"
                  render={({ field, fieldState }) => (
                    <Field
                      className="items-center space-y-4"
                      data-invalid={fieldState.invalid}
                    >
                      <FieldLabel className="block text-center" htmlFor="otp">
                        {t("ENTER_6_DIGIT_CODE")}
                      </FieldLabel>
                      <div className="flex justify-center">
                        <InputOTP
                          aria-invalid={fieldState.invalid}
                          id="otp"
                          maxLength={6}
                          {...field}
                        >
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                      <FieldError errors={[fieldState.error]} />
                    </Field>
                  )}
                />
                <Button className="mt-4 w-full" disabled={isBusy} type="submit">
                  {isBusy ? (
                    <>
                      <Spinner className="mr-2 size-4" />
                      {t("VERIFY")}
                    </>
                  ) : (
                    t("SETTINGS_SECURITY_2FA_VERIFY_CODE")
                  )}
                </Button>
              </form>
            </FormProvider>
          </div>
        ) : (
          <FormProvider {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onSubmitPassword)}>
              <Controller
                control={passwordForm.control}
                name="password"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="twoFactorPassword">
                      {t("PASSWORD")}
                    </FieldLabel>
                    <Input
                      aria-invalid={fieldState.invalid}
                      autoComplete="current-password"
                      id="twoFactorPassword"
                      placeholder={t("ENTER_YOUR_PASSWORD")}
                      type="password"
                      {...field}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
              <DialogFooter>
                <Button
                  disabled={isBusy}
                  onClick={handleReset}
                  type="button"
                  variant="outline"
                >
                  {t("CANCEL")}
                </Button>
                <Button disabled={isBusy} type="submit">
                  {isBusy ? (
                    <>
                      <Spinner className="mr-2 size-4" />
                      {buttonLabel}
                    </>
                  ) : (
                    buttonLabel
                  )}
                </Button>
              </DialogFooter>
            </form>
          </FormProvider>
        )}
      </DialogContent>
    </Dialog>
  );
}
