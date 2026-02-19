import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import * as React from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Button, buttonVariants } from "@/components/ui/button";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth/auth-client";
import { signInWithMagicLinkSchema } from "@/lib/validations/auth";

export const Route = createFileRoute("/(auth)/magic-link")({
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslation();
  const magicLink = useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      const result = await authClient.signIn.magicLink({
        email,
        callbackURL: "/overview",
      });
      if (result.error) {
        throw new Error(result.error.message || "Failed to send magic link", {
          cause: result.error,
        });
      }
      return result;
    },
  });

  const magicLinkForm = useForm({
    resolver: zodResolver(signInWithMagicLinkSchema),
    defaultValues: {
      email: "",
    },
  });

  const onMagicLinkSubmit = magicLinkForm.handleSubmit((data) => {
    magicLink.mutate(
      { email: data.email },
      {
        onSuccess: () => {
          magicLinkForm.reset();
        },
      }
    );
  });

  React.useEffect(
    () => () => {
      magicLinkForm.reset();
    },
    [magicLinkForm]
  );

  return (
    <>
      <CardHeader className="space-y-2 text-center">
        <CardTitle className="font-bold text-2xl">
          {t("CONTINUE_WITH_MAGIC_LINK")}
        </CardTitle>
        <CardDescription>{t("MAGIC_LINK_DESCRIPTION")}</CardDescription>
      </CardHeader>

      <div className="space-y-6">
        <FormProvider {...magicLinkForm}>
          <form className="space-y-4" onSubmit={onMagicLinkSubmit}>
            <Controller
              control={magicLinkForm.control}
              name="email"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="magicLinkEmail">{t("EMAIL")}</FieldLabel>
                  <Input
                    aria-invalid={fieldState.invalid}
                    autoComplete="email"
                    id="magicLinkEmail"
                    placeholder={t("ENTER_YOUR_EMAIL")}
                    type="email"
                    {...field}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            {magicLink.error && (
              <div className="text-destructive text-sm">
                {magicLink.error.message}
              </div>
            )}

            <Button
              className="w-full"
              disabled={magicLink.isPending}
              type="submit"
            >
              {magicLink.isPending ? (
                <>
                  <Spinner className="mr-2 size-4" />
                  {t("SENDING")}
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  {t("CONTINUE_WITH_MAGIC_LINK")}
                </>
              )}
            </Button>
          </form>
        </FormProvider>

        <div className="text-center text-sm">
          <Link
            className={buttonVariants({ variant: "link", className: "px-0" })}
            to="/sign-in"
          >
            {t("BACK_TO_SIGN_IN")}
          </Link>
        </div>
      </div>
    </>
  );
}
