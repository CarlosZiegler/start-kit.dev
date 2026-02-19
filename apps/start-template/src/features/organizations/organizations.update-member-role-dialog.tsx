"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const updateRoleSchema = z.object({
  role: z.enum(["admin", "member", "owner"] as const, {
    message: "Please select a role",
  }),
});

type UpdateRoleFormData = z.infer<typeof updateRoleSchema>;

type MemberData = {
  id: string;
  userId: string;
  organizationId: string;
  role: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
};

type UpdateMemberRoleDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: MemberData | null;
  onUpdateRole: (newRole: string) => void;
};

export function UpdateMemberRoleDialog({
  open,
  onOpenChange,
  member,
  onUpdateRole,
}: UpdateMemberRoleDialogProps) {
  const { t } = useTranslation();
  const form = useForm<UpdateRoleFormData>({
    resolver: zodResolver(updateRoleSchema),
    defaultValues: {
      role: member?.role as "admin" | "owner" | "member",
    },
  });

  const onSubmit = (data: UpdateRoleFormData) => {
    onUpdateRole(data.role);
  };

  if (!member) {
    return null;
  }

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("ORG_MEMBERS_UPDATE_ROLE")}</DialogTitle>
          <DialogDescription>{t("ORG_SELECT_ROLE_DESC")}</DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-3 py-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={member.user.image || undefined} />
            <AvatarFallback>
              {getInitials(member.user.name, member.user.email)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">
              {member.user.name || t("ORG_MEMBERS_NO_NAME")}
            </div>
            <div className="text-muted-foreground text-sm">
              {member.user.email}
            </div>
          </div>
        </div>

        <FormProvider {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <Controller
              control={form.control}
              name="role"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="updateRole">{t("ROLE")}</FieldLabel>
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
                      id="updateRole"
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
                <Button type="submit">{t("ORG_MEMBERS_UPDATE_ROLE")}</Button>
              </ButtonGroup>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
