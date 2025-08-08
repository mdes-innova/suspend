"use client"

import * as React from "react";
import Link from 'next/link';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  Column,
  Row,
  Cell,
  Updater,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  RowSelectionState,
  PaginationState,
  Table as TB,
  HeaderGroup,
  Header
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
import ActionDropdown from "../action-dropdown";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setDocIds } from "../store/features/playlist-diaolog-ui-slice";
import { type Document } from "@/lib/types";
import { getContent } from "../actions/document";
import { RootState } from "../store";


// function isUpdaterFunction<T>(value: Updater<T>): value is (prev: T) => T {
//   return typeof value === "function";
// }

function resolveUpdater<T>(updater: Updater<T>, previous: T): T {
  return typeof updater === "function"
    ? (updater as (prev: T) => T)(previous)
    : updater;
}

export const columns: ColumnDef<Document>[] = [
  {
    id: "select",
    header: ({ table }: { table: TB }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value: boolean | "indeterminate") => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }: { row: Row<Document> }) => {
      const { active } = row.original;
        if (active)
          return (
            <Checkbox 
              checked={row.getIsSelected()}
              onCheckedChange={(value: boolean | "indeterminate") => row.toggleSelected(!!value)}
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
    header: ({ column }: { column: Column<string>}) => {
      return (
        <div className='inline-flex gap-x-2 w-full '
        >
          คำสั่งศาล
          <ArrowUpDown size={16} className="cursor-pointer" onClick={(e: React.MouseEvent<SVGSVGElement>) => {
            e.preventDefault();
            column.toggleSorting(column.getIsSorted() === "asc");
          }}/>
        </div>
      )
    },
    cell: ({ row }: { row: Row<Document> }) => 
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
    sortingFn: (rowA: Row<Document>, rowB: Row<Document>, columnId: string) => {
      const dateA = new Date(rowA.getValue(columnId));
      const dateB = new Date(rowB.getValue(columnId));
      return dateA.getTime() - dateB.getTime(); // ascending
    },
    header: ({ column }: { column: Column<string>}) => {
      return (
        <div className='inline-flex gap-x-2 w-full '
        >
          วันที่
          <ArrowUpDown size={16} className="cursor-pointer" onClick={(e: React.MouseEvent<SVGSVGElement>) => {
            e.preventDefault();
            column.toggleSorting(column.getIsSorted() === "asc");
          }}/>
        </div>
      )
    },
    cell: ({ row }: { row: Row<Document> }) => {
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
    header: ({ column }: { column: Column<Document> }) => {
      return (
        <div className='inline-flex gap-x-2 w-full '
        >
          หมายเลขคดีดำ
          <ArrowUpDown size={16} className="cursor-pointer" onClick={(e: React.MouseEvent<SVGSVGElement>) => {
            e.preventDefault();
            column.toggleSorting(column.getIsSorted() === "asc");
          }}/>
        </div>
      )
    },
    cell: ({ row }: { row: Row<Document> }) => {
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
    header: ({ column }: { column: Column<string>}) => {
      return (
        <div className='inline-flex gap-x-2 w-full '
        >
          หมายเลขคดีแดง
          <ArrowUpDown size={16} className="cursor-pointer" onClick={(e: React.MouseEvent<SVGSVGElement>) => {
            e.preventDefault();
            column.toggleSorting(column.getIsSorted() === "asc");
          }}/>
        </div>
      )
    },
    cell: ({ row }: { row: Row<Document> }) => {
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
     header: ({ column }: { column: Column<string> }) => {
      return (
        <div className='flex gap-x-2 w-full items-center justify-end '
        >
          ดาวน์โหลด
          <ArrowUpDown size={16} className="cursor-pointer" onClick={(e: React.MouseEvent<SVGSVGElement>) => {
            e.preventDefault();
            column.toggleSorting(column.getIsSorted() === "asc");
          }}/>
        </div>
      )
    },
    cell: ({ row }: { row: Row<Document> }) => {
      const { downloads } = row.original;
      return (<div className="text-right">{downloads}</div>);

    }
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }: { row: Row<Document> }) => {
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
  const dispatch = useAppDispatch();
  const [tableData, setTableData] = React.useState<Document[]>(data);
  const sorting = useAppSelector((state: RootState) => state.contentListUi.sorting);
  const columnFilters = useAppSelector((state: RootState) => state.contentListUi.columnFilters);
  const columnVisibility = useAppSelector((state: RootState) => state.contentListUi.columnVisibility);
  const rowSelection = useAppSelector((state: RootState) => state.contentListUi.rowSelection);
  const pagination = useAppSelector((state: RootState) => state.contentListUi.pagination); 
  const playlistUi = useAppSelector((state: RootState) => state.playlistDialogUi.listOpen);
  const playlistNewUi = useAppSelector((state: RootState) => state.playlistDialogUi.newOpen);
  const dataChaged = useAppSelector((state: RootState)=>state.playlistDialogUi.dataChanged);
  const toggleDataState = useAppSelector((state: RootState) => state.contentListUi.toggleDataState);

  const table = useReactTable({
    data: tableData,
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

  React.useEffect(()=>{
    const getData = async() => {
      try {
        const data = await getContent();
        setTableData(data);
      } catch (error) {
        console.error(error);
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
        console.error(error);
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
    }
  }, [rowSelection]);

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="ค้นหาคำสั่งศาล..."
          value={(table.getColumn("คำสั่งศาล")?.getFilterValue() as string) ?? ""}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
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
                .filter((column: Column<string>) => column.getCanHide())
                .map((column: Column<string>) => {
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
            {table.getHeaderGroups().map((headerGroup: HeaderGroup<Document>) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header: Header<Document, unknown>) => {
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
              table.getRowModel().rows.map((row: Row<Document>) => {
                const { selected, active } = row.original;
                return (
                <TableRow
                  key={row.id}
                  data-state={active? row.getIsSelected() && "selected": ""}
                  className={`${active? selected? "bg-muted": "": "bg-gray-100 text-gray-400"}`}
                >
                  {row.getVisibleCells().map((cell: Cell<string>) => (
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
