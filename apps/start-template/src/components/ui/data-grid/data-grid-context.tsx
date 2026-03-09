"use client";

import type {
  PaginationState,
  Table as TableType,
} from "@tanstack/react-table";
import type { UniqueIdentifier } from "@dnd-kit/core";
import * as React from "react";

/* --------------------------------- Context -------------------------------- */

export type DataGridEnhancedContextValue<TData> = {
  table: TableType<TData>;
  isLoading?: boolean;
  enableRowSelection?: boolean;
  enableDragDrop?: boolean;
  dataIds?: UniqueIdentifier[];
  getRowClassName?: (row: TData) => string;
  pagination?: PaginationState;
};

export const DataGridEnhancedContext = React.createContext<
  DataGridEnhancedContextValue<unknown> | undefined
>(undefined);

export function useDataGridEnhanced<TData>() {
  const context = React.use(DataGridEnhancedContext);
  if (!context) {
    throw new Error("useDataGridEnhanced must be used within DataGridEnhanced");
  }
  return context as DataGridEnhancedContextValue<TData>;
}
