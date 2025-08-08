'use client';

import { StaffMail } from "@/lib/types";
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
import {useEffect} from 'react';
import { Datetime2Thai } from "@/lib/utils";
import { getStaffMails } from "./actions/mail";

const staffColumns: ColumnDef<StaffMail>[] = [
 {
    id: 'วันที่',
    accessorKey: "createdAt",
    sortingFn: (rowA: Row<StaffMail>, rowB: Row<StaffMail>, columnId: string) => {
      const dateA = new Date(rowA.getValue(columnId));
      const dateB = new Date(rowB.getValue(columnId));
      return dateA.getTime() - dateB.getTime(); // ascending
    },
    header: ({ column }: { column: Column<StaffMail> }) => {
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
    cell: ({ row }: { row: Row<StaffMail> }) => {
      return (
        <div>
          {Datetime2Thai(row.getValue('createdAt'))}
          </div>
      );
    },
  }, {
    id: 'เลขหนังสือ',
    accessorKey: "documentNo",
    header: ({ column }: { column: Column<StaffMail> }) => {
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
    cell: ({ row }: { row: Row<StaffMail> }) => {
      return (
        <div>
          {row.getValue('documentNo')?? '-'}
          </div>
      );
    },
  }, {
    id: 'จำนวนคำสั่งศาล',
    accessorKey: "numDocuments",
    header: ({ column }: { column: Column<StaffMail>}) => {
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
    cell: ({ row }: { row: Row<StaffMail> }) => {

      return (
        <div>
          {row.getValue('numDocuments')?? '-'}
          </div>
      );
    },
  }, {
    id: 'ส่ง',
    accessorKey: "sends",
    sortingFn: (rowA: Row<StaffMail>, rowB: Row<StaffMail>, columnId: string) => {
      const splitedAs = (rowA.getValue(columnId) as string).split('/');
      const splitedBs = (rowB.getValue(columnId) as string).split('/');
      const a = parseFloat(splitedAs[0])/parseFloat(splitedAs[1]);
      const b = parseFloat(splitedBs[0])/parseFloat(splitedBs[1]);
      return a - b; // ascending
    },
    header: ({ column }: { column: Column<StaffMail> }) => {
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
    cell: ({ row }: { row: Row<StaffMail> }) => {

      return (
        <div>
          {row.getValue('sends')?? '-'}
          </div>
      );
    },
  }, {
    id: 'ยืนยัน',
    accessorKey: "confirms",
    sortingFn: (rowA: Row<StaffMail>, rowB: Row<StaffMail>, columnId: string) => {
      const splitedAs = (rowA.getValue(columnId) as string).split('/');
      const splitedBs = (rowB.getValue(columnId) as string).split('/');
      const a = parseFloat(splitedAs[0])/parseFloat(splitedAs[1]);
      const b = parseFloat(splitedBs[0])/parseFloat(splitedBs[1]);
      return a - b; // ascending
    },
    header: ({ column }: { column: Column<StaffMail>}) => {
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
    cell: ({ row }: { row: Row<StaffMail> }) => {

      return (
        <div>
          {row.getValue('confirms')?? '-'}
          </div>
      );
    },
  }
]

export default function MailTable() {
    const [sorting, setSorting] = useState<SortingState>([])
    const [tableData, setTableData] = useState([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
        []
    );
    const columns = staffColumns;
    const [columnVisibility, setColumnVisibility] =
        useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = useState({}) 
    const table = useReactTable({
        data: tableData,
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

  useEffect(() => {
    const getData = async() => {
      try {
        const data = await getStaffMails(); 
        console.log(data)
        setTableData(data);
      } catch (error) {
        console.error(error);
        setTableData([]);
      }
    }

    getData();
  }, []);

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
                .filter((column: Column<StaffMail>) => column.getCanHide())
                .map((column: Column<StaffMail>) => {
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
            {table.getHeaderGroups().map((headerGroup: HeaderGroup<StaffMail>) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header: Header<StaffMail, unknown>) => {
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
              table.getRowModel().rows.map((row: Row<StaffMail>) => {
                return (
                <TableRow
                  key={row.id}
                  className="cursor-pointer"
                >
                  {row.getVisibleCells().map((cell: Cell<StaffMail, unknown>) => (
                    <TableCell key={cell.id}>
                        <Link href={`/mail/${row.original.mailGroupId}`}>
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
    );
}