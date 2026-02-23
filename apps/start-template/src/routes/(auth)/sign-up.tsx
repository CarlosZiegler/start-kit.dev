import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Button, buttonVariants } from "@/components/ui/button";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth/auth-client";
import { type SignUpFormData, signUpSchema } from "@/lib/validations/auth";
import { DEFAULT_SITE_NAME, seo } from "@/utils/seo";

export const Route = createFileRoute("/(auth)/sign-up")({
  head: () => {
    const { meta, links } = seo({
      title: `Sign Up - ${DEFAULT_SITE_NAME}`,
      description: "Create your Start Kit account.",
      url: "/sign-up",
      canonicalUrl: "/sign-up",
      image: "/images/landing/hero-bg.png",
    });

    return { meta, links };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const signUp = useMutation({
    mutationFn: async ({
      email,
      password,
      name,
    }: {
      email: string;
      password: string;
      name: string;
    }) => {
      const result = await authClient.signUp.email({ email, password, name });
      if (result.error) {
        throw new Error(t("SIGN_UP_GENERIC_ERROR"), {
          cause: result.error,
        });
      }
      return result;
    },
    onSuccess() {
      navigate({ to: "/sign-in" });
    },
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  const onSubmit = (data: SignUpFormData) => {
    signUp.mutate({
      name: data.name,
      email: data.email,
      password: data.password,
    });
  };

  return (
    <>
      <CardHeader className="space-y-2 text-center">
        <CardTitle className="font-bold text-2xl">
          {t("SIGN_UP_CREATE_ACCOUNT")}
        </CardTitle>
        <CardDescription>{t("SIGN_UP_GET_STARTED")}</CardDescription>
      </CardHeader>

      <div className="space-y-6">
        <FormProvider {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <Controller
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="name">
                    {t("SIGN_UP_FULL_NAME")}
                  </FieldLabel>
                  <Input
                    aria-invalid={fieldState.invalid}
                    autoComplete="name"
                    id="name"
                    placeholder={t("SIGN_UP_ENTER_FULL_NAME")}
                    {...field}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

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
                      autoComplete="new-password"
                      id="password"
                      placeholder={t("SIGN_UP_CREATE_PASSWORD")}
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
              name="confirmPassword"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="confirmPassword">
                    {t("CONFIRM_PASSWORD")}
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      aria-invalid={fieldState.invalid}
                      autoComplete="new-password"
                      id="confirmPassword"
                      placeholder={t("SIGN_UP_CONFIRM_YOUR_PASSWORD")}
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

            <Controller
              control={form.control}
              name="acceptTerms"
              render={({ field, fieldState }) => (
                <Field
                  className="items-start gap-3"
                  data-invalid={fieldState.invalid}
                  orientation="horizontal"
                >
                  <Checkbox
                    aria-invalid={fieldState.invalid}
                    checked={field.value}
                    className="mt-0.5 shrink-0"
                    id="acceptTerms"
                    onCheckedChange={field.onChange}
                  />
                  <FieldContent className="flex-1">
                    <FieldLabel
                      className="cursor-pointer font-normal text-sm leading-normal"
                      htmlFor="acceptTerms"
                    >
                      <span className="inline">
                        {t("SIGN_UP_ACCEPT_TERMS")}{" "}
                        <Link
                          className="text-primary underline-offset-4 hover:underline"
                          rel="noopener"
                          target="_blank"
                          to="/terms"
                        >
                          {t("SIGN_UP_TERMS_OF_SERVICE")}
                        </Link>{" "}
                        {t("SIGN_UP_AND")}{" "}
                        <Link
                          className="text-primary underline-offset-4 hover:underline"
                          rel="noopener"
                          target="_blank"
                          to="/privacy"
                        >
                          {t("SIGN_UP_PRIVACY_POLICY")}
                        </Link>
                      </span>
                    </FieldLabel>
                    <FieldError errors={[fieldState.error]} />
                  </FieldContent>
                </Field>
              )}
            />

            {signUp.error && (
              <div className="text-destructive text-sm">
                {signUp.error.message}
              </div>
            )}

            <Button
              className="w-full"
              disabled={signUp.isPending}
              type="submit"
            >
              {signUp.isPending ? (
                <>
                  <Spinner className="mr-2" />
                  {t("SIGN_UP_CREATING_ACCOUNT")}
                </>
              ) : (
                t("SIGN_UP_CREATE_ACCOUNT")
              )}
            </Button>
          </form>
        </FormProvider>

        <div className="text-center text-sm">
          {t("SIGN_UP_ALREADY_HAVE_ACCOUNT")}{" "}
          <Link
            className={buttonVariants({ variant: "link", className: "px-0" })}
            to="/sign-in"
          >
            {t("SIGN_UP_SIGN_IN")}
          </Link>
        </div>
      </div>
    </>
  );
}
