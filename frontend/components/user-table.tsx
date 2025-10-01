'use client';

import { User } from "@/lib/types";
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
import { useAppSelector } from "./store/hooks";
import { RootState } from "./store";


const columns: ColumnDef<User>[] = [
{
    id: 'ชื่อ',
    accessorKey: "name",
    filterFn: (row: Row<User>, columnId: string, value: string) => {
      void columnId;
      const original = row?.original;
      const name = original?.thaiid? `${original?.givenName} ${original?.familyName}`: original?.username?? '-';
      const v = name.toLowerCase();
      return v.includes(String(value ?? "").toLowerCase());
    },
    sortingFn: (rowA: Row<User>, rowB: Row<User>) => {
      const originalA = rowA.original;
      const nameA = originalA?.thaiid? `${originalA?.givenName} ${originalA?.familyName}`: originalA?.username?? '-';
      const originalB = rowB.original;
      const nameB = originalB?.thaiid? `${originalB?.givenName} ${originalB?.familyName}`: originalB?.username?? '-';
      return nameA.localeCompare(nameB); // ascending
    },
    header: ({ column }: { column: Column<User> }) => {
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
    cell: ({ row }: { row: Row<User> }) => {
      const original = row.original;
      const name = original?.thaiid? `${original?.givenName} ${original?.familyName}`: original?.username?? '-';
      return (
        <div>
          {name}
          </div>
      );
    },
  }, {
    id: 'ประเภท',
    accessorKey: "kind",
    sortingFn: (rowA: Row<User>, rowB: Row<User>) => {
      const originalA = rowA.original;
      const kindA = originalA?.isp?.name?? 'พนักงาน';
      const originalB = rowB.original;
      const kindB = originalB?.isp?.name?? 'พนักงาน';
      return kindA.localeCompare(kindB); // ascending
    },
    header: ({ column }: { column: Column<User> }) => {
      return (
        <div className='inline-flex gap-x-2 w-full '
        >
            ประเภท
          <ArrowUpDown size={16} className="cursor-pointer"
          onClick={(e: React.MouseEvent<SVGSVGElement>) => {
            e.preventDefault();
            column.toggleSorting(column.getIsSorted() === "asc");
          }}/>
        </div>
      )
    },
    cell: ({ row }: { row: Row<User> }) => {
      const original = row.original;
      const kind = original?.isp?.name?? 'พนักงาน';
      return (
        <div>
          {kind}
          </div>
      );
    },
  }, {
    id: 'จำนวนคำสั่งศาล',
    accessorKey: "documents",
    sortingFn: (rowA: Row<User>, rowB: Row<User>) => {
      const originalA = rowA.original;
      const noDocumentsA = originalA?.isp? originalA?.receivedDocumentCount?? '0': originalA?.documentCount?? '0';
      const originalB = rowB.original;
      const noDocumentsB = originalB?.isp? originalB?.receivedDocumentCount?? '0': originalB?.documentCount?? '0';
      return noDocumentsA - noDocumentsB; // ascending
    },
    header: ({ column }: { column: Column<User>}) => {
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
    cell: ({ row }: { row: Row<User> }) => {
      const original = row.original;
      const noDocuments = original?.isp? original?.receivedDocumentCount?? '0': original?.documentCount?? '0';
      return (
        <div>
          {noDocuments}
          </div>
      );
    },
  }, {
    id: 'จำนวนอีเมล',
    accessorKey: "mailCount",
    sortingFn: (rowA: Row<User>, rowB: Row<User>) => {
      const originalA = rowA.original;
      const noDocumentsA = originalA?.isp? originalA?.receivedMailCount?? '0': originalA?.sendMailCount?? '0';
      const originalB = rowB.original;
      const noDocumentsB = originalB?.isp? originalB?.receivedMailCount?? '0': originalB?.sendMailCount?? '0';
      return noDocumentsA - noDocumentsB; // ascending
    },
    header: ({ column }: { column: Column<User>}) => {
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
    cell: ({ row }: { row: Row<User> }) => {
      const original = row.original;
      const noMails = original?.isp? original?.receivedMailCount?? '-': original?.sendMailCount?? '-';
      return (
        <div>
          {noMails}
          </div>
      );
    },
  }
]

export default function UserTable({ data }: { data: User[] }) {
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
        []
    );
    const [columnVisibility, setColumnVisibility] =
        useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = useState({}) 
    const pagination = useAppSelector((state: RootState) => state.utilsUi.userTablePagination);
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
          pagination,
          sorting,
          columnFilters,
          columnVisibility,
          rowSelection,
        },
  })

  return (
    <div className="w-full pb-4">
      <div className="flex items-center py-4">
        <Input
          placeholder="ค้นหา ผู้ใช้งาน..."
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
                .filter((column: Column<User>) => column.getCanHide())
                .map((column: Column<User>) => {
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
            {table.getHeaderGroups().map((headerGroup: HeaderGroup<User>) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header: Header<User, unknown>) => {
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
              table.getRowModel().rows.map((row: Row<User>) => {
                return (
                <TableRow
                  key={row.id}
                  className="cursor-pointer"
                  onClick={() => {
                    window.location.href = `/profile-view/${row?.original?.id}/`
                  }}
                >
                  {row.getVisibleCells().map((cell: Cell<User, unknown>) => (
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
    </div>
  );

}