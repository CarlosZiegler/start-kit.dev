import { z } from "zod";

import { emailSchema, otpSchema, passwordSchema } from "./shared";

// Sign In Schema
export const signInSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters long"),
  rememberMe: z.boolean().optional().default(false),
});

export type SignInFormData = z.infer<typeof signInSchema>;

export const signInWithMagicLinkSchema = z.object({
  email: emailSchema,
});

// Sign Up Schema
export const signUpSchema = z
  .object({
    name: z
      .string()
      .min(1, "Name is required")
      .min(2, "Name must be at least 2 characters long")
      .max(50, "Name must be less than 50 characters"),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
    acceptTerms: z
      .boolean()
      .refine(
        (val) => val === true,
        "You must accept the terms and conditions"
      ),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type SignUpFormData = z.infer<typeof signUpSchema>;

// Forgot Password Schema
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// Reset Password Schema
export const resetPasswordSchema = z
  .object({
    newPassword: passwordSchema,
    confirmNewPassword: z.string().min(1, "Please confirm your password"),
    token: z.string().min(1, "Token is required"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords don't match",
    path: ["confirmNewPassword"],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// Two Factor Setup Schema
export const twoFactorSetupSchema = z.object({
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters long"),
  code: otpSchema,
});

export type TwoFactorSetupFormData = z.infer<typeof twoFactorSetupSchema>;

// OTP Verification Schema
export const otpVerificationSchema = z.object({
  code: otpSchema,
});

export type OTPVerificationFormData = z.infer<typeof otpVerificationSchema>;

// Email Verification Schema
export const emailVerificationSchema = z.object({
  token: z.string().min(1, "Verification token is required"),
});

export type EmailVerificationFormData = z.infer<typeof emailVerificationSchema>;

// Change Password Schema (for settings)
export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, "Current password is required")
      .min(8, "Password must be at least 8 characters long"),
    newPassword: passwordSchema,
    confirmNewPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords don't match",
    path: ["confirmNewPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
