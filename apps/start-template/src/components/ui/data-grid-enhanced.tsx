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
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type Row,
  type SortingState,
  type Table as TableType,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  ColumnsIcon,
  GripVerticalIcon,
  Search,
  X,
} from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/* --------------------------------- Context -------------------------------- */

type DataGridEnhancedContextValue<TData> = {
  table: TableType<TData>;
  isLoading?: boolean;
  enableRowSelection?: boolean;
  enableDragDrop?: boolean;
  dataIds?: UniqueIdentifier[];
  getRowClassName?: (row: TData) => string;
  pagination?: PaginationState;
};

const DataGridEnhancedContext = React.createContext<
  DataGridEnhancedContextValue<unknown> | undefined
>(undefined);

function useDataGridEnhanced<TData>() {
  const context = React.use(DataGridEnhancedContext);
  if (!context) {
    throw new Error("useDataGridEnhanced must be used within DataGridEnhanced");
  }
  return context as DataGridEnhancedContextValue<TData>;
}

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

/* ------------------------------- Drag Handle ------------------------------ */

function DragHandle({ id }: { id: UniqueIdentifier }) {
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

function DraggableRow<TData>({ row }: { row: Row<TData> }) {
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

/* -------------------------------- Toolbar --------------------------------- */

type DataGridEnhancedToolbarProps = {
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

function DataGridEnhancedToolbar({
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
          <DropdownMenuTrigger>
            <Button size="sm" variant="outline">
              <ColumnsIcon />
              <span className="hidden lg:inline">Columns</span>
              <ChevronDownIcon />
            </Button>
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

DataGridEnhanced.Toolbar = DataGridEnhancedToolbar;

/* -------------------------------- Content --------------------------------- */

type DataGridEnhancedContentProps = {
  className?: string;
  emptyMessage?: string;
};

function DataGridEnhancedContent({
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

DataGridEnhanced.Content = DataGridEnhancedContent;

/* ------------------------------- Pagination ------------------------------- */

type DataGridEnhancedPaginationProps = {
  showRowsPerPage?: boolean;
  showSelectedCount?: boolean;
  pageSizeOptions?: number[];
};

function DataGridEnhancedPagination({
  showRowsPerPage = true,
  showSelectedCount = true,
  pageSizeOptions = [10, 20, 30, 40, 50],
}: DataGridEnhancedPaginationProps) {
  const { table, enableRowSelection, pagination } = useDataGridEnhanced();

  const currentPageSize =
    pagination?.pageSize ?? table.getState().pagination.pageSize;

  return (
    <div className="flex items-center justify-between px-2">
      {enableRowSelection && showSelectedCount ? (
        <div className="flex-1 text-muted-foreground text-sm">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
      ) : (
        <div className="flex-1" />
      )}

      <div className="flex items-center gap-6 lg:gap-8">
        {showRowsPerPage && (
          <div className="flex items-center gap-2">
            <Label className="font-medium text-sm">Rows per page</Label>
            <Select
              key={currentPageSize}
              onValueChange={(value) => {
                if (value) {
                  const newPageSize = Number(value);
                  table.setPageSize(newPageSize);
                  table.setPageIndex(0);
                }
              }}
              value={`${currentPageSize}`}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent side="top">
                {pageSizeOptions.map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex w-[100px] items-center justify-center font-medium text-sm">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </div>

        <div className="flex items-center gap-2">
          <Button
            className="hidden h-8 w-8 p-0 lg:flex"
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.setPageIndex(0)}
            size="icon"
            variant="outline"
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            className="h-8 w-8 p-0"
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
            size="icon"
            variant="outline"
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            className="h-8 w-8 p-0"
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
            size="icon"
            variant="outline"
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
          <Button
            className="hidden h-8 w-8 p-0 lg:flex"
            disabled={!table.getCanNextPage()}
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            size="icon"
            variant="outline"
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

DataGridEnhanced.Pagination = DataGridEnhancedPagination;

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
