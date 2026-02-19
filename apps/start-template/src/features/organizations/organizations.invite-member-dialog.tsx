"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { inviteMemberOptions } from "@/features/organizations/organizations.factory.mutations";
import { organizationInvitationsOptions } from "@/features/organizations/organizations.factory.queries";

const inviteMemberSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  role: z.enum(["admin", "member", "owner"] as const, {
    message: "Please select a role",
  }),
});

type InviteMemberFormData = z.infer<typeof inviteMemberSchema>;

type InviteMemberDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId?: string;
};

export function InviteMemberDialog({
  open,
  onOpenChange,
  organizationId,
}: InviteMemberDialogProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const form = useForm<InviteMemberFormData>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      email: "",
      role: "member",
    },
  });

  const inviteMemberMutation = useMutation({
    ...inviteMemberOptions(),
    onSuccess: (data) => {
      // Invitation sent successfully
      // Invalidate org invitations
      if (data.data?.organizationId) {
        queryClient.invalidateQueries({
          queryKey: organizationInvitationsOptions(data.data.organizationId)
            .queryKey,
        });
      }
      toast.success(t("ORG_INVITATION_SENT"));
      form.reset();
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(
        `${t("ORG_INVITATION_SEND_FAILED")}${error.message || t("COMMON_UNKNOWN_ERROR")}`
      );
    },
  });

  const onSubmit = (data: InviteMemberFormData) => {
    inviteMemberMutation.mutate({
      email: data.email,
      role: data.role,
      organizationId,
      resend: false,
    });
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("INVITE_MEMBER")}</DialogTitle>
          <DialogDescription>{t("INVITE_MEMBER_DESC")}</DialogDescription>
        </DialogHeader>

        <FormProvider {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <Controller
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="inviteEmail">{t("EMAIL")}</FieldLabel>
                  <Input
                    aria-invalid={fieldState.invalid}
                    autoComplete="email"
                    id="inviteEmail"
                    placeholder={t("ORG_EMAIL_PLACEHOLDER")}
                    type="email"
                    {...field}
                  />
                  <FieldDescription>
                    {t("ORG_INVITE_EMAIL_DESC")}
                  </FieldDescription>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="role"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="inviteRole">{t("ROLE")}</FieldLabel>
                  <Select
                    defaultValue={field.value}
                    onValueChange={(value) => {
                      if (value) {
                        field.onChange(value);
                      }
                    }}
                    value={field.value}
                  >
                    <SelectTrigger
                      aria-invalid={fieldState.invalid}
                      id="inviteRole"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="owner">{t("OWNER")}</SelectItem>
                      <SelectItem value="member">{t("MEMBER")}</SelectItem>
                      <SelectItem value="admin">{t("ADMIN")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldDescription>
                    {t("ORG_SELECT_ROLE_DESC")}
                  </FieldDescription>
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
                <Button disabled={inviteMemberMutation.isPending} type="submit">
                  {inviteMemberMutation.isPending ? (
                    <>
                      <Spinner className="mr-2" />
                      {t("SENDING")}
                    </>
                  ) : (
                    t("INVITE")
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
