import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

type SubscriptionCancellationEmailProps = {
  username: string;
  planName: string;
  cancelDate: string;
  reason?: string;
};

export function SubscriptionCancellationEmail({
  username,
  planName,
  cancelDate,
  reason,
}: SubscriptionCancellationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your subscription has been canceled</Preview>
      <Tailwind>
        <Body className="bg-gray-50 font-sans text-gray-900">
          <Container className="mx-auto my-10 max-w-lg">
            <Section className="rounded-lg bg-white px-8 py-8 shadow-sm">
              <Section className="mb-6 text-center">
                <Text className="mb-2 text-3xl">👋</Text>
                <Heading className="mb-2 font-bold text-2xl text-gray-900">
                  Subscription Canceled
                </Heading>
                <Text className="text-gray-500">
                  We're sorry to see you go, {username}
                </Text>
              </Section>

              <Section className="mb-6">
                <Text className="text-gray-600 text-sm leading-relaxed">
                  Your <strong>{planName}</strong> subscription has been
                  canceled. Your access will end on{" "}
                  <strong>{cancelDate}</strong>.
                </Text>
              </Section>

              <Section className="mb-6 rounded-lg border border-orange-200 bg-orange-50 p-4">
                <Text className="mb-2 font-semibold text-orange-900 text-sm">
                  What happens next?
                </Text>
                <Text className="text-orange-800 text-sm leading-relaxed">
                  You'll continue to have access to your plan until {cancelDate}
                  . After that date, your account will be downgraded to our free
                  plan.
                </Text>
              </Section>

              {reason && (
                <Section className="mb-6">
                  <Text className="text-gray-500 text-sm leading-relaxed">
                    Thank you for your feedback: "{reason}". We're always
                    looking to improve and would love to know how we can serve
                    you better in the future.
                  </Text>
                </Section>
              )}

              <Section className="mb-6">
                <Text className="text-gray-600 text-sm leading-relaxed">
                  If you change your mind, you can reactivate your subscription
                  at any time from your billing settings.
                </Text>
              </Section>

              <Section className="text-center">
                <Button
                  className="rounded-md bg-blue-600 px-6 py-3 font-semibold text-sm text-white no-underline"
                  href="/settings/billing"
                >
                  Reactivate Subscription
                </Button>
              </Section>

              <Section className="mt-6 border-gray-200 border-t pt-6">
                <Text className="text-center text-gray-500 text-xs">
                  We hope to see you again soon! If you have any questions,
                  please contact our support team.
                </Text>
              </Section>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
