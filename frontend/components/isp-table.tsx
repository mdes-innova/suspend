'use client';

import { Isp, User } from "@/lib/types";
import { ArrowUpDown, ChevronDown } from "lucide-react"
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
import Link from 'next/link';
import { useState } from 'react';
import { Input } from "./ui/input";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Date2Thai } from "@/lib/client/utils";

type IspUsers = Isp & { users: User[]};

const columns: ColumnDef<IspUsers>[] = [
{
    id: 'ชื่อ',
    accessorKey: "name",
    header: ({ column }: { column: Column<IspUsers> }) => {
      return (
        <div className='inline-flex gap-x-2 w-full '
        >
            ชื่อ
          <ArrowUpDown size={16} className="cursor-pointer"
          onClick={(e: React.MouseEvent<SVGSVGElement>) => {
            e.preventDefault();
            column.toggleSorting(column.getIsSorted() === "asc");
          }}/>
        </div>
      )
    },
    cell: ({ row }: { row: Row<IspUsers> }) => {
      return (
        <div>
          {row.getValue('ชื่อ')?? '-'}
          </div>
      );
    },
  }, {
    id: 'จำนวนคำสั่งศาล',
    accessorKey: "documents",
    sortingFn: (rowA: Row<IspUsers>, rowB: Row<IspUsers>, columnId: string) => {
      const numA = (rowA.getValue(columnId) as Document[]).length?? 0;
      const numB = (rowB.getValue(columnId) as Document[]).length?? 0;
      return numA - numB; // ascending
    },
    header: ({ column }: { column: Column<IspUsers>}) => {
      return (
        <div className='inline-flex gap-x-2 w-full '
        >
            จำนวนคำสั่งศาล
          <ArrowUpDown size={16} className="cursor-pointer"
          onClick={(e: React.MouseEvent<SVGSVGElement>) => {
            e.preventDefault();
            column.toggleSorting(column.getIsSorted() === "asc");
          }}/>
        </div>
      )
    },
    cell: ({ row }: { row: Row<IspUsers> }) => {
      const original = row.original;
      const noDocuments = original?.documents?.length?? '-';
      return (
        <div>
          {noDocuments}
          </div>
      );
    },
  }, {
    id: 'จำนวนอีเมล',
    accessorKey: "mailCount",
    header: ({ column }: { column: Column<IspUsers>}) => {
      return (
        <div className='inline-flex gap-x-2 w-full '
        >
          จำนวนอีเมล  
          <ArrowUpDown size={16} className="cursor-pointer"
          onClick={(e: React.MouseEvent<SVGSVGElement>) => {
            e.preventDefault();
            column.toggleSorting(column.getIsSorted() === "asc");
          }}/>
        </div>
      )
    },
    cell: ({ row }: { row: Row<IspUsers> }) => {
      return (
        <div>
          {row.getValue('จำนวนอีเมล')?? '-'}
          </div>
      );
    },
  }, {
    id: 'วันที่สร้าง',
    accessorKey: "createdAt",
    sortingFn: (rowA: Row<IspUsers>, rowB: Row<IspUsers>, columnId: string) => {
      const dateA = new Date(rowA.getValue(columnId));
      const dateB = new Date(rowB.getValue(columnId));
      return dateA.getTime() - dateB.getTime(); // ascending
    },
    header: ({ column }: { column: Column<IspUsers> }) => {
      return (
        <div className='inline-flex gap-x-2 w-full '
        >
            วันที่สร้าง
          <ArrowUpDown size={16} className="cursor-pointer"
          onClick={(e: React.MouseEvent<SVGSVGElement>) => {
            e.preventDefault();
            column.toggleSorting(column.getIsSorted() === "asc");
          }}/>
        </div>
      )
    },
    cell: ({ row }: { row: Row<IspUsers> }) => {
      return (
        <div>
          {row.getValue('วันที่สร้าง')? Date2Thai(row.getValue('วันที่สร้าง')): '-'}
          </div>
      );
    },
  }
]

export default function IspTable({ data }: { data: IspUsers[] }) {
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
        []
    );
    const [columnVisibility, setColumnVisibility] =
        useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = useState({}) 
    const table = useReactTable({
        data: data?? [],
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
        sorting,
        columnFilters,
        columnVisibility,
        rowSelection,
        },
  })

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="ค้นหา ISP..."
          value={(table.getColumn("ชื่อ")?.getFilterValue() as string) ?? ""}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            table.getColumn("ชื่อ")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <div className="ml-auto flex items-center gap-x-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                คอลัมน์ <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column: Column<IspUsers>) => column.getCanHide())
                .map((column: Column<IspUsers>) => {
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
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup: HeaderGroup<IspUsers>) => (
              <TableRow key={headerGroup.id}>
                <TableHead>
                    ลำดับที่
                </TableHead>
                {headerGroup.headers.map((header: Header<IspUsers, unknown>) => {
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
              table.getRowModel().rows.map((row: Row<IspUsers>, idx: number) => {
                return (
                <TableRow
                  key={row.id}
                  className="cursor-pointer"
                >
                    <TableCell>
                        {idx + 1}
                    </TableCell>
                  {row.getVisibleCells().map((cell: Cell<IspUsers, unknown>) => (
                    <TableCell key={cell.id}>
                        <Link href={`/profile-view/isp/${row?.original?.id}/`}>
                            {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                            )}
                        </Link>
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