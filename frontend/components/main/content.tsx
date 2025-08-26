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
import { ArrowUpDown, ChevronDown, MoreHorizontal,
  SlidersVertical, ChevronLeft, ChevronRight, MailCheck } from "lucide-react"
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

import {
  type Updater,
} from '@tanstack/react-table';
import { getContent } from "../actions/document";
import { Document } from "@/lib/types";
import { RootState } from "../store";
import { isAuthError } from '@/components/exceptions/auth';
import { RedirectToLogin } from "../reload-page";
import { NewPlaylistSheet } from "./new-playlist-sheet";
import PlaylistDialog from "./playlist-dialog";
import { Date2Thai } from "@/lib/client/utils";
import LoadingTable from "../loading/content";


function resolveUpdater<T>(updater: Updater<T>, previous: T): T {
  return typeof updater === "function"
    ? (updater as (prev: T) => T)(previous)
    : updater;
}

export const columns: ColumnDef<Document>[] = [
  {
    id: "select",
    header: ({ table }: { table: TB<Document> }) => (
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
      const original = row.original;
      const active = original?.active?? false;
        if (active)
          return (
            <Checkbox 
              checked={row.getIsSelected()}
              onCheckedChange={(value: boolean) => row.toggleSelected(!!value)}
              aria-label="Select row"
            />
          );
        else {
          return null;
        }
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: 'คำสั่งศาล',
    accessorKey: "orderNo",
    header: ({ column }: { column: Column<Document>}) => {
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
      const { id, hasAllIsps } = row.original;
      return (<Link
        href={`/document-view/${id}`}
        className="text-left underline cursor-pointer hover:text-blue-400 flex justify-start items-center">
              <div className="w-4 h-4 block">
                {hasAllIsps? <MailCheck size={16} color='green' />: <></>}
              </div>
              <div className="ml-1">{row.getValue('คำสั่งศาล')?? '-'}</div>
          </Link>);
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
      return (
        <div>
          { row.getValue('วันที่')? Date2Thai(row.getValue('วันที่') as string): '-' }
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
          คดีหมายเลขดำ
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
        <div className='inline-flex gap-x-2 w-full '
        >
          คดีหมายเลขแดง
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
  }, {
    id: "actions",
    enableHiding: false,
    cell: ({ row }: { row: Row<Document> }) => {
      const { id, active } = row.original;
      return (
        <ActionDropdown docId={ id } active={active}>
          <MoreHorizontal />
        </ActionDropdown>
      )
    },
  },
]

export default function DataTable() {
  const paginations = [20, 50, 100];
  const dispatch = useAppDispatch();
  const [tableData, setTableData] = React.useState<Document[] | null>(null);
  const sorting = useAppSelector((state: RootState) => state.contentListUi.sorting);
  const columnFilters = useAppSelector((state: RootState) => state.contentListUi.columnFilters);
  const columnVisibility = useAppSelector((state: RootState) => state.contentListUi.columnVisibility);
  const rowSelection = useAppSelector((state: RootState) => state.contentListUi.rowSelection);
  const pagination = useAppSelector((state: RootState) => state.contentListUi.pagination); 
  const playlistUi = useAppSelector((state: RootState) => state.playlistDialogUi.listOpen);
  const playlistNewUi = useAppSelector((state: RootState) =>state.playlistDialogUi.newOpen);
  const dataChaged = useAppSelector((state: RootState) => state.playlistDialogUi.dataChanged);
  const toggleDataState = useAppSelector((state: RootState) => state.contentListUi.toggleDataState);

  const table = useReactTable({
    data: tableData?? [],
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
        setTableData(null);
        if (isAuthError(error))
          RedirectToLogin();
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
        if (isAuthError(error))
          RedirectToLogin(); 
      }
    };

    getData();

  }, [toggleDataState]);

    React.useEffect(()=>{
     if (table && tableData) {
      table.resetRowSelection(true);
     }
    }, [tableData]);


  React.useEffect(() => {
    if (table && tableData)
    {
      const selectedIds = table.getSelectedRowModel().rows.map((row: Row<Document>) => row.original.id);
      dispatch(setDocIds(selectedIds));
      // table.toggleAllPageRowsSelected(false);
    }
  }, [rowSelection]);

  if (!tableData)
    return (
      <LoadingTable />
  );

  return (
    <div className="w-full">
      <NewPlaylistSheet />
      <PlaylistDialog />
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
                const original = row.original;
                const active = original?.active?? false;
                return (
                <TableRow
                  key={row.id}
                  data-state={active? row.getIsSelected() && "selected": ""}
                  className={`${active? "": 'bg-muted text-gray-400'}`}
                >
                  {row.getVisibleCells().map((cell: Cell<Document, unknown>) => (
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
      <div className="flex items-center justify-between py-4">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel()
            .rows.filter((row: Row<Document>) => {
              const active = row?.original?.active?? false;
              return active;
            }).length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex gap-x-2">
          <Button variant="outline" onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();
            if (pagination.pageSize <= 20) return;
            const currentPageIndex = paginations.indexOf(pagination.pageSize);
            if (currentPageIndex === -1 || currentPageIndex <= 0) return;
            dispatch(setPagination({...pagination, pageSize: paginations[currentPageIndex - 1]}));
          }}>
            <ChevronLeft/>
          </Button>
            <p className="flex flex-col justify-center items-center">{pagination.pageSize}</p>
          <Button variant="outline" onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();
            if (pagination.pageSize >= 100) return;
            const currentPageIndex = paginations.indexOf(pagination.pageSize);
            if (currentPageIndex === -1 || currentPageIndex >= paginations.length - 1) return;
            dispatch(setPagination({...pagination, pageSize: paginations[currentPageIndex + 1]}));
          }}>
            <ChevronRight />
          </Button>
        </div>
        <div className="flex gap-x-2">
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
  )
}