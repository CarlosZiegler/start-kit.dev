import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { Button, buttonVariants } from "@/components/ui/button";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth/auth-client";
import {
  type ResetPasswordFormData,
  resetPasswordSchema,
} from "@/lib/validations/auth";

const searchSchema = z.object({
  token: z.string().optional(),
});

export const Route = createFileRoute("/(auth)/reset-password")({
  component: RouteComponent,
  validateSearch: zodValidator(searchSchema),
});

function RouteComponent() {
  const { t } = useTranslation();
  const resetPassword = useMutation({
    mutationFn: async ({ newPassword, token }: ResetPasswordFormData) => {
      const result = await authClient.resetPassword({
        newPassword,
        token,
      });
      if (result.error) {
        throw new Error(result.error.message || "Failed to reset password", {
          cause: result.error,
        });
      }
      return result;
    },
  });
  const search = useSearch({ from: Route.id });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  const form = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmNewPassword: "",
      token: search.token || "",
    },
  });

  const onSubmit = (data: ResetPasswordFormData) => {
    resetPassword.mutate(data, {
      onSuccess: () => {
        setSuccess(true);
      },
    });
  };

  if (success) {
    return (
      <>
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            {/** biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M5 13l4 4L19 7"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          </div>
          <CardTitle className="font-bold text-2xl">
            {t("RESET_PASSWORD_SUCCESS")}
          </CardTitle>
          <CardDescription className="text-base">
            {t("RESET_PASSWORD_UPDATED")}
          </CardDescription>
        </CardHeader>

        <div className="space-y-4">
          <div className="text-center text-muted-foreground text-sm">
            <p>{t("RESET_PASSWORD_CAN_SIGN_IN")}</p>
          </div>

          <Link
            className={buttonVariants({ className: "w-full" })}
            to="/sign-in"
          >
            {t("SIGN_IN")}
          </Link>
        </div>
      </>
    );
  }

  if (!search.token) {
    return (
      <>
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="font-bold text-2xl">
            {t("RESET_PASSWORD_INVALID_LINK")}
          </CardTitle>
          <CardDescription>{t("RESET_PASSWORD_LINK_EXPIRED")}</CardDescription>
        </CardHeader>

        <div className="space-y-4">
          <Link
            className={buttonVariants({
              variant: "outline",
              className: "w-full",
            })}
            to="/forgot-password"
          >
            {t("RESET_PASSWORD_REQUEST_NEW")}
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <CardHeader className="space-y-2 text-center">
        <CardTitle className="font-bold text-2xl">
          {t("RESET_PASSWORD_TITLE")}
        </CardTitle>
        <CardDescription>{t("RESET_PASSWORD_ENTER_NEW")}</CardDescription>
      </CardHeader>

      <div className="space-y-6">
        <FormProvider {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <Controller
              control={form.control}
              name="newPassword"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="newPassword">
                    {t("RESET_PASSWORD_NEW_PASSWORD")}
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      aria-invalid={fieldState.invalid}
                      autoComplete="new-password"
                      id="newPassword"
                      placeholder={t("RESET_PASSWORD_ENTER_NEW_PASSWORD")}
                      type={showPassword ? "text" : "password"}
                      {...field}
                    />
                    <InputGroupButton
                      onClick={() => setShowPassword(!showPassword)}
                      size="icon-sm"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </InputGroupButton>
                  </InputGroup>
                  <FieldDescription>
                    {t("SIGN_UP_PASSWORD_REQUIREMENTS")}
                  </FieldDescription>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="confirmNewPassword"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="confirmNewPassword">
                    {t("RESET_PASSWORD_CONFIRM_NEW")}
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      aria-invalid={fieldState.invalid}
                      autoComplete="new-password"
                      id="confirmNewPassword"
                      placeholder={t("RESET_PASSWORD_CONFIRM_NEW_PASSWORD")}
                      type={showConfirmPassword ? "text" : "password"}
                      {...field}
                    />
                    <InputGroupButton
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      size="icon-sm"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </InputGroupButton>
                  </InputGroup>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            {resetPassword.error && (
              <div className="text-destructive text-sm">
                {resetPassword.error.message}
              </div>
            )}

            <Button
              className="w-full"
              disabled={resetPassword.isPending}
              type="submit"
            >
              {resetPassword.isPending ? (
                <>
                  <Spinner className="mr-2" />
                  {t("RESET_PASSWORD_RESETTING")}
                </>
              ) : (
                t("RESET_PASSWORD_TITLE")
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
