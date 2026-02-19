"use client";

import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

export type ConfirmationDialogProps = {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when open state changes */
  onOpenChange: (open: boolean) => void;
  /** Dialog title */
  title: string;
  /** Dialog description */
  description: ReactNode;
  /** Whether the action is in progress */
  isLoading?: boolean;
  /** Callback when confirm is clicked */
  onConfirm: () => void | Promise<void>;
  /** Label for the confirm button */
  confirmLabel?: string;
  /** Label for the cancel button */
  cancelLabel?: string;
  /** Visual variant for the confirm button */
  variant?: "default" | "destructive";
  /** Icon to show in confirm button */
  icon?: ReactNode;
};

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  isLoading = false,
  onConfirm,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  icon,
}: ConfirmationDialogProps) {
  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <AlertDialog onOpenChange={onOpenChange} open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            className={cn(
              variant === "destructive" &&
                "bg-destructive text-destructive-foreground hover:bg-destructive/90"
            )}
            disabled={isLoading}
            onClick={handleConfirm}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {icon && !isLoading && <span className="mr-2">{icon}</span>}
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
