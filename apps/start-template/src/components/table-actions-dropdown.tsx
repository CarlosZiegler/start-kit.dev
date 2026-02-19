"use client";

import { MoreVerticalIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type TableActionsDropdownProps = {
  children: ReactNode;
  disabled?: boolean;
  ariaLabel?: string;
};

function TableActionsDropdown({
  children,
  disabled = false,
  ariaLabel = "Open menu",
}: TableActionsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button
          className="flex h-8 w-8 p-0 text-muted-foreground data-[state=open]:bg-muted"
          disabled={disabled}
          size="icon"
          variant="ghost"
        >
          <MoreVerticalIcon className="h-4 w-4" />
          <span className="sr-only">{ariaLabel}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-32">
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { TableActionsDropdown };
export type { TableActionsDropdownProps };
