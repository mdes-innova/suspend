'use client';

import { Mail, User, type Group } from "@/lib/types";
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
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, MoreHorizontal, Trash2, FolderPen, Plus } from "lucide-react"
import { Input } from "./ui/input";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import {useState} from 'react';
import Link from 'next/link';
import { NewPlaylistSheet } from "./main/new-playlist-sheet";
import { openModal, PLAYLISTUI } from './store/features/playlist-diaolog-ui-slice';
import { useAppDispatch, useAppSelector } from './store/hooks';
import {useEffect, useRef} from 'react';
import { getGroupList, getGroups, RemoveGroup, RenameGroup } from "./actions/group";
import { Datetime2Thai } from "@/lib/utils";
import {useRouter} from 'next/navigation';
import { setRename, toggleDataChanged } from "./store/features/group-list-ui-slice";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Label } from "./ui/label";
import { getMails } from "./actions/mail";

const staffColumns: ColumnDef<(Mail | any)[]> = [
 {
    id: 'วันที่',
    accessorKey: "createdAt",
    sortingFn: (rowA, rowB, columnId) => {
      const dateA = new Date(rowA.getValue(columnId));
      const dateB = new Date(rowB.getValue(columnId));
      return dateA.getTime() - dateB.getTime(); // ascending
    },
    header: ({ column }) => {
      return (
        <div className='inline-flex gap-x-2 w-full '
        >
          วันที่
          <ArrowUpDown size={16} className="cursor-pointer" onClick={(e: any) => {
            e.preventDefault();
            column.toggleSorting(column.getIsSorted() === "asc");
          }}/>
        </div>
      )
    },
    cell: ({ row }) => {
      const { datetime } = row.original;

      return (
        <div>
          {Datetime2Thai(datetime)}
          </div>
      );
    },
  }, {
    id: 'ชื่อเรื่อง',
    accessorKey: "subject",
    header: ({ column }) => {
      return (
        <div className='inline-flex gap-x-2 w-full '
        >
            ชื่อ
          <ArrowUpDown size={16} className="cursor-pointer" onClick={(e: any) => {
            e.preventDefault();
            column.toggleSorting(column.getIsSorted() === "asc");
          }}/>
        </div>
      )
    },
    cell: ({ row }) => {
      const { subject } = row.original;
      return (
        <div>
          {subject?? '-'}
          </div>
      );
    },
  }, {
    id: 'ผู้ให้บริการ',
    accessorKey: "receiver",
    sortingFn: (rowA, rowB, columnId) => {
      const ispA = rowA.getValue(columnId).isp.name;
      const ispB = rowB.getValue(columnId).isp.name;
      return ispA - ispB; // ascending
    },
    header: ({ column }) => {
      return (
        <div className='inline-flex gap-x-2 w-full '
        >
            ผู้ให้บริการ
          <ArrowUpDown size={16} className="cursor-pointer" onClick={(e: any) => {
            e.preventDefault();
            column.toggleSorting(column.getIsSorted() === "asc");
          }}/>
        </div>
      )
    },
    cell: ({ row }) => {
      const { receiver } = row.original;
      return (
        <div>
          {receiver?.isp?.name?? '-'}
          </div>
      );
    },
  }, {
    id: 'จำนวนคำสั่งศาล',
    accessorKey: "documents",
    sortingFn: (rowA, rowB, columnId) => {
      const lenA = rowA.getValue(columnId).length;
      const lenB = rowB.getValue(columnId).length;
      return lenA - lenB; // ascending
    },
    header: ({ column }) => {
      return (
        <div className='inline-flex gap-x-2 w-full '
        >
            จำนวนคำสั่งศาล
          <ArrowUpDown size={16} className="cursor-pointer" onClick={(e: any) => {
            e.preventDefault();
            column.toggleSorting(column.getIsSorted() === "asc");
          }}/>
        </div>
      )
    },
    cell: ({ row }) => {
      const { documents } = row.original;

      return (
        <div>
          {documents?.length?? '-'}
          </div>
      );
    },
  }, {
    id: 'สถานะการส่ง',
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <div className='inline-flex gap-x-2 w-full '
        >
            สถานะการส่ง
          <ArrowUpDown size={16} className="cursor-pointer" onClick={(e: any) => {
            e.preventDefault();
            column.toggleSorting(column.getIsSorted() === "asc");
          }}/>
        </div>
      )
    },
    cell: ({ row }) => {
      const { status} = row.original;

      let sendStatus = '-';
      let sendColor = '';

      switch (status) {
        case 'successful':
          sendStatus = 'สำเร็จ' 
          sendColor = 'text-green-700'
          break;
        case 'fail':
          sendStatus = 'ไม่สำเร็จ' 
          sendColor = 'text-red-700'
          break;
        case 'idle':
          sendStatus = 'ยังไม่ส่ง' 
          sendColor = 'text-orange-700'
          break;
      
        default:
          break;
      }

      return (
        <div className={sendColor}>
          {sendStatus}
          </div>
      );
    },
  }, {
    id: 'ยืนยันสถานะ',
    accessorKey: "confirmed",
    header: ({ column }) => {
      return (
        <div className='inline-flex gap-x-2 w-full '
        >
            ยืนยันสถานะ
          <ArrowUpDown size={16} className="cursor-pointer" onClick={(e: any) => {
            e.preventDefault();
            column.toggleSorting(column.getIsSorted() === "asc");
          }}/>
        </div>
      )
    },
    cell: ({ row }) => {
      const { confirmed } = row.original;

      return (
        <div className={`${confirmed? 'text-green-700': 'text-red-700'}`}>
          {confirmed? 'ยืนยันแล้ว': 'ยังไม่ยืนยัน'}
          </div>
      );
    },
  }
]

