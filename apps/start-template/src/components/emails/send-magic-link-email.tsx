import { Button, Text } from "@react-email/components";

import { EmailLayout } from "./layout-email";

const SendMagicLinkEmail = ({
  username,
  url,
  token,
}: {
  username: string;
  url: string;
  token: string;
}) => {
  const link = `${url}?token=${token}`;
  return (
    <EmailLayout preview="Your magic link to sign in">
      <Text className="font-bold text-2xl text-gray-800">Magic Link</Text>
      <Text className="text-gray-600">Hi {username},</Text>
      <Text className="text-gray-600">
        Please click the button below to sign in:
      </Text>
      <Button
        className="rounded-md bg-blue-600 px-6 py-3 font-medium text-white"
        href={link}
      >
        Sign In
      </Button>
      <Text className="mt-4 text-gray-600">
        Or copy and paste this link in your browser:
      </Text>
      <Text className="break-all font-medium text-blue-600">{link}</Text>
      <Text className="mt-6 text-gray-500 text-sm">
        If you didn't request this magic link, you can safely ignore this email.
      </Text>
    </EmailLayout>
  );
};

export default SendMagicLinkEmail;

SendMagicLinkEmail.PreviewProps = {
  username: "John Doe",
  url: "https://example.com/magic-link",
  token: "123456",
};
