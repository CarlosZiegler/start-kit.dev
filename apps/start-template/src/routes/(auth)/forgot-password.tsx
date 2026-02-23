import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Mail } from "lucide-react";
import { useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Button, buttonVariants } from "@/components/ui/button";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth/auth-client";
import {
  type ForgotPasswordFormData,
  forgotPasswordSchema,
} from "@/lib/validations/auth";

export const Route = createFileRoute("/(auth)/forgot-password")({
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslation();
  const forgotPassword = useMutation({
    mutationFn: async ({ email }: ForgotPasswordFormData) => {
      await authClient.requestPasswordReset({ email });
      return { success: true };
    },
  });
  const [emailSent, setEmailSent] = useState(false);

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (data: ForgotPasswordFormData) => {
    forgotPassword.mutate(data, {
      onSettled: () => {
        setEmailSent(true);
      },
    });
  };

  if (emailSent) {
    return (
      <>
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <Mail className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="font-bold text-2xl">
            {t("FORGOT_PASSWORD_CHECK_EMAIL")}
          </CardTitle>
          <CardDescription className="text-base">
            {t("FORGOT_PASSWORD_RESET_LINK_SENT")}{" "}
            <span className="font-medium">{form.getValues("email")}</span>
          </CardDescription>
        </CardHeader>

        <div className="space-y-4">
          <div className="text-center text-muted-foreground text-sm">
            <p>{t("FORGOT_PASSWORD_RESET_INSTRUCTIONS")}</p>
            <p className="mt-2">
              {t("FORGOT_PASSWORD_DIDNT_RECEIVE")}{" "}
              <Button
                className="px-0 text-sm"
                onClick={() => setEmailSent(false)}
                variant="link"
              >
                {t("FORGOT_PASSWORD_TRY_AGAIN")}
              </Button>
            </p>
          </div>

          <Button
            className="w-full"
            onClick={() => setEmailSent(false)}
            variant="outline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("FORGOT_PASSWORD_BACK")}
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <CardHeader className="space-y-2 text-center">
        <CardTitle className="font-bold text-2xl">
          {t("FORGOT_PASSWORD_TITLE")}
        </CardTitle>
        <CardDescription>{t("FORGOT_PASSWORD_ENTER_EMAIL")}</CardDescription>
      </CardHeader>

      <div className="space-y-6">
        <FormProvider {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <Controller
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="email">{t("EMAIL")}</FieldLabel>
                  <Input
                    aria-invalid={fieldState.invalid}
                    autoComplete="email"
                    id="email"
                    placeholder={t("ENTER_YOUR_EMAIL")}
                    type="email"
                    {...field}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            {forgotPassword.error && (
              <div className="text-destructive text-sm">
                {forgotPassword.error.message}
              </div>
            )}

            <Button
              className="w-full"
              disabled={forgotPassword.isPending}
              type="submit"
            >
              {forgotPassword.isPending ? (
                <>
                  <Spinner className="mr-2" />
                  {t("FORGOT_PASSWORD_SENDING")}
                </>
              ) : (
                t("FORGOT_PASSWORD_SEND_LINK")
              )}
            </Button>
          </form>
        </FormProvider>

        <div className="text-center text-sm">
          <Link
            className={buttonVariants({ variant: "link", className: "px-0" })}
            to="/sign-in"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("FORGOT_PASSWORD_BACK_TO_SIGN_IN")}
          </Link>
        </div>
      </div>
    </>
  );
}
