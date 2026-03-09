"use client";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  type UniqueIdentifier,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { arrayMove } from "@dnd-kit/sortable";
import {
  type ColumnDef,
  type ColumnFiltersState,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import * as React from "react";

import {
  DataGridEnhancedContext,
  type DataGridEnhancedContextValue,
} from "./data-grid/data-grid-context";
import { DataGridEnhancedContent } from "./data-grid/data-grid-content";
import { createDragColumn, createSelectColumn } from "./data-grid/data-grid-drag";
import { DataGridEnhancedPagination } from "./data-grid/data-grid-pagination";
import { DataGridEnhancedToolbar } from "./data-grid/data-grid-toolbar";

// Re-export sub-components and helpers for backwards compatibility
export { useDataGridEnhanced } from "./data-grid/data-grid-context";
export type { DataGridEnhancedContextValue } from "./data-grid/data-grid-context";
export { DataGridEnhancedToolbar } from "./data-grid/data-grid-toolbar";
export type { DataGridEnhancedToolbarProps } from "./data-grid/data-grid-toolbar";
export { DataGridEnhancedContent } from "./data-grid/data-grid-content";
export type { DataGridEnhancedContentProps } from "./data-grid/data-grid-content";
export { DataGridEnhancedPagination } from "./data-grid/data-grid-pagination";
export type { DataGridEnhancedPaginationProps } from "./data-grid/data-grid-pagination";
export { DragHandle, DraggableRow, createSelectColumn, createDragColumn } from "./data-grid/data-grid-drag";

/* ---------------------------------- Types --------------------------------- */

export type DataGridEnhancedProps<TData> = {
  data: TData[];
  columns: ColumnDef<TData>[];
  children?: React.ReactNode;

  // Pagination (controlled or uncontrolled)
  manualPagination?: boolean;
  pageCount?: number;
  pagination?: PaginationState;
  onPaginationChange?: (
    updaterOrValue:
      | PaginationState
      | ((old: PaginationState) => PaginationState)
  ) => void;

  // Sorting
  sorting?: SortingState;
  onSortingChange?: (
    updaterOrValue: SortingState | ((old: SortingState) => SortingState)
  ) => void;

  // Row selection
  enableRowSelection?: boolean;
  rowSelection?: Record<string, boolean>;
  onRowSelectionChange?: (
    updaterOrValue:
      | Record<string, boolean>
      | ((old: Record<string, boolean>) => Record<string, boolean>)
  ) => void;

  // Drag and drop
  enableDragDrop?: boolean;
  onDragEnd?: (data: TData[]) => void;
  getRowId?: (row: TData) => string;

  // Column visibility
  columnVisibility?: VisibilityState;
  onColumnVisibilityChange?: (
    updaterOrValue:
      | VisibilityState
      | ((old: VisibilityState) => VisibilityState)
  ) => void;

  // Column filters
  columnFilters?: ColumnFiltersState;
  onColumnFiltersChange?: (
    updaterOrValue:
      | ColumnFiltersState
      | ((old: ColumnFiltersState) => ColumnFiltersState)
  ) => void;

  // Loading state
  isLoading?: boolean;

  // Initial state
  initialPageSize?: number;

  // Row styling
  getRowClassName?: (row: TData) => string;
};

/* -------------------------------- Main Component ------------------------------ */

export function DataGridEnhanced<TData>({
  data,
  columns,
  children,
  manualPagination = false,
  pageCount,
  pagination: controlledPagination,
  onPaginationChange,
  sorting: controlledSorting,
  onSortingChange,
  enableRowSelection = false,
  rowSelection: controlledRowSelection,
  onRowSelectionChange,
  enableDragDrop = false,
  onDragEnd,
  getRowId,
  columnVisibility: controlledColumnVisibility,
  onColumnVisibilityChange,
  columnFilters: controlledColumnFilters,
  onColumnFiltersChange,
  isLoading = false,
  initialPageSize = 10,
  getRowClassName,
}: DataGridEnhancedProps<TData>) {
  // Internal state
  const [internalPagination, setInternalPagination] =
    React.useState<PaginationState>({
      pageIndex: 0,
      pageSize: initialPageSize,
    });
  const [internalSorting, setInternalSorting] = React.useState<SortingState>(
    []
  );
  const [internalRowSelection, setInternalRowSelection] = React.useState<
    Record<string, boolean>
  >({});
  const [internalColumnVisibility, setInternalColumnVisibility] =
    React.useState<VisibilityState>({});
  const [internalColumnFilters, setInternalColumnFilters] =
    React.useState<ColumnFiltersState>([]);
  const [internalData, setInternalData] = React.useState(() => data);

  // Controlled vs uncontrolled state
  const pagination = controlledPagination ?? internalPagination;
  const sorting = controlledSorting ?? internalSorting;
  const rowSelection = controlledRowSelection ?? internalRowSelection;
  const columnVisibility =
    controlledColumnVisibility ?? internalColumnVisibility;
  const columnFilters = controlledColumnFilters ?? internalColumnFilters;

  // Update internal data when prop changes
  React.useEffect(() => {
    setInternalData(data);
  }, [data]);

  // Data IDs for drag and drop
  const dataIds = React.useMemo<UniqueIdentifier[]>(() => {
    if (!(enableDragDrop && getRowId)) {
      return [];
    }
    return internalData.map((row) => getRowId(row));
  }, [internalData, enableDragDrop, getRowId]);

  // Table instance
  const table = useReactTable({
    data: internalData,
    columns,
    pageCount: manualPagination ? pageCount : undefined,
    manualPagination,
    state: {
      pagination,
      sorting,
      rowSelection,
      columnVisibility,
      columnFilters,
    },
    enableRowSelection,
    onPaginationChange: onPaginationChange ?? setInternalPagination,
    onSortingChange: onSortingChange ?? setInternalSorting,
    onRowSelectionChange: onRowSelectionChange ?? setInternalRowSelection,
    onColumnVisibilityChange:
      onColumnVisibilityChange ?? setInternalColumnVisibility,
    onColumnFiltersChange: onColumnFiltersChange ?? setInternalColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    ...(getRowId ? { getRowId } : {}),
  });

  // Drag and drop sensors
  const sortableId = React.useId();
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      const oldIndex = dataIds.indexOf(active.id);
      const newIndex = dataIds.indexOf(over.id);
      const newData = arrayMove(internalData, oldIndex, newIndex);
      setInternalData(newData);
      onDragEnd?.(newData);
    }
  }

  const contextValue: DataGridEnhancedContextValue<TData> = {
    table,
    isLoading,
    enableRowSelection,
    enableDragDrop,
    dataIds,
    getRowClassName,
    pagination,
  };

  return (
    <DataGridEnhancedContext.Provider
      value={contextValue as DataGridEnhancedContextValue<unknown>}
    >
      <DndContext
        collisionDetection={closestCenter}
        id={sortableId}
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={handleDragEnd}
        sensors={sensors}
      >
        <div className="flex h-full w-full flex-col gap-4">{children}</div>
      </DndContext>
    </DataGridEnhancedContext.Provider>
  );
}

/* ----------------------- Static Property Assignments ---------------------- */

DataGridEnhanced.Toolbar = DataGridEnhancedToolbar;
DataGridEnhanced.Content = DataGridEnhancedContent;
DataGridEnhanced.Pagination = DataGridEnhancedPagination;
