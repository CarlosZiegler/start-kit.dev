import { describe, expect, it } from "vitest";

import {
  changePasswordSchema,
  forgotPasswordSchema,
  otpVerificationSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
  twoFactorSetupSchema,
} from "@/lib/validations/auth";

describe("sign in validation behavior", () => {
  it("rejects invalid email format", () => {
    const result = signInSchema.safeParse({
      email: "invalid-email",
      password: "Password1",
      rememberMe: false,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing email", () => {
    const result = signInSchema.safeParse({
      email: "",
      password: "Password1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects password less than 8 characters", () => {
    const result = signInSchema.safeParse({
      email: "test@example.com",
      password: "Pass1",
    });
    expect(result.success).toBe(false);
  });

  it("accepts valid credentials", () => {
    const result = signInSchema.safeParse({
      email: "test@example.com",
      password: "Password123",
      rememberMe: false,
    });
    expect(result.success).toBe(true);
  });
});

describe("sign up validation behavior", () => {
  it("rejects password without lowercase letter", () => {
    const result = signUpSchema.safeParse({
      name: "John Doe",
      email: "test@example.com",
      password: "PASSWORD123",
      confirmPassword: "PASSWORD123",
      acceptTerms: true,
    });
    expect(result.success).toBe(false);
  });

  it("rejects password without uppercase letter", () => {
    const result = signUpSchema.safeParse({
      name: "John Doe",
      email: "test@example.com",
      password: "password123",
      confirmPassword: "password123",
      acceptTerms: true,
    });
    expect(result.success).toBe(false);
  });

  it("rejects password without number", () => {
    const result = signUpSchema.safeParse({
      name: "John Doe",
      email: "test@example.com",
      password: "Password",
      confirmPassword: "Password",
      acceptTerms: true,
    });
    expect(result.success).toBe(false);
  });

  it("rejects password shorter than 8 characters", () => {
    const result = signUpSchema.safeParse({
      name: "John Doe",
      email: "test@example.com",
      password: "Pass1",
      confirmPassword: "Pass1",
      acceptTerms: true,
    });
    expect(result.success).toBe(false);
  });

  it("rejects password longer than 100 characters", () => {
    const result = signUpSchema.safeParse({
      name: "John Doe",
      email: "test@example.com",
      password: "P1".repeat(51),
      confirmPassword: "P1".repeat(51),
      acceptTerms: true,
    });
    expect(result.success).toBe(false);
  });

  it("rejects mismatched passwords", () => {
    const result = signUpSchema.safeParse({
      name: "John Doe",
      email: "test@example.com",
      password: "Password123",
      confirmPassword: "Password456",
      acceptTerms: true,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing terms acceptance", () => {
    const result = signUpSchema.safeParse({
      name: "John Doe",
      email: "test@example.com",
      password: "Password123",
      confirmPassword: "Password123",
      acceptTerms: false,
    });
    expect(result.success).toBe(false);
  });

  it("rejects name shorter than 2 characters", () => {
    const result = signUpSchema.safeParse({
      name: "J",
      email: "test@example.com",
      password: "Password123",
      confirmPassword: "Password123",
      acceptTerms: true,
    });
    expect(result.success).toBe(false);
  });

  it("rejects name longer than 50 characters", () => {
    const result = signUpSchema.safeParse({
      name: "J".repeat(51),
      email: "test@example.com",
      password: "Password123",
      confirmPassword: "Password123",
      acceptTerms: true,
    });
    expect(result.success).toBe(false);
  });

  it("accepts valid registration", () => {
    const result = signUpSchema.safeParse({
      name: "John Doe",
      email: "test@example.com",
      password: "Password123",
      confirmPassword: "Password123",
      acceptTerms: true,
    });
    expect(result.success).toBe(true);
  });
});

describe("forgot password validation behavior", () => {
  it("rejects invalid email", () => {
    const result = forgotPasswordSchema.safeParse({
      email: "invalid",
    });
    expect(result.success).toBe(false);
  });

  it("accepts valid email", () => {
    const result = forgotPasswordSchema.safeParse({
      email: "test@example.com",
    });
    expect(result.success).toBe(true);
  });
});

describe("reset password validation behavior", () => {
  it("requires password complexity", () => {
    const result = resetPasswordSchema.safeParse({
      newPassword: "simple",
      confirmNewPassword: "simple",
      token: "token123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects mismatched passwords", () => {
    const result = resetPasswordSchema.safeParse({
      newPassword: "Password123",
      confirmNewPassword: "Password456",
      token: "token123",
    });
    expect(result.success).toBe(false);
  });

  it("accepts valid password reset", () => {
    const result = resetPasswordSchema.safeParse({
      newPassword: "Password123",
      confirmNewPassword: "Password123",
      token: "token123",
    });
    expect(result.success).toBe(true);
  });
});

describe("change password validation behavior", () => {
  it("rejects same old and new password", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "Password123",
      newPassword: "Password123",
      confirmNewPassword: "Password123",
    });
    expect(result.success).toBe(false);
  });

  it("enforces password complexity on new password", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "OldPassword123",
      newPassword: "simple",
      confirmNewPassword: "simple",
    });
    expect(result.success).toBe(false);
  });

  it("accepts valid password change", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "OldPassword123",
      newPassword: "NewPassword456",
      confirmNewPassword: "NewPassword456",
    });
    expect(result.success).toBe(true);
  });
});

describe("two factor setup validation behavior", () => {
  it("rejects verification codes not exactly 6 digits", () => {
    const result = twoFactorSetupSchema.safeParse({
      password: "Password123",
      code: "12345",
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-numeric verification codes", () => {
    const result = twoFactorSetupSchema.safeParse({
      password: "Password123",
      code: "abcdef",
    });
    expect(result.success).toBe(false);
  });

  it("accepts valid 2FA setup", () => {
    const result = twoFactorSetupSchema.safeParse({
      password: "Password123",
      code: "123456",
    });
    expect(result.success).toBe(true);
  });
});

describe("OTP verification validation behavior", () => {
  it("requires exactly 6 digit code", () => {
    const result = otpVerificationSchema.safeParse({
      code: "12345",
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-digit codes", () => {
    const result = otpVerificationSchema.safeParse({
      code: "12345a",
    });
    expect(result.success).toBe(false);
  });

  it("accepts valid 6-digit code", () => {
    const result = otpVerificationSchema.safeParse({
      code: "123456",
    });
    expect(result.success).toBe(true);
  });
});
