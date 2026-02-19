"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Building2Icon } from "lucide-react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { createOrganizationOptions } from "@/features/organizations/organizations.factory.mutations";
import {
  type OrganizationFormData,
  organizationFormSchema,
} from "@/features/organizations/organizations.utils";

type CreateOrganizationFormData = OrganizationFormData;

type OrganizationCreateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function OrganizationCreateDialog({
  open,
  onOpenChange,
}: OrganizationCreateDialogProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const form = useForm<CreateOrganizationFormData>({
    resolver: zodResolver(organizationFormSchema),
    defaultValues: {
      name: "",
      slug: "",
      logo: "",
    },
  });

  const createOrganizationMutation = useMutation({
    ...createOrganizationOptions(),
    onSuccess: () => {
      // Invalidate Better Auth hooks
      queryClient.invalidateQueries({ queryKey: ["session"] });
      toast.success(t("ORG_CREATE_SUCCESS"));
      form.reset();
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(
        `${t("ORG_CREATE_FAILED")}${error.message || t("COMMON_UNKNOWN_ERROR")}`
      );
    },
  });

  const onSubmit = (data: CreateOrganizationFormData) => {
    createOrganizationMutation.mutate(data);
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2Icon className="h-5 w-5" />
            {t("ORG_CREATE_NEW")}
          </DialogTitle>
          <DialogDescription>{t("ORG_CREATE_DESC")}</DialogDescription>
        </DialogHeader>

        <FormProvider {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <Controller
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="orgName">
                    {t("ORGANIZATION_NAME")}
                  </FieldLabel>
                  <Input
                    aria-invalid={fieldState.invalid}
                    autoComplete="organization"
                    id="orgName"
                    placeholder={t("ORG_NAME_PLACEHOLDER")}
                    {...field}
                  />
                  <FieldDescription>{t("ORG_NAME_DESC")}</FieldDescription>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="slug"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="orgSlug">
                    {t("ORGANIZATION_SLUG")}
                  </FieldLabel>
                  <Input
                    aria-invalid={fieldState.invalid}
                    autoComplete="off"
                    id="orgSlug"
                    placeholder={t("ORG_SLUG_PLACEHOLDER")}
                    {...field}
                  />
                  <FieldDescription>{t("ORG_SLUG_DESC")}</FieldDescription>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="logo"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="orgLogo">
                    {t("ORG_LOGO_URL_OPTIONAL")}
                  </FieldLabel>
                  <Input
                    aria-invalid={fieldState.invalid}
                    id="orgLogo"
                    placeholder={t("ORG_LOGO_URL_PLACEHOLDER")}
                    type="url"
                    {...field}
                  />
                  <FieldDescription>{t("ORG_LOGO_URL_DESC")}</FieldDescription>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <DialogFooter>
              <ButtonGroup>
                <Button
                  onClick={() => onOpenChange(false)}
                  type="button"
                  variant="outline"
                >
                  {t("CANCEL")}
                </Button>
                <Button
                  disabled={createOrganizationMutation.isPending}
                  type="submit"
                >
                  {createOrganizationMutation.isPending ? (
                    <>
                      <Spinner className="mr-2" />
                      {t("CREATING")}
                    </>
                  ) : (
                    t("CREATE")
                  )}
                </Button>
              </ButtonGroup>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
