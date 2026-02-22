# ui-data-grid: Use DataGridEnhanced for Server-Side Pagination

## Priority: MEDIUM

## Explanation

The `DataGridEnhanced` component wraps TanStack Table with built-in toolbar, search, pagination, and column visibility. Use it with server-side pagination via React Query and manual pagination state.

## Bad Example

```tsx
// Wrong: loading all data client-side, custom table from scratch
function UsersTable() {
  const { data } = useQuery({ queryKey: ["users"], queryFn: fetchAllUsers });

  return (
    <table>
      <thead>...</thead>
      <tbody>
        {data?.map(user => <tr key={user.id}>...</tr>)}
      </tbody>
    </table>
  );
}
```

## Good Example

```tsx
// Server-side pagination with DataGridEnhanced
import { DataGridEnhanced } from "@/components/ui/data-grid-enhanced";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useDebouncedSearchParam } from "@/hooks/use-debounced-search-param";

function MembersTable({ orgId }: { orgId: string }) {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const { value: search, bind } = useDebouncedSearchParam("search");

  const { data, isLoading } = useQuery({
    ...organizationMembersOptions(orgId, {
      query: search,
      limit: pagination.pageSize,
      offset: pagination.pageIndex * pagination.pageSize,
    }),
    placeholderData: keepPreviousData, // Keep old data while fetching new page
  });

  const columns = [
    { accessorKey: "user.name", header: "Name" },
    { accessorKey: "user.email", header: "Email" },
    { accessorKey: "role", header: "Role", cell: ({ row }) => (
      <Badge variant="outline">{row.original.role}</Badge>
    )},
    { id: "actions", cell: ({ row }) => <MemberActions member={row.original} /> },
  ];

  return (
    <DataGridEnhanced
      columns={columns}
      data={data?.data ?? []}
      manualPagination
      pageCount={Math.ceil((data?.total ?? 0) / pagination.pageSize)}
      pagination={pagination}
      onPaginationChange={setPagination}
      isLoading={isLoading}
    >
      <DataGridEnhanced.Toolbar searchable searchBind={bind} showColumnVisibility />
      <DataGridEnhanced.Content />
      <DataGridEnhanced.Pagination showRowsPerPage />
    </DataGridEnhanced>
  );
}
```

## Context

- `DataGridEnhanced` wraps `@tanstack/react-table` with UI chrome
- Use `manualPagination` with `pageCount` for server-side pagination
- `keepPreviousData` from React Query prevents layout shift between pages
- `useDebouncedSearchParam` syncs search input with URL search params
- Column definitions follow TanStack Table's `ColumnDef` type
- Sub-components: `.Toolbar`, `.Content`, `.Pagination` for composition
- Backend must return `{ data: T[], total: number }` for pagination to work
