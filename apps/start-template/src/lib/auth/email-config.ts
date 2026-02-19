type OTPEmailType = "sign-in" | "email-verification" | "forget-password";

type OTPEmailConfig = {
  subject: string;
  text: string;
};

const OTP_EMAIL_CONFIG: Record<OTPEmailType, OTPEmailConfig> = {
  "sign-in": {
    subject: "You are signing in to your account",
    text: "Verify your email",
  },
  "email-verification": {
    subject: "Verify your email",
    text: "Verify your email",
  },
  "forget-password": {
    subject: "Forgot password",
    text: "Verify your email",
  },
};

function getOTPEmailConfig(type: string): OTPEmailConfig {
  return (
    OTP_EMAIL_CONFIG[type as OTPEmailType] ??
    OTP_EMAIL_CONFIG["forget-password"]
  );
}

export { getOTPEmailConfig, OTP_EMAIL_CONFIG };
export type { OTPEmailConfig, OTPEmailType };
