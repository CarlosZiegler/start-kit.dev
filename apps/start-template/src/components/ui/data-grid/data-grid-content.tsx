"use client";

import * as React from "react";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { flexRender } from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useDataGridEnhanced } from "./data-grid-context";
import { DraggableRow } from "./data-grid-drag";

/* -------------------------------- Content --------------------------------- */

export type DataGridEnhancedContentProps = {
  className?: string;
  emptyMessage?: string;
};

export function DataGridEnhancedContent({
  className,
  emptyMessage = "No results.",
}: DataGridEnhancedContentProps) {
  const { table, isLoading, enableDragDrop, dataIds, getRowClassName } =
    useDataGridEnhanced();

  const rows = table.getRowModel().rows ?? [];
  const hasRows = rows.length > 0;
  const useDragDrop = enableDragDrop && dataIds && dataIds.length > 0;

  function renderTableBody(): React.ReactNode {
    if (isLoading) {
      return (
        <TableRow>
          <TableCell
            className="h-24 text-center"
            colSpan={table.getAllColumns().length}
          >
            Loading...
          </TableCell>
        </TableRow>
      );
    }

    if (!hasRows) {
      return (
        <TableRow>
          <TableCell
            className="h-24 text-center"
            colSpan={table.getAllColumns().length}
          >
            {emptyMessage}
          </TableCell>
        </TableRow>
      );
    }

    if (useDragDrop) {
      return (
        <SortableContext items={dataIds} strategy={verticalListSortingStrategy}>
          {rows.map((row) => (
            <DraggableRow key={row.id} row={row} />
          ))}
        </SortableContext>
      );
    }

    return rows.map((row) => {
      const customClassName = getRowClassName?.(row.original) || "";
      return (
        <TableRow
          className={customClassName}
          data-state={row.getIsSelected() && "selected"}
          key={row.id}
        >
          {row.getVisibleCells().map((cell) => (
            <TableCell key={cell.id}>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCell>
          ))}
        </TableRow>
      );
    });
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="overflow-auto">
        <Table className={className}>
          <TableHeader className="sticky top-0 z-10 bg-muted">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead colSpan={header.colSpan} key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="**:data-[slot=table-cell]:first:w-8">
            {renderTableBody()}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
