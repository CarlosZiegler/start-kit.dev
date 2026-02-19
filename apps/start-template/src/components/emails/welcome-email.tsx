import { Text } from "@react-email/components";

import { EmailLayout } from "./layout-email";

const WelcomeEmail = ({ username }: { username: string }) => (
  <EmailLayout preview="Welcome to our app!">
    <Text className="font-bold text-2xl text-gray-800">
      Welcome to our app!
    </Text>
    <Text className="text-gray-600">Hi {username},</Text>
    <Text className="text-gray-600">
      Thank you for joining us. We're excited to have you on board!
    </Text>
    <Text className="mt-6 text-gray-600">
      If you have any questions or need assistance, feel free to contact our
      support team.
    </Text>
  </EmailLayout>
);

export default WelcomeEmail;

WelcomeEmail.PreviewProps = {
  username: "John Doe",
};
