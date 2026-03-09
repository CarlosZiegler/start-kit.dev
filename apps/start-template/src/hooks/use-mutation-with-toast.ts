import {
  type InvalidateQueryFilters,
  type MutationFunction,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

type MutationWithToastOptions<TData, TVariables> = {
  mutationFn?: MutationFunction<TData, TVariables>;
  successMessage?: string;
  errorMessage?: string;
  invalidateKeys?: InvalidateQueryFilters[];
  onSuccess?: (data: TData) => void;
  onError?: (error: Error) => void;
};

export function useMutationWithToast<TData = unknown, TVariables = void>({
  mutationFn,
  successMessage,
  errorMessage,
  invalidateKeys,
  onSuccess,
  onError,
}: MutationWithToastOptions<TData, TVariables>) {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn,
    onSuccess: (data) => {
      if (invalidateKeys) {
        for (const key of invalidateKeys) {
          queryClient.invalidateQueries(key);
        }
      }
      if (successMessage) {
        toast.success(successMessage);
      }
      onSuccess?.(data);
    },
    onError: (error: Error) => {
      toast.error(error.message || errorMessage || t("COMMON_UNKNOWN_ERROR"));
      onError?.(error);
    },
  });
}
