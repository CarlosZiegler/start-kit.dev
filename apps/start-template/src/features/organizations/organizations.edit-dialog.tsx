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
import {
  checkSlugOptions,
  updateOrganizationOptions,
} from "@/features/organizations/organizations.factory.mutations";
import {
  type OrganizationFormData,
  organizationFormSchema,
} from "@/features/organizations/organizations.utils";

type EditOrganizationFormData = OrganizationFormData;

type OrganizationEditDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organization: {
    id: string;
    name: string;
    slug: string;
    logo?: string | null;
  };
};

export function OrganizationEditDialog({
  open,
  onOpenChange,
  organization,
}: OrganizationEditDialogProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const form = useForm<EditOrganizationFormData>({
    resolver: zodResolver(organizationFormSchema),
    defaultValues: {
      name: organization?.name ?? "",
      slug: organization?.slug ?? "",
      logo: organization?.logo ?? "",
    },
    values: {
      name: organization?.name ?? "",
      slug: organization?.slug ?? "",
      logo: organization?.logo ?? "",
    },
  });

  const updateMutation = useMutation({
    ...updateOrganizationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session"] });
      toast.success(t("ORG_UPDATE_SUCCESS"));
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || t("COMMON_UNKNOWN_ERROR"));
    },
  });

  const checkSlugMutation = useMutation({
    ...checkSlugOptions(),
    onSuccess: (result) => {
      if (result.data && !result.data.status) {
        form.setError("slug", {
          type: "manual",
          message: t("ORG_SLUG_TAKEN"),
        });
      } else {
        form.clearErrors("slug");
      }
    },
  });

  const onSubmit = (data: EditOrganizationFormData) => {
    updateMutation.mutate({
      organizationId: organization.id,
      data: { name: data.name, slug: data.slug, logo: data.logo || undefined },
    });
  };

  const handleSlugBlur = () => {
    const slug = form.getValues("slug");
    if (slug && slug.length >= 3 && slug !== organization.slug) {
      checkSlugMutation.mutate(slug);
    }
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2Icon className="h-5 w-5" />
            {t("ORG_EDIT_TITLE")}
          </DialogTitle>
          <DialogDescription>{t("ORG_EDIT_DESC")}</DialogDescription>
        </DialogHeader>

        <FormProvider {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <Controller
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="editOrgName">
                    {t("ORGANIZATION_NAME")}
                  </FieldLabel>
                  <Input
                    aria-invalid={fieldState.invalid}
                    autoComplete="organization"
                    id="editOrgName"
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
                  <FieldLabel htmlFor="editOrgSlug">
                    {t("ORGANIZATION_SLUG")}
                  </FieldLabel>
                  <Input
                    aria-invalid={fieldState.invalid}
                    autoComplete="off"
                    id="editOrgSlug"
                    placeholder={t("ORG_SLUG_PLACEHOLDER")}
                    {...field}
                    onBlur={handleSlugBlur}
                  />
                  <FieldDescription>
                    {t("ORG_SLUG_IDENTIFIER")}
                  </FieldDescription>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="logo"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="editOrgLogo">
                    {t("ORG_LOGO_URL_OPTIONAL")}
                  </FieldLabel>
                  <Input
                    aria-invalid={fieldState.invalid}
                    id="editOrgLogo"
                    placeholder={t("ORG_LOGO_URL_PLACEHOLDER")}
                    type="url"
                    {...field}
                  />
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
                <Button disabled={updateMutation.isPending} type="submit">
                  {updateMutation.isPending ? (
                    <>
                      <Spinner className="mr-2" />
                      {t("COMMON_SAVING")}
                    </>
                  ) : (
                    t("COMMON_SAVE_CHANGES")
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
