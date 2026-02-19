"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth/auth-client";

const deleteAccountSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

type DeleteAccountFormData = z.infer<typeof deleteAccountSchema>;

export function DangerZoneSection() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<DeleteAccountFormData>({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: {
      password: "",
    },
  });

  const deleteAccount = useMutation({
    mutationFn: async ({ password }: DeleteAccountFormData) => {
      const result = await authClient.deleteUser({ password });
      if (result.error) {
        throw new Error(
          result.error.message || t("SETTINGS_DELETE_ACCOUNT_FAILED")
        );
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session"] });
      toast.success(t("SETTINGS_DELETE_ACCOUNT_SUCCESS"));
      navigate({ to: "/" });
    },
    onError: (error: Error) => {
      toast.error(error.message || t("SETTINGS_DELETE_ACCOUNT_FAILED"));
    },
  });

  const onSubmit = (data: DeleteAccountFormData) => {
    deleteAccount.mutate(data);
  };

  const handleOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      form.reset();
    }
  };

  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          {t("SETTINGS_DANGER_ZONE_TITLE")}
        </CardTitle>
        <CardDescription>{t("SETTINGS_DANGER_ZONE_DESC")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">{t("SETTINGS_DELETE_ACCOUNT_TITLE")}</p>
            <p className="text-muted-foreground text-sm">
              {t("SETTINGS_DELETE_ACCOUNT_DESC")}
            </p>
          </div>
          <Button
            onClick={() => setIsDialogOpen(true)}
            type="button"
            variant="destructive"
          >
            {t("SETTINGS_DELETE_ACCOUNT_BUTTON")}
          </Button>
        </div>
      </CardContent>

      <Dialog onOpenChange={handleOpenChange} open={isDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              {t("SETTINGS_DELETE_ACCOUNT_MODAL_TITLE")}
            </DialogTitle>
            <DialogDescription>
              {t("SETTINGS_DELETE_ACCOUNT_MODAL_DESC")}
            </DialogDescription>
          </DialogHeader>

          <FormProvider {...form}>
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
              <Controller
                control={form.control}
                name="password"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      {t("SETTINGS_DELETE_ACCOUNT_PASSWORD_LABEL")}
                    </FieldLabel>
                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      autoComplete="current-password"
                      id={field.name}
                      type="password"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <DialogFooter>
                <Button
                  onClick={() => handleOpenChange(false)}
                  type="button"
                  variant="outline"
                >
                  {t("CANCEL")}
                </Button>
                <Button
                  disabled={deleteAccount.isPending}
                  type="submit"
                  variant="destructive"
                >
                  {deleteAccount.isPending && <Spinner className="mr-2" />}
                  {deleteAccount.isPending
                    ? t("SETTINGS_DELETE_ACCOUNT_DELETING")
                    : t("SETTINGS_DELETE_ACCOUNT_BUTTON")}
                </Button>
              </DialogFooter>
            </form>
          </FormProvider>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
