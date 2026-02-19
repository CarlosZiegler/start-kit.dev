"use client";

import { useCallback, useState } from "react";

type UseConfirmationDialogOptions<T> = {
  onConfirm: (item: T) => void;
};

type UseConfirmationDialogReturn<T> = {
  isOpen: boolean;
  item: T | null;
  open: (itemToConfirm: T) => void;
  close: () => void;
  confirm: () => void;
  setIsOpen: (open: boolean) => void;
};

function useConfirmationDialog<T>({
  onConfirm,
}: UseConfirmationDialogOptions<T>): UseConfirmationDialogReturn<T> {
  const [isOpen, setIsOpen] = useState(false);
  const [item, setItem] = useState<T | null>(null);

  const open = useCallback((itemToConfirm: T) => {
    setItem(itemToConfirm);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setItem(null);
  }, []);

  const confirm = useCallback(() => {
    if (item) {
      onConfirm(item);
    }
    close();
  }, [item, onConfirm, close]);

  return { isOpen, item, open, close, confirm, setIsOpen };
}

export { useConfirmationDialog };
export type { UseConfirmationDialogOptions, UseConfirmationDialogReturn };
