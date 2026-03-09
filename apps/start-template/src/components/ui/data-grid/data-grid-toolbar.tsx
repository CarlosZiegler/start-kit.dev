"use client";

import * as React from "react";
import {
  ChevronDownIcon,
  ColumnsIcon,
  Search,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

import { useDataGridEnhanced } from "./data-grid-context";

/* -------------------------------- Toolbar --------------------------------- */

export type DataGridEnhancedToolbarProps = {
  children?: React.ReactNode;
  searchable?: boolean;
  searchColumn?: string;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  searchBind?: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur?: () => void;
  };
  showColumnVisibility?: boolean;
};

export function DataGridEnhancedToolbar({
  children,
  searchable = false,
  searchColumn,
  searchPlaceholder = "Search...",
  onSearchChange,
  searchBind,
  showColumnVisibility = false,
}: DataGridEnhancedToolbarProps) {
  const { table } = useDataGridEnhanced();
  const [searchValue, setSearchValue] = React.useState("");

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    if (onSearchChange) {
      onSearchChange(value);
    } else if (searchColumn) {
      table.getColumn(searchColumn)?.setFilterValue(value);
    }
  };

  // Use searchBind if provided, otherwise use internal state
  const inputValue = searchBind?.value ?? searchValue;
  const handleInputChange = searchBind
    ? searchBind.onChange
    : (e: React.ChangeEvent<HTMLInputElement>) =>
        handleSearchChange(e.target.value);

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex flex-1 items-center gap-2">
        {searchable && (
          <div className="relative max-w-sm flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              onBlur={searchBind?.onBlur}
              onChange={handleInputChange}
              placeholder={searchPlaceholder}
              value={inputValue}
            />
            {inputValue.length > 0 && (
              <Button
                className="absolute top-1/2 right-1.5 h-6 w-6 -translate-y-1/2"
                onClick={() => {
                  if (searchBind) {
                    searchBind.onChange({
                      target: { value: "" },
                    } as React.ChangeEvent<HTMLInputElement>);
                  } else {
                    handleSearchChange("");
                  }
                }}
                size="icon"
                variant="ghost"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}
        {children}
      </div>

      {showColumnVisibility && (
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button size="sm" variant="outline" />}>
            <ColumnsIcon />
            <span className="hidden lg:inline">Columns</span>
            <ChevronDownIcon />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {table
              .getAllColumns()
              .filter(
                (column) =>
                  typeof column.accessorFn !== "undefined" &&
                  column.getCanHide()
              )
              .map((column) => (
                <DropdownMenuCheckboxItem
                  checked={column.getIsVisible()}
                  className="capitalize"
                  key={column.id}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
