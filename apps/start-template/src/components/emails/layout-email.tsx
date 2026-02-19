import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Tailwind,
} from "@react-email/components";
import type { ReactNode } from "react";

interface EmailLayoutProps {
  children: ReactNode;
  preview: string;
}

export const EmailLayout = ({ preview, children }: EmailLayoutProps) => (
  <Html>
    <Head />
    <Preview>{preview}</Preview>
    <Tailwind>
      <Body className="bg-gray-50 font-sans">
        <Container className="mx-auto max-w-xl px-4 py-8">
          <Section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            {children}
          </Section>
        </Container>
      </Body>
    </Tailwind>
  </Html>
);
