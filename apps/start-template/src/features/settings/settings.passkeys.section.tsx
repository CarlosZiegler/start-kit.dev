"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Fingerprint, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import z from "zod";

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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { authClient } from "@/lib/auth/auth-client";

const addPasskeySchema = z.object({
  passkeyName: z.string().min(1, "Passkey name is required"),
});

export function PasskeysSection() {
  const { t } = useTranslation();
  const { data: passkeys } = authClient.useListPasskeys();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeletePasskey, setIsDeletePasskey] = useState<string | null>(null);

  const form = useForm<z.infer<typeof addPasskeySchema>>({
    resolver: zodResolver(addPasskeySchema),
    defaultValues: { passkeyName: "" },
  });

  const onSubmit = async (value: z.infer<typeof addPasskeySchema>) => {
    try {
      const res = await authClient.passkey.addPasskey({
        name: value.passkeyName,
      });
      if (res?.error) {
        toast.error(res.error.message);
      } else {
        setIsOpen(false);
        form.reset();
        toast.success(t("PASSKEY_ADDED_SUCCESS"));
      }
    } catch (_error) {
      toast.error(t("PASSKEY_ADD_ERROR"));
    }
  };

  const handleDeletePasskey = async (passkeyId: string) => {
    setIsDeletePasskey(passkeyId);
    try {
      await authClient.passkey.deletePasskey({
        id: passkeyId,
        fetchOptions: {
          onSuccess: () => {
            toast.success(t("PASSKEY_DELETED_SUCCESS"));
            setIsDeletePasskey(null);
          },
          onError: () => {
            toast.error(t("PASSKEY_DELETE_FAILED"));
            setIsDeletePasskey(null);
          },
        },
      });
    } catch {
      toast.error(t("PASSKEY_DELETE_FAILED"));
      setIsDeletePasskey(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("SETTINGS_SECURITY_PASSKEYS_TITLE")}</CardTitle>
        <CardDescription>
          {t("SETTINGS_SECURITY_PASSKEYS_DESC")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-sm">
              {t("SETTINGS_SECURITY_PASSKEYS_MANAGE_DESC")}
            </p>
            <Dialog onOpenChange={setIsOpen} open={isOpen}>
              <DialogTrigger>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  {t("SETTINGS_SECURITY_PASSKEYS_ADD")}
                </Button>
              </DialogTrigger>
              <DialogContent className="w-11/12 sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>
                    {t("SETTINGS_SECURITY_PASSKEYS_ADD_NEW")}
                  </DialogTitle>
                  <DialogDescription>
                    {t("SETTINGS_SECURITY_PASSKEYS_ADD_DESC")}
                  </DialogDescription>
                </DialogHeader>
                <FormProvider {...form}>
                  <form
                    className="grid gap-2"
                    onSubmit={form.handleSubmit(onSubmit)}
                  >
                    <Controller
                      control={form.control}
                      name="passkeyName"
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor="passkeyName">
                            {t("PASSKEY_NAME")}
                          </FieldLabel>
                          <Input
                            aria-invalid={fieldState.invalid}
                            id="passkeyName"
                            placeholder={t(
                              "SETTINGS_SECURITY_PASSKEYS_NAME_PLACEHOLDER"
                            )}
                            type="text"
                            {...field}
                          />
                          <FieldError errors={[fieldState.error]} />
                        </Field>
                      )}
                    />

                    <DialogFooter>
                      <Button
                        className="w-full"
                        disabled={form.formState.isSubmitting}
                        type="submit"
                      >
                        {form.formState.isSubmitting ? (
                          <>
                            <Spinner className="mr-2" />
                            {t("CREATE_PASSKEY")}
                          </>
                        ) : (
                          <>
                            <Fingerprint className="mr-2 h-4 w-4" />
                            {t("CREATE_PASSKEY")}
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </FormProvider>
              </DialogContent>
            </Dialog>
          </div>

          {passkeys && passkeys.length > 0 ? (
            <div className="space-y-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("NAME")}</TableHead>
                    <TableHead>{t("ACTIONS")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {passkeys.map((passkey: { id: string; name?: string }) => (
                    <TableRow key={passkey.id}>
                      <TableCell>
                        {passkey.name ||
                          t("SETTINGS_SECURITY_PASSKEYS_UNNAMED")}
                      </TableCell>
                      <TableCell>
                        <Button
                          disabled={isDeletePasskey === passkey.id}
                          onClick={() => handleDeletePasskey(passkey.id)}
                          size="sm"
                          variant="outline"
                        >
                          {isDeletePasskey === passkey.id ? (
                            <Spinner />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">
              {t("SETTINGS_SECURITY_PASSKEYS_NO_PASSKEYS")}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
