"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  type ProfileFormData,
  profileSchema,
} from "@/lib/validations/settings";
import { orpc } from "@/orpc/orpc-client";

export function ProfileSection() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const session = authClient.useSession();
  const user = session.data?.user;
  const refetchSession = session.refetch;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const avatarQuery = useQuery({
    ...orpc.profile.getAvatarUrl.queryOptions({ input: { userId: user?.id } }),
    enabled: !!user?.id,
  });

  // Add timestamp to bust browser cache
  const avatarUrl = avatarQuery.data?.imageUrl ?? null;

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
    },
  });

  const updateProfile = useMutation(
    orpc.profile.update.mutationOptions({
      onSuccess: () => {
        refetchSession();
      },
    })
  );

  const uploadAvatar = useMutation(
    orpc.profile.uploadAvatar.mutationOptions({
      onSuccess: async () => {
        // Invalidate and refetch avatar query
        await queryClient.invalidateQueries({
          queryKey: ["profile", "getAvatarUrl"],
        });
        await avatarQuery.refetch();
        refetchSession();
      },
    })
  );

  const removeAvatar = useMutation(
    orpc.profile.removeAvatar.mutationOptions({
      onSuccess: () => {
        avatarQuery.refetch();
        refetchSession();
      },
    })
  );

  const onSubmit = (data: ProfileFormData) => {
    updateProfile.mutate(data);
  };

  const handleRemoveAvatar = () => {
    removeAvatar.mutate({});
  };

  return (
    <div className="space-y-6 px-4">
      <div>
        <h1 className="text-balance font-semibold text-2xl">
          {t("SETTINGS_PROFILE_TITLE")}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {t("SETTINGS_PROFILE_DESC")}
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                {avatarUrl ? (
                  <img
                    alt="User avatar"
                    className="h-20 w-20 rounded-full object-cover"
                    height={80}
                    src={avatarUrl}
                    width={80}
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted font-medium text-lg text-muted-foreground">
                    {user?.name
                      ?.split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .toUpperCase() || "U"}
                  </div>
                )}
                <DropdownMenu
                  onOpenChange={setIsDropdownOpen}
                  open={isDropdownOpen}
                >
                  <DropdownMenuTrigger
                    render={
                      <Button
                        className="absolute -right-1 -bottom-1 h-8 w-8 rounded-full p-0"
                        disabled={
                          uploadAvatar.isPending || removeAvatar.isPending
                        }
                        size="sm"
                        variant="secondary"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    }
                  />
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem
                      onClick={() => {
                        setIsDropdownOpen(false);
                        fileInputRef.current?.click();
                      }}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {t("SETTINGS_PROFILE_CHANGE")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      disabled={!avatarQuery.data?.imageUrl}
                      onClick={() => {
                        setIsDropdownOpen(false);
                        handleRemoveAvatar();
                      }}
                    >
                      <X className="mr-2 h-4 w-4" />
                      {removeAvatar.isPending
                        ? t("SETTINGS_PROFILE_REMOVING")
                        : t("SETTINGS_PROFILE_DELETE")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <input
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  disabled={uploadAvatar.isPending || removeAvatar.isPending}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      uploadAvatar.mutate({ file });
                      event.target.value = "";
                    }
                  }}
                  ref={fileInputRef}
                  type="file"
                />
              </div>
              <div className="flex gap-2" />
            </div>

            <FormProvider {...form}>
              <form
                className="space-y-4"
                onSubmit={form.handleSubmit(onSubmit)}
              >
                <Controller
                  control={form.control}
                  name="name"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="name">{t("NAME")}</FieldLabel>
                      <Input
                        aria-invalid={fieldState.invalid}
                        autoComplete="name"
                        id="name"
                        placeholder={t("SETTINGS_PROFILE_ENTER_NAME")}
                        {...field}
                      />
                      <FieldDescription>
                        {t("SETTINGS_PROFILE_NAME_DESC")}
                      </FieldDescription>
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
                        placeholder={t("SETTINGS_PROFILE_ENTER_EMAIL")}
                        type="email"
                        {...field}
                      />
                      <FieldDescription>
                        {t("SETTINGS_PROFILE_EMAIL_DESC")}
                      </FieldDescription>
                      <FieldError errors={[fieldState.error]} />
                    </Field>
                  )}
                />

                <div className="flex justify-end">
                  <Button disabled={updateProfile.isPending} type="submit">
                    {updateProfile.isPending && <Spinner className="mr-2" />}
                    {t("SETTINGS_PROFILE_SAVE_CHANGES")}
                  </Button>
                </div>
              </form>
            </FormProvider>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
