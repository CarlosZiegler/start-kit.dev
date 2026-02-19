import { Button, Text } from "@react-email/components";

import { EmailLayout } from "./layout-email";

// TODO: add a template for the email using React EMAIL instead of plain text
const VerifyEmail = ({ url, username }: { url: string; username: string }) => (
  <EmailLayout preview="Verify your email address">
    <Text className="font-bold text-2xl text-gray-800">Verify your email</Text>
    <Text className="text-gray-600">Hi {username},</Text>
    <Text className="text-gray-600">
      Please click the button below to verify your email address:
    </Text>
    <Button
      className="rounded-md bg-blue-600 px-6 py-3 font-medium text-white"
      href={url}
    >
      Verify Email
    </Button>
  </EmailLayout>
);

export default VerifyEmail;

VerifyEmail.PreviewProps = {
  url: "https://example.com/verify-email",
  username: "John Doe",
};
