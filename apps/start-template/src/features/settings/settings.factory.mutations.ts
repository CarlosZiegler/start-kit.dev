import { mutationOptions } from "@tanstack/react-query";

import { authClient } from "@/lib/auth/auth-client";
import { orpc } from "@/orpc/orpc-client";

export const changePasswordOptions = () =>
  mutationOptions({
    mutationFn: async (input: {
      currentPassword: string;
      newPassword: string;
      revokeOtherSessions?: boolean;
    }) => {
      const result = await authClient.changePassword(input);
      if (result.error) {
        throw new Error(result.error.message, {
          cause: result.error,
        });
      }
      return result;
    },
  });

export const updateProfileOptions = () =>
  orpc.profile.update.mutationOptions();

export const uploadAvatarOptions = () =>
  orpc.profile.uploadAvatar.mutationOptions();

export const removeAvatarOptions = () =>
  orpc.profile.removeAvatar.mutationOptions();
