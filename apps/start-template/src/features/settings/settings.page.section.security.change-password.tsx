"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth/auth-client";
import {
  type ChangePasswordFormData,
  changePasswordSchema,
} from "@/lib/validations/settings";

export function ChangePasswordSection() {
  const { t } = useTranslation();
  const changePassword = useMutation({
    mutationFn: async ({
      currentPassword,
      newPassword,
    }: ChangePasswordFormData) => {
      const result = await authClient.changePassword({
        currentPassword,
        newPassword,
      });
      if (result.error) {
        throw new Error(
          result.error.message || t("SETTINGS_SECURITY_PASSWORD_CHANGE_FAILED"),
          {
            cause: result.error,
          }
        );
      }
      return result;
    },
  });

  const passwordForm = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onPasswordSubmit = (data: ChangePasswordFormData) => {
    changePassword.mutate(data, {
      onSuccess: () => {
        passwordForm.reset();
      },
      onError: (error: Error) => {
        toast.error(
          error.message || t("SETTINGS_SECURITY_PASSWORD_CHANGE_FAILED")
        );
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("SETTINGS_SECURITY_PASSWORD_TITLE")}</CardTitle>
        <CardDescription>
          {t("SETTINGS_SECURITY_PASSWORD_DESC")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormProvider {...passwordForm}>
          <form
            className="space-y-4"
            onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
          >
            <Controller
              control={passwordForm.control}
              name="currentPassword"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="currentPassword">
                    {t("CURRENT_PASSWORD")}
                  </FieldLabel>
                  <Input
                    aria-invalid={fieldState.invalid}
                    autoComplete="current-password"
                    id="currentPassword"
                    type="password"
                    {...field}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Controller
              control={passwordForm.control}
              name="newPassword"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="newPassword">
                    {t("NEW_PASSWORD")}
                  </FieldLabel>
                  <Input
                    aria-invalid={fieldState.invalid}
                    autoComplete="new-password"
                    id="newPassword"
                    type="password"
                    {...field}
                  />
                  <FieldDescription>
                    {t("SETTINGS_SECURITY_PASSWORD_MIN_LENGTH")}
                  </FieldDescription>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Controller
              control={passwordForm.control}
              name="confirmPassword"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="confirmPassword">
                    {t("CONFIRM_NEW_PASSWORD")}
                  </FieldLabel>
                  <Input
                    aria-invalid={fieldState.invalid}
                    autoComplete="new-password"
                    id="confirmPassword"
                    type="password"
                    {...field}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <div className="flex justify-end">
              <Button disabled={changePassword.isPending} type="submit">
                {changePassword.isPending && <Spinner className="mr-2" />}
                {t("SETTINGS_SECURITY_UPDATE_PASSWORD")}
              </Button>
            </div>
          </form>
        </FormProvider>
      </CardContent>
    </Card>
  );
}
