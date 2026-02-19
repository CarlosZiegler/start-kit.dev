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

type SubscriptionUpgradeEmailProps = {
  username: string;
  previousPlan: string;
  newPlan: string;
  amount: string;
  effectiveDate: string;
};

export function SubscriptionUpgradeEmail({
  username,
  previousPlan,
  newPlan,
  amount,
  effectiveDate,
}: SubscriptionUpgradeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your subscription has been upgraded</Preview>
      <Tailwind>
        <Body className="bg-gray-50 font-sans text-gray-900">
          <Container className="mx-auto my-10 max-w-lg">
            <Section className="rounded-lg bg-white px-8 py-8 shadow-sm">
              <Section className="mb-6 text-center">
                <Text className="mb-2 text-3xl">⬆️</Text>
                <Heading className="mb-2 font-bold text-2xl text-gray-900">
                  Subscription Upgraded
                </Heading>
                <Text className="text-gray-500">Great choice, {username}!</Text>
              </Section>

              <Section className="mb-6">
                <Text className="text-gray-600 text-sm leading-relaxed">
                  Your subscription has been successfully upgraded from{" "}
                  <strong>{previousPlan}</strong> to <strong>{newPlan}</strong>.
                </Text>
              </Section>

              <Section className="mb-6 rounded-lg bg-gray-50 p-4">
                <Text className="mb-2 font-semibold text-gray-600 text-sm">
                  Plan Details
                </Text>
                <Section className="mb-1 flex justify-between">
                  <Text className="text-gray-600 text-sm">New Plan</Text>
                  <Text className="font-bold text-sm">{newPlan}</Text>
                </Section>
                <Section className="mb-1 flex justify-between">
                  <Text className="text-gray-600 text-sm">New Amount</Text>
                  <Text className="font-bold text-sm">{amount}</Text>
                </Section>
                <Section className="flex justify-between">
                  <Text className="text-gray-600 text-sm">Effective Date</Text>
                  <Text className="font-bold text-sm">{effectiveDate}</Text>
                </Section>
              </Section>

              <Section className="mb-6">
                <Text className="text-gray-600 text-sm leading-relaxed">
                  You now have access to all features included in your new plan.
                  The changes will take effect starting{" "}
                  <strong>{effectiveDate}</strong>.
                </Text>
              </Section>

              <Section className="text-center">
                <Button
                  className="rounded-md bg-blue-600 px-6 py-3 font-semibold text-sm text-white no-underline"
                  href="/settings/billing"
                >
                  View Your Subscription
                </Button>
              </Section>

              <Section className="mt-6 border-gray-200 border-t pt-6">
                <Text className="text-center text-gray-500 text-xs">
                  If you have any questions about your new plan, please contact
                  our support team.
                </Text>
              </Section>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
