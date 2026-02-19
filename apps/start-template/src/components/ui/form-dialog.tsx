"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { MutationOptions, QueryKey } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";

export type FormDialogProps<T extends z.ZodType<any, any, any>> = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string | ReactNode;
  description?: string | ReactNode;
  icon?: ReactNode;
  schema: T;
  defaultValues: z.infer<T>;
  mutationOptions: MutationOptions<unknown, Error, z.infer<T>>;
  invalidateQueries?: QueryKey[];
  successMessage?: string;
  errorMessage?: string;
  submitLabel?: string;
  cancelLabel?: string;
  isLoadingLabel?: string;
  children: (methods: ReturnType<typeof useForm<z.infer<T>>>) => ReactNode;
};

export function FormDialog<T extends z.ZodType<any, any, any>>({
  open,
  onOpenChange,
  title,
  description,
  icon,
  schema,
  defaultValues,
  mutationOptions,
  invalidateQueries = [],
  successMessage,
  errorMessage,
  submitLabel = "SUBMIT",
  cancelLabel = "CANCEL",
  isLoadingLabel = "SUBMITTING",
  children,
}: FormDialogProps<T>) {
  const queryClient = useQueryClient();

  const form = useForm<z.infer<T>>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const mutation = useMutation({
    ...mutationOptions,
    onSuccess: (...args) => {
      for (const key of invalidateQueries) {
        queryClient.invalidateQueries({ queryKey: key });
      }
      if (successMessage) {
        toast.success(successMessage);
      }
      form.reset();
      onOpenChange(false);
      mutationOptions.onSuccess?.(...args);
    },
    onError: (error) => {
      toast.error(errorMessage || error.message);
      mutationOptions.onError?.(error);
    },
  });

  const onSubmit = (data: z.infer<T>) => {
    mutation.mutate(data);
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {icon}
            {title}
          </DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <FormProvider {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            {children(form)}
            <DialogFooter>
              <ButtonGroup>
                <Button
                  onClick={() => onOpenChange(false)}
                  type="button"
                  variant="outline"
                >
                  {cancelLabel}
                </Button>
                <Button disabled={mutation.isPending} type="submit">
                  {mutation.isPending ? (
                    <>
                      <Spinner className="mr-2" />
                      {isLoadingLabel}
                    </>
                  ) : (
                    submitLabel
                  )}
                </Button>
              </ButtonGroup>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
