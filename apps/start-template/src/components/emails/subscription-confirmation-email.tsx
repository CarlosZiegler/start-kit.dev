import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

type SubscriptionConfirmationEmailProps = {
  username: string;
  planName: string;
  amount: string;
  billingDate: string;
};

export function SubscriptionConfirmationEmail({
  username,
  planName,
  amount,
  billingDate,
}: SubscriptionConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your subscription to {planName} has been confirmed</Preview>
      <Tailwind>
        <Body className="bg-gray-50 font-sans text-gray-900">
          <Container className="mx-auto my-10 max-w-lg">
            <Section className="rounded-lg bg-white px-8 py-8 shadow-sm">
              <Section className="mb-6 text-center">
                <Text className="mb-2 font-bold text-3xl">🎉</Text>
                <Heading className="mb-2 font-bold text-2xl text-gray-900">
                  Subscription Confirmed
                </Heading>
                <Text className="text-gray-500">
                  Welcome to {planName}, {username}!
                </Text>
              </Section>

              <Section className="mb-6">
                <Row>
                  <Column className="w-1/3">
                    <Text className="mb-1 font-semibold text-gray-600 text-sm">
                      Plan
                    </Text>
                    <Text className="font-bold text-base">{planName}</Text>
                  </Column>
                  <Column className="w-1/3">
                    <Text className="mb-1 font-semibold text-gray-600 text-sm">
                      Amount
                    </Text>
                    <Text className="font-bold text-base">{amount}</Text>
                  </Column>
                  <Column className="w-1/3">
                    <Text className="mb-1 font-semibold text-gray-600 text-sm">
                      Next billing
                    </Text>
                    <Text className="font-bold text-base">{billingDate}</Text>
                  </Column>
                </Row>
              </Section>

              <Section className="mb-6">
                <Text className="text-gray-600 text-sm leading-relaxed">
                  Thank you for subscribing! Your payment has been processed
                  successfully and your subscription is now active. You can
                  manage your subscription at any time from your billing
                  settings.
                </Text>
              </Section>

              <Section className="text-center">
                <Button
                  className="rounded-md bg-blue-600 px-6 py-3 font-semibold text-sm text-white no-underline"
                  href="/settings/billing"
                >
                  Manage Your Subscription
                </Button>
              </Section>

              <Section className="mt-6 border-gray-200 border-t pt-6">
                <Text className="text-center text-gray-500 text-xs">
                  If you have any questions, please contact our support team.
                </Text>
              </Section>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
