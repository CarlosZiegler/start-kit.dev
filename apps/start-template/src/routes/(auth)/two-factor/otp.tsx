import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Shield } from "lucide-react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Button, buttonVariants } from "@/components/ui/button";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth/auth-client";
import {
  type OTPVerificationFormData,
  otpVerificationSchema,
} from "@/lib/validations/auth";

export const Route = createFileRoute("/(auth)/two-factor/otp")({
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const verifyTotp = useMutation({
    mutationFn: async ({ code }: OTPVerificationFormData) => {
      const result = await authClient.twoFactor.verifyTotp({ code });
      if (result.error) {
        throw new Error(result.error.message || "Invalid TOTP code", {
          cause: result.error,
        });
      }
      return result;
    },
    onSuccess: () => {
      setTimeout(() => {
        navigate({ to: "/overview" });
      }, 150);
    },
  });

  const form = useForm<OTPVerificationFormData>({
    resolver: zodResolver(otpVerificationSchema),
    defaultValues: {
      code: "",
    },
  });

  const onSubmit = (data: OTPVerificationFormData) => {
    verifyTotp.mutate({ code: data.code });
  };

  return (
    <>
      <CardHeader className="space-y-2 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
          <Shield className="h-6 w-6 text-blue-600" />
        </div>
        <CardTitle className="font-bold text-2xl">
          {t("TWO_FACTOR_VERIFICATION")}
        </CardTitle>
        <CardDescription>{t("2FA_OTP_DESCRIPTION")}</CardDescription>
      </CardHeader>

      <div className="space-y-6">
        <div className="space-y-4 text-center">
          <p className="text-muted-foreground text-sm">{t("OTP_METHODS")}</p>
        </div>

        <FormProvider {...form}>
          <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            <Controller
              control={form.control}
              name="code"
              render={({ field, fieldState }) => (
                <Field
                  className="w-full items-center justify-center space-y-4"
                  data-invalid={fieldState.invalid}
                >
                  <FieldLabel className="block text-center" htmlFor="otpCode">
                    {t("ENTER_6_DIGIT_CODE")}
                  </FieldLabel>
                  <div className="flex justify-center">
                    <InputOTP
                      aria-invalid={fieldState.invalid}
                      id="otpCode"
                      maxLength={6}
                      {...field}
                      onChange={(newValue) => {
                        form.clearErrors("code");
                        verifyTotp.reset();
                        field.onChange(newValue);
                      }}
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

            {verifyTotp.error && (
              <div className="text-center text-destructive text-sm">
                {verifyTotp.error?.message}
              </div>
            )}

            <Button
              className="w-full"
              disabled={verifyTotp.isPending}
              type="submit"
            >
              {verifyTotp.isPending ? (
                <>
                  <Spinner className="mr-2" />
                  {t("VERIFYING")}
                </>
              ) : (
                t("VERIFY")
              )}
            </Button>
          </form>
        </FormProvider>

        <div className="text-center text-sm">
          <Link
            className={buttonVariants({ variant: "link", className: "px-0" })}
            to="/two-factor"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("BACK_TO_2FA")}
          </Link>
        </div>
      </div>
    </>
  );
}
