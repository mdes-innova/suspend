"use client"

import * as React from "react";
import Link from 'next/link';
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
import { ArrowUpDown, ChevronDown, MoreHorizontal, SlidersVertical } from "lucide-react"
import { setColumnFilters, setRowSelection, setColumnVisibility, setSorting, setPagination} 
  from "../store/features/content-list-ui-slice";
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
import { toast } from "sonner";
import ActionDropdown from "../action-dropdown";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setDocIds } from "../store/features/playlist-diaolog-ui-slice";

import {
  type Updater,
} from '@tanstack/react-table';
import { getContent } from "../actions/document";


function isUpdaterFunction<T>(updater: Updater<T>): updater is (old: T) => T {
  return typeof updater === 'function';
}

function resolveUpdater<T>(updater: Updater<T>, previous: T): T {
  return isUpdaterFunction(updater) ? updater(previous) : updater;
}

function PinIcon({docId}: {docId: number}) {
    const [pinned, setPinned] = React.useState(false);
  return (
    <div className="max-w-8 "
        onClick={(e: any) => {
            e.preventDefault();
            const newPinned = !pinned;
            toast("Document pinned", {
              position: "bottom-left",
              description: `$document is ${newPinned? "pinned" : "unpinned"}.`,
            });
            setPinned(newPinned);
        }}>
        <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`lucide lucide-pin-icon text-foreground 
            ${pinned? "opacity-100 fill-primary": "opacity-50 fill-none"}`}
        xmlns="http://www.w3.org/2000/svg"
        >
        <g transform="rotate(44.30421,10.092912,11.49921)">
            <path d="M12 17v5" />
            <path
            d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"
            strokeWidth="2"
            />
        </g>
        </svg>
    </div>
  );
}


export const columns: ColumnDef<DocumentType | any>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => {
      const { active } = row.original;
        if (active)
          return (
            <Checkbox 
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="Select row"
              disabled={!active}
            />
          );
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: 'คำสั่งศาล',
    accessorKey: "orderNo",
    header: ({ column }) => {
      return (
        <div className='inline-flex gap-x-2 w-full '
        >
          คำสั่งศาล
          <ArrowUpDown size={16} className="cursor-pointer" onClick={(e: any) => {
            e.preventDefault();
            column.toggleSorting(column.getIsSorted() === "asc");
          }}/>
        </div>
      )
    },
    cell: ({ row }) => 
    {
      const { orderNo, id } = row.original;
      return (<Link
        href={`/document-view/${id}`}
        className="text-left underline cursor-pointer hover:text-blue-400">{orderNo}</Link>);
    }
  },
    {
      id: 'วันที่',
    accessorKey: "orderDate",
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
            // column.getToggleSortingHandler();
            column.toggleSorting(column.getIsSorted() === "asc");
          }}/>
        </div>
      )
    },
    cell: ({ row }) => {
      const { orderDate } = row.original;

      return (
        <div>
          {(new Date(orderDate)).toLocaleString("en-GB", {
            year: "numeric",
            day: "2-digit",
            month: "2-digit"
          })}
          </div>
      );
    },
  },
  {
    id: 'คดีหมายเลขดำ',
    accessorKey: "orderblackNo",
    header: ({ column }) => {
      return (
        <div className='inline-flex gap-x-2 w-full '
        >
          หมายเลขคดีดำ
          <ArrowUpDown size={16} className="cursor-pointer" onClick={(e: any) => {
            e.preventDefault();
            column.toggleSorting(column.getIsSorted() === "asc");
          }}/>
        </div>
      )
    },
    cell: ({ row }) => {
      const { orderblackNo } = row.original;
      return (
        <div>
          {orderblackNo?? '-'}
          </div>
      );
    },
  },
  {
    id: 'คดีหมายเลขแดง',
    accessorKey: "orderredNo",
    header: ({ column }) => {
      return (
        <div className='inline-flex gap-x-2 w-full '
        >
          หมายเลขคดีแดง
          <ArrowUpDown size={16} className="cursor-pointer" onClick={(e: any) => {
            e.preventDefault();
            column.toggleSorting(column.getIsSorted() === "asc");
          }}/>
        </div>
      )
    },
    cell: ({ row }) => {
      const { orderredNo } = row.original;

      return (
        <div>
          {orderredNo?? '-'}
          </div>
      );
    },
  }, 
    {
      id: 'ดาวน์โหลด',
    accessorKey: "downloads",
     header: ({ column }) => {
      return (
        <div className='flex gap-x-2 w-full items-center justify-end '
        >
          ดาวน์โหลด
          <ArrowUpDown size={16} className="cursor-pointer" onClick={(e: any) => {
            e.preventDefault();
            column.toggleSorting(column.getIsSorted() === "asc");
          }}/>
        </div>
      )
    },
    cell: ({ row }) => {
      const { downloads } = row.original;
      return (<div className="text-right">{downloads}</div>);

    }
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const { id, active } = row.original;
      return (
        <ActionDropdown docId={ id } active={active} className="flex text-right w-full justify-end bg-red-400">
          <MoreHorizontal />
        </ActionDropdown>
      )
    },
  },
]

