import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Key } from "lucide-react";
import { useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Button, buttonVariants } from "@/components/ui/button";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth/auth-client";
import { type SignInFormData, signInSchema } from "@/lib/validations/auth";
import { DEFAULT_SITE_NAME, seo } from "@/utils/seo";

export const Route = createFileRoute("/(auth)/sign-in")({
  head: () => {
    const { meta, links } = seo({
      title: `Sign In - ${DEFAULT_SITE_NAME}`,
      description: "Sign in to your Start Kit account.",
      url: "/sign-in",
      canonicalUrl: "/sign-in",
      image: "/images/landing/hero-bg.png",
    });

    return { meta, links };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const loginWithCredentials = useMutation({
    mutationFn: async ({ email, password, rememberMe }: SignInFormData) => {
      const result = await authClient.signIn.email({
        email,
        password,
        rememberMe,
        callbackURL: "/overview",
      });
      if (result.error) {
        throw new Error(t("SIGN_IN_GENERIC_ERROR"), {
          cause: result.error,
        });
      }
      return result;
    },
    onSuccess(response) {
      if (
        response?.data &&
        "twoFactorRedirect" in response.data &&
        response?.data?.twoFactorRedirect
      ) {
        navigate({ to: "/two-factor/otp" });
        return;
      }
      if (response?.data?.user?.id) {
        navigate({ to: "/overview" });
      }
    },
  });
  const loginWithPasskey = useMutation({
    mutationFn: async () => {
      const result = await authClient.signIn.passkey();
      if (result?.error) {
        throw new Error(
          result.error.message || "Passkey authentication failed",
          {
            cause: result.error,
          }
        );
      }
      return result;
    },
    onSuccess: () => {
      navigate({ to: "/overview" });
    },
  });

  const form = useForm({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = (data: SignInFormData) => {
    loginWithCredentials.mutate(data);
  };

  return (
    <>
      <CardHeader className="space-y-2 text-center">
        <CardTitle className="font-bold text-2xl">
          {t("WELCOME_BACK")}
        </CardTitle>
        <CardDescription>{t("SIGN_IN_TO_CONTINUE")}</CardDescription>
      </CardHeader>

      <div className="space-y-6">
        {/* Email/Password Form */}
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

            <Controller
              control={form.control}
              name="password"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="password">{t("PASSWORD")}</FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      aria-invalid={fieldState.invalid}
                      autoComplete="current-password"
                      id="password"
                      placeholder={t("ENTER_YOUR_PASSWORD")}
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
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <div className="flex items-center justify-between">
              <Controller
                control={form.control}
                name="rememberMe"
                render={({ field }) => (
                  <Field orientation="horizontal">
                    <Checkbox
                      checked={field.value}
                      id="rememberMe"
                      onCheckedChange={field.onChange}
                    />
                    <FieldContent>
                      <FieldLabel
                        className="font-normal text-sm"
                        htmlFor="rememberMe"
                      >
                        {t("REMEMBER_ME")}
                      </FieldLabel>
                    </FieldContent>
                  </Field>
                )}
              />

              <Link
                className={buttonVariants({
                  variant: "link",
                  className: "px-0",
                })}
                to="/forgot-password"
              >
                {t("FORGOT_YOUR_PASSWORD")}
              </Link>
            </div>

            {loginWithCredentials.error && (
              <div className="text-destructive text-sm">
                {loginWithCredentials.error.message}
              </div>
            )}

            <Button
              className="w-full"
              disabled={loginWithCredentials.isPending}
              type="submit"
            >
              {loginWithCredentials.isPending ? (
                <>
                  <Spinner className="mr-2" />
                  {t("SIGNING_IN")}
                </>
              ) : (
                t("SIGN_IN")
              )}
            </Button>
          </form>
        </FormProvider>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="px-2 text-muted-foreground">
              {t("OR_CONTINUE_WITH")}
            </span>
          </div>
        </div>

        {/* Alternative Login Methods */}
        <div className="mt-4 flex w-full flex-col gap-2">
          <Button
            className="w-full gap-2"
            onClick={() => {
              loginWithPasskey.mutate();
            }}
            variant="secondary"
          >
            <Key size={16} />
            {t("SIGN_IN_WITH_PASSKEY")}
            {loginWithPasskey.isPending && <Spinner />}
          </Button>
          {/* <Button
            className="w-full gap-2"
            onClick={() => {
              navigate({ to: "/magic-link" });
            }}
            variant="secondary"
          >
            <Mail className="mr-2 h-4 w-4" />
            {t("CONTINUE_WITH_MAGIC_LINK")}
          </Button> */}
        </div>

        <div className="text-center text-sm">
          {t("DONT_HAVE_ACCOUNT")}{" "}
          <Link
            className={buttonVariants({ variant: "link", className: "px-0" })}
            to="/sign-up"
          >
            {t("SIGN_UP_LINK")}
          </Link>
        </div>
      </div>
    </>
  );
}
