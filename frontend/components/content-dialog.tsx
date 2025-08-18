"use client"

import * as React from "react";
import Link from 'next/link';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  RowSelectionState,
  PaginationState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  Table as TB,
  Header,
  HeaderGroup,
  Cell,
  Row,
  Column,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown } from "lucide-react"
import { setColumnFilters, setRowSelection, setColumnVisibility,
  setSorting, setPagination, setDocIds} 
  from "./store/features/dialog-list-ui-slice";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { type Document } from "@/lib/types";

import {
  type Updater,
} from '@tanstack/react-table';
import { RootState } from "./store";
import { Date2Thai } from "@/lib/utils";

function resolveUpdater<T>(updater: Updater<T>, previous: T): T {
  return typeof updater === "function"
    ? (updater as (prev: T) => T)(previous)
    : updater;
}

export const columns: ColumnDef<Document>[] = [
  {
    id: "select",
    header: ({ table }: { table: TB<Document> }) => (
      <div className="ml-2">
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value: boolean | "indeterminate") => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
      </div>
    ),
    cell: ({ row }: { row: Row<Document> }) => {
      const original = row.original;
      const active = original?.active?? false;
        if (active)
          return (
            <div className="ml-2">
              <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value: boolean) => row.toggleSelected(!!value)}
                aria-label="Select row"
                disabled={!active}
              />
            </div>
          );
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: 'คำสั่งศาล',
    accessorKey: "orderNo",
    header: ({column}: { column: Column<Document> }) => {
      return (
        <div className='flex gap-x-2 text-left justify-start p-0 m-0'
        >
          คำสั่งศาล
          <ArrowUpDown size={16} className="cursor-pointer"
          onClick={(e: React.MouseEvent<SVGSVGElement>) => {
            e.preventDefault();
            column.toggleSorting(column.getIsSorted() === "asc");
          }}/>
        </div>
      )
    },
    cell: ({ row }: { row: Row<Document> }) => 
    {
      const original = row.original;
      const id = original?.id?? '';
      return (<Link
        href={`/document-view/${id}`}
        target="_blank" rel="noopener noreferrer"
        className="text-left underline cursor-pointer hover:text-blue-400">{row.getValue('คำสั่งศาล')?? '-'}</Link>);
    }
  },
    {
      id: 'วันที่',
    accessorKey: "orderDate",
    sortingFn: (rowA: Row<Document>, rowB: Row<Document>, columnId: string) => {
      const dateA = new Date(rowA.getValue(columnId));
      const dateB = new Date(rowB.getValue(columnId));
      return dateA.getTime() - dateB.getTime(); // ascending
    },
    header: ({ column }: { column: Column<Document> }) => {
      return (
        <div className='flex gap-x-2 text-left justify-start -ml-1'>
          วันที่
          <ArrowUpDown size={16} className="cursor-pointer"
          onClick={(e: React.MouseEvent<SVGSVGElement>) => {
            e.preventDefault();
            column.toggleSorting(column.getIsSorted() === "asc");
          }}/>
        </div>
      )
    },
    cell: ({ row }: { row: Row<Document> }) => {

      return (
        <div>
          {
            row.getValue('วันที่')?
            Date2Thai(row.getValue('วันที่')): '-'
          }
          </div>
      );
    },
  },
  {
    id: 'คดีหมายเลขดำ',
    accessorKey: "orderblackNo",
    header: ({ column }: { column: Column<Document> }) => {
      return (
        <div className='inline-flex gap-x-2 w-full -ml-2'
        >คดีหมายเลขดำ
          <ArrowUpDown size={16} className="cursor-pointer"
          onClick={(e: React.MouseEvent<SVGSVGElement>) => {
            e.preventDefault();
            column.toggleSorting(column.getIsSorted() === "asc");
          }}/>
        </div>
      )
    },
    cell: ({ row }: { row: Row<Document> }) => {
      return (
        <div>
          {row.getValue('คดีหมายเลขดำ')?? '-'}
          </div>
      );
    },
  },
  {
    id: 'คดีหมายเลขแดง',
    accessorKey: "orderredNo",
    header: ({ column }: { column: Column<Document> }) => {
      return (
        <div className='inline-flex gap-x-2 w-full -ml-3'
        >คดีหมายเลขแดง
          <ArrowUpDown size={16}
          className="cursor-pointer" onClick={(e: React.MouseEvent<SVGSVGElement>) => {
            e.preventDefault();
            column.toggleSorting(column.getIsSorted() === "asc");
          }}/>
        </div>
      )
    },
    cell: ({ row }: { row: Row<Document> }) => {
      return (
        <div>
          {row.getValue('คดีหมายเลขแดง')?? '-'}
          </div>
      );
    },
  }, {
    id: 'ประเภท',
    accessorKey: "kindName",
    header: ({ column }: { column: Column<Document> }) => {
      return (
        <div className='inline-flex gap-x-2 w-full '
        >
          ประเภท
          <ArrowUpDown size={16} className="cursor-pointer" onClick={(e: React.MouseEvent<SVGSVGElement>) => {
            e.preventDefault();
            column.toggleSorting(column.getIsSorted() === "asc");
          }}/>
        </div>
      )
    },
    cell: ({ row }: { row: Row<Document> }) => {
      return (
        <div>
          {row.getValue('ประเภท')?? '-'}
          </div>
      );
    },
  },
]

