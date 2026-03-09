"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ColumnDef, Row } from "@tanstack/react-table";
import type { UniqueIdentifier } from "@dnd-kit/core";
import { flexRender } from "@tanstack/react-table";
import { GripVerticalIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { TableCell, TableRow } from "@/components/ui/table";

import { useDataGridEnhanced } from "./data-grid-context";

/* ------------------------------- Drag Handle ------------------------------ */

export function DragHandle({ id }: { id: UniqueIdentifier }) {
  const { attributes, listeners } = useSortable({ id });

  return (
    <Button
      {...attributes}
      {...listeners}
      className="size-7 text-muted-foreground hover:bg-transparent"
      size="icon"
      variant="ghost"
    >
      <GripVerticalIcon className="size-3 text-muted-foreground" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  );
}

/* ---------------------------- Draggable Row ------------------------------- */

export function DraggableRow<TData>({ row }: { row: Row<TData> }) {
  const { enableDragDrop, dataIds, getRowClassName } =
    useDataGridEnhanced<TData>();

  const rowId = dataIds?.find((id) => id.toString() === row.id);
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: rowId || row.id,
    disabled: !enableDragDrop,
  });

  const customClassName = getRowClassName?.(row.original) || "";

  if (!enableDragDrop) {
    return (
      <TableRow
        className={customClassName}
        data-state={row.getIsSelected() && "selected"}
      >
        {row.getVisibleCells().map((cell) => (
          <TableCell key={cell.id}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        ))}
      </TableRow>
    );
  }

  return (
    <TableRow
      className={`relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80 ${customClassName}`}
      data-dragging={isDragging}
      data-state={row.getIsSelected() && "selected"}
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
}

/* ---------------------------- Helper Components --------------------------- */

// Checkbox column helper
export function createSelectColumn<TData>(): ColumnDef<TData> {
  return {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          aria-label="Select all"
          checked={table.getIsAllPageRowsSelected()}
          indeterminate={
            !table.getIsAllPageRowsSelected() &&
            table.getIsSomePageRowsSelected()
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          aria-label="Select row"
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  };
}

// Drag handle column helper
export function createDragColumn<TData>(
  getRowId: (row: TData) => string | number
): ColumnDef<TData> {
  return {
    id: "drag",
    header: () => null,
    cell: ({ row }) => <DragHandle id={getRowId(row.original)} />,
    enableSorting: false,
    enableHiding: false,
  };
}