export default function DataTable({ data }: { data: Document[] }) {
  const ws = ['max-w-6', 'w-24', 'w-16', 'w-16', 'w-10', ''];
  const dispatch = useAppDispatch();
  const [tableData, setTableData] = React.useState<Document[]>(data);
  const sorting = useAppSelector((state) => state.contentListUi.sorting);
  const columnFilters = useAppSelector((state) => state.contentListUi.columnFilters);
  const columnVisibility = useAppSelector((state) => state.contentListUi.columnVisibility);
  const rowSelection = useAppSelector((state) => state.contentListUi.rowSelection);
  const pagination = useAppSelector(state=>state.contentListUi.pagination); 
  const playlistUi = useAppSelector(state=>state.playlistDialogUi.listOpen);
  const playlistNewUi = useAppSelector(state=>state.playlistDialogUi.newOpen);
  const dataChaged = useAppSelector(state=>state.playlistDialogUi.dataChanged);
  const toggleDataState = useAppSelector(state=>state.contentListUi.toggleDataState);

  const table = useReactTable({
    data: tableData,
    columns,
    onSortingChange: (updater) =>
      dispatch(setSorting(resolveUpdater(updater, sorting))),
    onColumnFiltersChange: (updater) =>
      dispatch(setColumnFilters(resolveUpdater(updater, columnFilters))),
    onColumnVisibilityChange: (updater) =>
      dispatch(setColumnVisibility(resolveUpdater(updater, columnVisibility))),
    onRowSelectionChange: (updater) =>
      dispatch(setRowSelection(resolveUpdater(updater, rowSelection))),
    onPaginationChange: (updater) =>
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

  React.useEffect(()=>{
    const getData = async() => {
      try {
        const data = await getContent();
        setTableData(data);
      } catch (error) {
        setTableData([]);
      }
    };

    if (!playlistNewUi && !playlistUi && dataChaged) getData();
  }, [playlistUi, playlistNewUi]);

  React.useEffect(()=>{
    const getData = async() => {
      try {
        const data = await getContent();
        setTableData(data);
      } catch (error) {
        setTableData([]);
      }
    };

    getData();

  }, [toggleDataState]);

    React.useEffect(()=>{
     if (table) {
      table.resetRowSelection(true);
     }
    }, [tableData]);


  React.useEffect(() => {
    if (table)
    {
      const selectedIds = table.getSelectedRowModel().rows.map(row => row.original.id);
      dispatch(setDocIds(selectedIds));
      // table.toggleAllPageRowsSelected(false);
    }
  }, [rowSelection]);

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="ค้นหาคำสั่งศาล..."
          value={(table.getColumn("คำสั่งศาล")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("คำสั่งศาล")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <div className="ml-auto flex items-center gap-x-2">
          {Object.keys(rowSelection || {}).length > 0 ? (
            <ActionDropdown>
                <SlidersVertical />
            </ActionDropdown>
          ) : (
            <></>
          )}
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
                const { selected, active } = row.original;
                return (
                <TableRow
                  key={row.id}
                  data-state={active? row.getIsSelected() && "selected": ""}
                  className={`${active? selected? "bg-muted": "": "bg-gray-100 text-gray-400"}`}
                >
                  {row.getVisibleCells().map((cell) => (
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