export default function ContentDialog({data}: {data: Document[]}) {
  const dispatch = useAppDispatch();
  const sorting = useAppSelector((state: RootState) => state.dialogListUi.sorting);
  const columnFilters = useAppSelector((state: RootState) => state.dialogListUi.columnFilters);
  const columnVisibility = useAppSelector((state: RootState) => state.dialogListUi.columnVisibility);
  const rowSelection = useAppSelector((state: RootState) => state.dialogListUi.rowSelection);
  const pagination = useAppSelector((state: RootState)=>state.dialogListUi.pagination); 

  const table = useReactTable({
    data,
    columns,
    onSortingChange: (updater: Updater<SortingState>) =>
      dispatch(setSorting(resolveUpdater(updater, sorting))),
    onColumnFiltersChange: (updater: Updater<ColumnFiltersState>) =>
      dispatch(setColumnFilters(resolveUpdater(updater, columnFilters))),
    onColumnVisibilityChange: (updater: Updater<VisibilityState>) =>
      dispatch(setColumnVisibility(resolveUpdater(updater, columnVisibility))),
    onRowSelectionChange: (updater: Updater<RowSelectionState>) =>
      dispatch(setRowSelection(resolveUpdater(updater, rowSelection))),
    onPaginationChange: (updater: Updater<PaginationState>) =>
      dispatch(setPagination(resolveUpdater(updater, pagination))),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination
    },
    enableMultiSort: true
  });


  React.useEffect(() => {
    if (table)
    {
      const selectedIds = table.getSelectedRowModel()
        .rows.map((row: Row<Document>) => row.original.id);
      dispatch(setDocIds(selectedIds));
    }
  }, [rowSelection]);

  return (
    <div className="block w-full">
      <div className="flex items-center py-4 w-full">
        <Input
          placeholder="ค้นหาคำสั่งศาล..."
          value={(table.getColumn("คำสั่งศาล")?.getFilterValue() as string) ?? ""}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            table.getColumn("คำสั่งศาล")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <div className="ml-auto flex items-center gap-x-2 w-full">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                คอลัมน์<ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column: Column<Document>) => column.getCanHide())
                .map((column: Column<Document>) => {
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
      <div className="rounded-md border w-full">
        <Table>
          <TableHeader className="block w-full">
            {table.getHeaderGroups().map((headerGroup: HeaderGroup<Document>) => (
              <TableRow key={headerGroup.id} className="flex items-center justify-between w-full">
                {headerGroup.headers.map((header: Header<Document, unknown>, idx2: number) => {
                  return (
                    <TableHead key={header.id} className={`flex flex-col justify-center  p-0 m-0 ${idx2 === 0? "flex-[1]": "flex-[2]"}`}>
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
          <TableBody className="block max-h-[50vh] overflow-auto w-full">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row: Row<Document>) => {
                const original = row.original;
                const active = original?.active?? false;
                return (
                <TableRow
                  key={row.id}
                  data-state={active? row.getIsSelected() && "selected": ""}
                  className={`flex items-center justify-between w-full ${active? "": "bg-muted text-gray-400"}`}
                >
                  {row.getVisibleCells().map((cell: Cell<Document, unknown>, idx2: number) => (
                    <TableCell key={cell.id} className={`flex flex-col justify-center px-0 mx-0  ${idx2 === 0? "flex-[1]": "flex-[2]"}`}>
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
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
