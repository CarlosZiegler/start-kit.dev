import type { ReactElement, ReactNode } from "react";

import { sendEmail } from "@/lib/resend";

type SendEmailSafelyParams = {
  to: string;
  subject: string;
  text: string;
  template: ReactElement | ReactNode;
  from?: string;
  errorContext?: string;
};

async function sendEmailSafely({
  to,
  subject,
  text,
  template,
  from = "noreply@example.com",
  errorContext = "email",
}: SendEmailSafelyParams): Promise<boolean> {
  try {
    await sendEmail({
      payload: {
        subject,
        text,
        to,
        from,
      },
      template,
    });
    return true;
  } catch (error) {
    console.error(`Error sending ${errorContext}:`, error);
    return false;
  }
}

export { sendEmailSafely };
export type { SendEmailSafelyParams };
