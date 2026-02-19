import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { CheckCircle2Icon, LoaderIcon, MoreVerticalIcon } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { SectionCards } from "@/components/section-cards";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  createSelectColumn,
  DataGridEnhanced,
} from "@/components/ui/data-grid-enhanced";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDebouncedSearchParam } from "@/hooks/use-debounced-search-param";
import { orpc } from "@/orpc/orpc-client";

export const Route = createFileRoute("/(dashboard)/overview/")({
  component: RouteComponent,
  validateSearch: z.object({
    query: z.string().optional(),
  }),
});

type DataItem = {
  id: number;
  header: string;
  type: string;
  status: string;
  target: string;
  limit: string;
  reviewer: string;
};

function RouteComponent() {
  const { bind, searchValue } = useDebouncedSearchParam(Route, "query");
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Fetch data from ORPC endpoint with React Query
  const { data: dashboardData, isLoading } = useQuery({
    ...orpc.dashboard.list.queryOptions({
      input: {
        page: pagination.pageIndex,
        pageSize: pagination.pageSize,
        search: searchValue || undefined,
      },
    }),
    placeholderData: keepPreviousData,
  });

  const tableData = dashboardData?.data ?? [];
  const totalCount = dashboardData?.total ?? 0;

  // Define columns for the enhanced data grid
  const columns: ColumnDef<DataItem>[] = [
    createSelectColumn(),
    {
      accessorKey: "header",
      header: "Header",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.header}</div>
      ),
    },
    {
      accessorKey: "type",
      header: "Section Type",
      cell: ({ row }) => (
        <Badge className="px-1.5 text-muted-foreground" variant="outline">
          {row.original.type}
        </Badge>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          className="flex gap-1 px-1.5 text-muted-foreground [&_svg]:size-3"
          variant="outline"
        >
          {row.original.status === "Done" ? (
            <CheckCircle2Icon className="text-green-500 dark:text-green-400" />
          ) : (
            <LoaderIcon />
          )}
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: "target",
      header: () => <div className="w-full text-right">Target</div>,
      cell: ({ row }) => (
        <div className="text-right">{row.original.target}</div>
      ),
    },
    {
      accessorKey: "limit",
      header: () => <div className="w-full text-right">Limit</div>,
      cell: ({ row }) => <div className="text-right">{row.original.limit}</div>,
    },
    {
      accessorKey: "reviewer",
      header: "Reviewer",
    },
    {
      id: "actions",
      cell: () => (
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button
              className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
              size="icon"
              variant="ghost"
            >
              <MoreVerticalIcon />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem>Make a copy</DropdownMenuItem>
            <DropdownMenuItem>Favorite</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <SectionCards />
        <div className="px-4 lg:px-6">
          <ChartAreaInteractive />
        </div>

        {/* New Enhanced Data Grid with ORPC + React Query */}
        <div className="px-4 lg:px-6">
          <div className="mb-4">
            <h2 className="font-semibold text-lg">
              New DataGridEnhanced Component (ORPC + React Query)
            </h2>
            <p className="text-muted-foreground text-sm">
              Server-side pagination, search with debounced URL params, and
              composable API
            </p>
          </div>
          <DataGridEnhanced
            columns={columns}
            data={tableData}
            enableDragDrop={true}
            enableRowSelection={true}
            getRowId={(row) => row.id.toString()}
            initialPageSize={10}
            isLoading={isLoading}
            manualPagination={true}
            onPaginationChange={setPagination}
            pageCount={Math.ceil(totalCount / pagination.pageSize)}
            pagination={pagination}
          >
            <DataGridEnhanced.Toolbar
              searchable={true}
              searchBind={bind}
              searchPlaceholder="Search headers..."
              showColumnVisibility={true}
            />
            <DataGridEnhanced.Content emptyMessage="No results found." />
            <DataGridEnhanced.Pagination showRowsPerPage={true} />
          </DataGridEnhanced>
        </div>
      </div>
    </div>
  );
}
