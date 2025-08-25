'use client';

import { Mail, MailGroup } from "@/lib/types";
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
import { ArrowUpDown, ChevronDown } from "lucide-react"
import { Input } from "./ui/input";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import {useState} from 'react';
import Link from 'next/link';
import { Datetime2Thai } from "@/lib/client/utils";

const staffColumns: ColumnDef<MailGroup>[] = [
 {
    id: 'วันที่',
    accessorKey: "createdAt",
    sortingFn: (rowA: Row<MailGroup>, rowB: Row<MailGroup>, columnId: string) => {
      const dateA = new Date(rowA.getValue(columnId));
      const dateB = new Date(rowB.getValue(columnId));
      return dateA.getTime() - dateB.getTime(); // ascending
    },
    header: ({ column }: { column: Column<MailGroup> }) => {
      return (
        <div className='inline-flex gap-x-2 w-full '
        >
          วันที่
          <ArrowUpDown size={16} className="cursor-pointer"
          onClick={(e: React.MouseEvent<SVGSVGElement>) => {
            e.preventDefault();
            column.toggleSorting(column.getIsSorted() === "asc");
          }}/>
        </div>
      )
    },
    cell: ({ row }: { row: Row<MailGroup> }) => {
      return (
        <div>
          {row.getValue('วันที่')? Datetime2Thai(row.getValue('วันที่')): '-'}
          </div>
      );
    },
  }, {
    id: 'เลขหนังสือ',
    accessorKey: "documentNo",
    header: ({ column }: { column: Column<MailGroup> }) => {
      return (
        <div className='inline-flex gap-x-2 w-full '
        >
            เลขหนังสือ
          <ArrowUpDown size={16} className="cursor-pointer"
          onClick={(e: React.MouseEvent<SVGSVGElement>) => {
            e.preventDefault();
            column.toggleSorting(column.getIsSorted() === "asc");
          }}/>
        </div>
      )
    },
    cell: ({ row }: { row: Row<MailGroup> }) => {
      return (
        <div>
          {row.getValue('เลขหนังสือ')?? '-'}
          </div>
      );
    },
  }, {
    id: 'จำนวนคำสั่งศาล',
    accessorKey: "documents",
    sortingFn: (rowA: Row<MailGroup>, rowB: Row<MailGroup>, columnId: string) => {
      const numA = (rowA.getValue(columnId) as Document[]).length?? 0;
      const numB = (rowB.getValue(columnId) as Document[]).length?? 0;
      return numA - numB; // ascending
    },
    header: ({ column }: { column: Column<MailGroup>}) => {
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
    cell: ({ row }: { row: Row<MailGroup> }) => {
      const original = row.original;
      const noDocuments = original?.documents?.length?? '-';
      return (
        <div>
          {noDocuments}
          </div>
      );
    },
  }, {
    id: 'ส่ง',
    accessorKey: "mails",
    sortingFn: (rowA: Row<MailGroup>, rowB: Row<MailGroup>, columnId: string) => {
      let valueA = -1;
      let valueB = -1;
      
      const mailsA = rowA.getValue(columnId) as Mail[];
      const mailsB = rowB.getValue(columnId) as Mail[];

      if (mailsA.length > 0) {
        const numConfirms = (mailsA.filter((e: Mail) => e?.datetime != null && e?.datetime != undefined)).length;
        valueA = numConfirms/mailsA.length;
      }
      if (mailsB.length > 0) {
        const numConfirms = (mailsB.filter((e: Mail) => e?.datetime != null && e?.datetime != undefined)).length;
        valueB = numConfirms/mailsB.length;
      }

      return valueA - valueB; // ascending
    },
    header: ({ column }: { column: Column<MailGroup> }) => {
      return (
        <div className='inline-flex gap-x-2 w-full '
        >
            ส่ง
          <ArrowUpDown size={16} className="cursor-pointer"
          onClick={(e: React.MouseEvent<SVGSVGElement>) => {
            e.preventDefault();
            column.toggleSorting(column.getIsSorted() === "asc");
          }}/>
        </div>
      )
    },
    cell: ({ row }: { row: Row<MailGroup> }) => {
      const original = row.original;
      const mails = original?.mails as Mail[];
      let sends = '-';
      if (mails && mails?.length) {
        const numSends = (mails.filter((e: Mail) => e?.datetime != null && e?.datetime != undefined)).length;
        sends = `${numSends}/${mails.length}`
      }
      return (
        <div>
          {sends}
          </div>
      );
    },
  }, {
    id: 'ยืนยัน',
    accessorKey: "mails",
    sortingFn: (rowA: Row<MailGroup>, rowB: Row<MailGroup>, columnId: string) => {
      let valueA = -1;
      let valueB = -1;
      
      const mailsA = rowA.getValue(columnId) as Mail[];
      const mailsB = rowB.getValue(columnId) as Mail[];

      if (mailsA.length > 0) {
        const numConfirms = (mailsA.filter((e: Mail) => e?.confirmed)).length;
        valueA = numConfirms/mailsA.length;
      }
      if (mailsB.length > 0) {
        const numConfirms = (mailsB.filter((e: Mail) => e?.confirmed)).length;
        valueB = numConfirms/mailsB.length;
      }

      return valueA - valueB; // ascending
    },
    header: ({ column }: { column: Column<MailGroup>}) => {
      return (
        <div className='inline-flex gap-x-2 w-full '
        >
            ยืนยัน
          <ArrowUpDown size={16} className="cursor-pointer"
          onClick={(e: React.MouseEvent<SVGSVGElement>) => {
            e.preventDefault();
            column.toggleSorting(column.getIsSorted() === "asc");
          }}/>
        </div>
      )
    },
    cell: ({ row }: { row: Row<MailGroup> }) => {
      const original = row.original;
      const mails = original?.mails as Mail[];
      let confirms = '-';
      if (mails && mails?.length) {
        const numConfirms = (mails.filter((e: Mail) => e?.confirmed)).length;
        confirms = `${numConfirms}/${mails.length}`
      }

      return (
        <div>
          {confirms}
          </div>
      );
    },
  }
]

export default function MailTable({ data }: { data: MailGroup[] }) {
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
        []
    );
    const columns = staffColumns;
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
          placeholder="ค้นหาเลขหนังสือ..."
          value={(table.getColumn("เลขหนังสือ")?.getFilterValue() as string) ?? ""}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            table.getColumn("เลขหนังสือ")?.setFilterValue(event.target.value)
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
                .filter((column: Column<MailGroup>) => column.getCanHide())
                .map((column: Column<MailGroup>) => {
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
            {table.getHeaderGroups().map((headerGroup: HeaderGroup<MailGroup>) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header: Header<MailGroup, unknown>) => {
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
              table.getRowModel().rows.map((row: Row<MailGroup>) => {
                return (
                <TableRow
                  key={row.id}
                  className="cursor-pointer"
                >
                  {row.getVisibleCells().map((cell: Cell<MailGroup, unknown>) => (
                    <TableCell key={cell.id}>
                        <Link href={`/mail-group/${row.original.id}`}>
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