const ispColumns: ColumnDef<(Mail | any)[]> = [
  {
    id: 'ส่งวันที่',
    accessorKey: "datetime",
    sortingFn: (rowA, rowB, columnId) => {
      const dateA = new Date(rowA.getValue(columnId));
      const dateB = new Date(rowB.getValue(columnId));
      return dateA.getTime() - dateB.getTime(); // ascending
    },
    header: ({ column }) => {
      return (
        <div className='inline-flex gap-x-2 w-full '
        >
          วันที่
          <ArrowUpDown size={16} className="cursor-pointer" onClick={(e: any) => {
            e.preventDefault();
            column.toggleSorting(column.getIsSorted() === "asc");
          }}/>
        </div>
      )
    },
    cell: ({ row }) => {
      const { datetime } = row.original;

      return (
        <div>
          {Datetime2Thai(datetime)}
          </div>
      );
    },
  }, {
    id: 'ชื่อเรื่อง',
    accessorKey: "subject",
    header: ({ column }) => {
      return (
        <div className='inline-flex gap-x-2 w-full '
        >
            ชื่อ
          <ArrowUpDown size={16} className="cursor-pointer" onClick={(e: any) => {
            e.preventDefault();
            column.toggleSorting(column.getIsSorted() === "asc");
          }}/>
        </div>
      )
    },
    cell: ({ row }) => {
      const { subject } = row.original;
      return (
        <div>
          {subject?? '-'}
          </div>
      );
    },
  }, {
    id: 'จำนวนคำสั่งศาล',
    accessorKey: "documents",
    sortingFn: (rowA, rowB, columnId) => {
      const lenA = rowA.getValue(columnId).length;
      const lenB = rowB.getValue(columnId).length;
      return lenA - lenB; // ascending
    },
    header: ({ column }) => {
      return (
        <div className='inline-flex gap-x-2 w-full '
        >
            จำนวนคำสั่งศาล
          <ArrowUpDown size={16} className="cursor-pointer" onClick={(e: any) => {
            e.preventDefault();
            column.toggleSorting(column.getIsSorted() === "asc");
          }}/>
        </div>
      )
    },
    cell: ({ row }) => {
      const { documents } = row.original;

      return (
        <div>
          {documents?.length?? '-'}
          </div>
      );
    },
  }, {
    id: 'ยืนยันสถานะ',
    accessorKey: "confirmed",
    header: ({ column }) => {
      return (
        <div className='inline-flex gap-x-2 w-full '
        >
            ยืนยันสถานะ
          <ArrowUpDown size={16} className="cursor-pointer" onClick={(e: any) => {
            e.preventDefault();
            column.toggleSorting(column.getIsSorted() === "asc");
          }}/>
        </div>
      )
    },
    cell: ({ row }) => {
      const { confirmed } = row.original;

      return (
        <div>
          {confirmed? 'ยืนยันแล้ว': 'ยังไม่ยืนยัน'}
          </div>
      );
    },
  }
]

export default function MailTable({
  user
}: {
  user: User
}) {
    const [sorting, setSorting] = useState<SortingState>([])
    const [tableData, setTableData] = useState([]);
    const dispatch = useAppDispatch();
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
        []
    );
    const columns = user.isp? ispColumns: staffColumns;
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
        const data = await getMails(); 
        setTableData(data);
      } catch (error) {
        setTableData([]);
      }
    }

    getData();
  }, []);

    return (
    <div className="w-full">
      <div className="flex items-center py-4">
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
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
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
            {table.getHeaderGroups().map((headerGroup, idx: number) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
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
              table.getRowModel().rows.map((row) => {
                return (
                <TableRow
                  key={row.id}
                  className="cursor-pointer"
                >
                  {row.getVisibleCells().map((cell, idx) => (
                    <TableCell key={cell.id}>
                        {idx != row.getVisibleCells().length - 1? <Link href={`/document-groups/${row.original.id}`}>
                            {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                            )}
                            </Link>:
                            <div>
                              {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext()
                              )}
                            </div>
                          }
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