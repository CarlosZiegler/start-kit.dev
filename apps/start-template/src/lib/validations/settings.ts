import { z } from "zod";

import { emailSchema, passwordSchema } from "./shared";

export const profileSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters"),
  email: emailSchema,
});

export const avatarUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine(
      (file) => file.size <= 5 * 1024 * 1024, // 5MB limit
      "File size must be less than 5MB"
    )
    .refine(
      (file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type),
      "File must be a JPEG, PNG, or WebP image"
    ),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const passkeySchema = z.object({
  name: z
    .string()
    .min(1, "Passkey name is required")
    .max(50, "Name must be less than 50 characters"),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
export type AvatarUploadFormData = z.infer<typeof avatarUploadSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type PasskeyFormData = z.infer<typeof passkeySchema>;
