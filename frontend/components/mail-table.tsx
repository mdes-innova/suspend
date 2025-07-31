'use client';

import { type Mail, type Group } from "@/lib/types";
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
import { ArrowUpDown, ChevronDown, MoreHorizontal, SlidersVertical, Plus } from "lucide-react"
import { Input } from "./ui/input";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import {useState} from 'react';
import Link from 'next/link';
import { NewPlaylistSheet } from "./main/new-playlist-sheet";
import { openModal, PLAYLISTUI } from './store/features/playlist-diaolog-ui-slice';
import { useAppDispatch, useAppSelector } from './store/hooks';
import {useEffect} from 'react';
import { getGroups } from "./actions/group";
import { getMails } from "./actions/group-file";

const columns: ColumnDef<(Group | any)[]> = [
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
      const { createdAt } = row.original;

      return (
        <div>
          {(new Date(createdAt)).toLocaleString("en-GB", {
            year: "numeric",
            day: "2-digit",
            month: "2-digit"
          })}
          </div>
      );
    },
  },
  {
    id: 'ชื่อ',
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
  },
  {
    id: 'ชนิด',
    accessorKey: "isDraft",
    header: ({ column }) => {
      return (
        <div className='inline-flex gap-x-2 w-full justify-end'
        >
            ชนิด
          <ArrowUpDown size={16} className="cursor-pointer" onClick={(e: any) => {
            e.preventDefault();
            column.toggleSorting(column.getIsSorted() === "asc");
          }}/>
        </div>
      )
    },
    cell: ({ row }) => {
      const { isDraft } = row.original;

      return (
        <div className={`text-right ${isDraft? 'text-green-900': 'text-amber-800'}`}>
          {isDraft? 'ฉบับบร่าง': 'ส่ง ISP'}
          </div>
      );
    },
  }
]

export default function MailTable({data, isp}: {data: Mail[], isp?: boolean}) {
    const [sorting, setSorting] = useState<SortingState>([])
    const [tableData, setTableData] = useState(data);
    const dispatch = useAppDispatch();
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
        []
    );
    const user = useAppSelector(state => state.userAuth.user);
    const dataChanged = useAppSelector(state=>state.groupListUi.dataChanged);
    const [columnVisibility, setColumnVisibility] =
        useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = useState({})
    const table = useReactTable({
        data: tableData,
        columns: (user?.isp || isp !== undefined)? columns.slice(0, 2): columns,
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
        const data = await getMails(isp); 
        setTableData(data);
      } catch (error) {
        setTableData([]);
      }
    }

    getData();
  }, [dataChanged]);

    return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="ค้นหา กล่องข้อความ..."
          value={(table.getColumn("ชื่อ")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("ชื่อ")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <div className="ml-auto flex items-center gap-x-1">
          <NewPlaylistSheet main={true}/>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns <ChevronDown />
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
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                        <Link href={`/document-groups/${row.original.id}`}>
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