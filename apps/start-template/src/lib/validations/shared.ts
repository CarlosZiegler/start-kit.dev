import { z } from "zod";

export const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Invalid email address");

export const passwordSchema = z
  .string()
  .min(1, "Password is required")
  .min(8, "Password must be at least 8 characters long")
  .max(100, "Password must be less than 100 characters")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    "Password must contain at least one lowercase letter, one uppercase letter, and one number"
  );

export const otpSchema = z
  .string()
  .min(1, "Verification code is required")
  .min(6, "Verification code must be 6 digits")
  .max(6, "Verification code must be 6 digits")
  .regex(/^\d{6}$/, "Verification code must be 6 digits");
