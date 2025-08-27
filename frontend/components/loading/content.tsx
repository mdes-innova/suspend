'use client';

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  Column,
  Cell,
  Row,
  HeaderGroup,
  Header
} from "@tanstack/react-table";
import { Input } from "../ui/input";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import {useState} from 'react';
import {useEffect} from 'react';
import { Skeleton } from "../ui/skeleton";

type TempDataType = {
    id1: number,
    id2: number,
    id3: number,
    id4: number
}

const staffColumns: ColumnDef<TempDataType>[] = [
 {
    id: 'id1',
    accessorKey: "id1",
    header: () => {
      return (
        <Skeleton className="w-40 h-4"></Skeleton>
      );
    },
    cell: () => {
      return (
        <Skeleton className="w-40 h-4"></Skeleton>
      );
    },
  }, 
 {
    id: 'id2',
    accessorKey: "id2",
    header: () => {
      return (
        <Skeleton className="w-40 h-4"></Skeleton>
      );
    },
    cell: () => {
      return (
        <Skeleton className="w-40 h-4"></Skeleton>
      );
    },
  }, 
 {
    id: 'id3',
    accessorKey: "id3",
    header: () => {
      return (
        <Skeleton className="w-40 h-4"></Skeleton>
      );
    },
    cell: () => {
      return (
        <Skeleton className="w-40 h-4"></Skeleton>
      );
    },
  }, 
 {
    id: 'id4',
    accessorKey: "id4",
    header: () => {
      return (
        <Skeleton className="w-40 h-4"></Skeleton>
      );
    },
    cell: () => {
      return (
        <Skeleton className="w-40 h-4"></Skeleton>
      );
    },
  }, 
]

export default function LoadingTable() {
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
        []
    );
    const columns = staffColumns;
    const [columnVisibility, setColumnVisibility] =
        useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = useState({}) 
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 100,
    });
    const table = useReactTable({
        data: Array.from({length: 100}).map((_, idx: number) => {
            return ({
                id1: idx,
                id2: idx,
                id3: idx,
                id4: idx
            });
        }),
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            pagination,
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
  })

  useEffect(() => {
    if (document) {
      document.body.style.overflow = "hidden";
    }
    return () => {
        if (document)
            document.body.style.overflow = "";
    };
  }, []);

    return (
    <div className="w-full overflow-clip">
      <div className="flex items-center py-4">
        <Input
        disabled
          value={(table.getColumn("id1")?.getFilterValue() as string) ?? ""}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            table.getColumn("id1")?.setFilterValue(event.target.value)
          }
          className="rounded-2xl w-[210px] h-10"
        />
        <div className="ml-auto flex items-center gap-x-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto w-32"
                disabled
              >
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column: Column<TempDataType>) => column.getCanHide())
                .map((column: Column<TempDataType>) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value: boolean) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="rounded-md border"
      >
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup: HeaderGroup<TempDataType>) => (
              <TableRow key={headerGroup.id} className="bg-transparent hover:bg-background">
                {headerGroup.headers.map((header: Header<TempDataType, unknown>) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row: Row<TempDataType>) => {
                return (
                <TableRow
                  key={row.id}
                  className="cursor-default bg-transparent hover:bg-transparent"
                >
                  {row.getVisibleCells().map((cell: Cell<TempDataType, unknown>) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            ก่อนหน้า
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            ถัดไป
          </Button>
        </div>
      </div>
    </div>
    );
}