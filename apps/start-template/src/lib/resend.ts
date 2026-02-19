import { render } from "@react-email/render";
import type { ReactElement, ReactNode } from "react";
import {
  type CreateEmailOptions,
  type CreateEmailRequestOptions,
  Resend,
} from "resend";

import { APP_CONFIG } from "@/lib/config/app.config";
import { env } from "@/lib/env.server";

type EmailProps = {
  payload: CreateEmailOptions;
  options?: CreateEmailRequestOptions;
  template: ReactElement | ReactNode;
};

const DEFAULT_FROM = `${APP_CONFIG.name} <noreply@example.com>`;

export const resend = new Resend(env.RESEND_API_KEY);

export const sendEmail = async ({ payload, options, template }: EmailProps) => {
  const html = await render(template);
  const text = await render(template, { plainText: true });

  const result = await resend.emails.send(
    {
      ...payload,
      html,
      text,
      from: env.RESEND_FROM_EMAIL ?? payload.from ?? DEFAULT_FROM,
    },
    options
  );
  return result;
};
