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
  SlidersVertical, ChevronLeft, ChevronRight, MailCheck, Search } from "lucide-react"
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
import ActionDropdown, { ActionDropdownAll } from "../action-dropdown";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setDocIds } from "../store/features/content-list-ui-slice";

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
import { useState, useEffect, useRef } from 'react';

type DocTableIdType = {
  index: number,
  docId: number | undefined
}


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
          <div className="w-4 h-4 block">
          </div>
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
        <div className='inline-flex gap-x-2 w-full'>
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

type TableSortType = {
  name: string,
  decs: boolean,
  id: string
}

export default function DataTable() {
  const [sorts, setSorts] = useState<TableSortType[]>([
    {
      name: 'orderDate',
      id: 'วันที่',
      decs: true
    },
    {
      name: 'orderNo',
      id: 'คำสั่งศาล',
      decs: true
    },
    {
      name: 'orderblackNo',
      id: 'คดีหมายเลขดำ',
      decs: false
    },
    {
      name: 'orderredNo',
      id: 'คดีหมายเลขแดง',
      decs: false
    },
    {
      name: 'kindName',
      id: 'ประเภท',
      decs: false
    }
  ]);
  const paginations = [20, 50, 100];
  const dispatch = useAppDispatch();
  const [tableData, setTableData] = useState<Document[] | null>(null);
  const sorting = useAppSelector((state: RootState) => state.contentListUi.sorting);
  const columnFilters = useAppSelector((state: RootState) => state.contentListUi.columnFilters);
  const columnVisibility = useAppSelector((state: RootState) => state.contentListUi.columnVisibility);
  const rowSelection = useAppSelector((state: RootState) => state.contentListUi.rowSelection);
  const pagination = useAppSelector((state: RootState) => state.contentListUi.pagination); 
  const playlistUi = useAppSelector((state: RootState) => state.playlistDialogUi.listOpen);
  const playlistNewUi = useAppSelector((state: RootState) =>state.playlistDialogUi.newOpen);
  const dataChaged = useAppSelector((state: RootState) => state.playlistDialogUi.dataChanged);
  const toggleDataState = useAppSelector((state: RootState) => state.contentListUi.toggleDataState);
  const [pageIndex, setPageIndex] = useState(pagination.pageIndex);
  const [pageSize, setPageSize] = useState(pagination.pageSize);
  const [totalDocuments, setTotalDocuments] = useState(100);
  const searchRef = useRef<HTMLInputElement>();
  const [q, setQ] = useState("");

  const docIds = useAppSelector((state: RootState) => state.contentListUi.docIds);

  const table = useReactTable({
    data: tableData?? [],
    columns,
    pageCount: Math.ceil(totalDocuments/pageSize),
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
    enableMultiSort: true,
    manualPagination: true,
    enableSorting: false,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination
    },
  });

  useEffect(() => {
    if (sorting && typeof sorting?.length === 'number' && sorting.length > 0) {
      setPageIndex(0);
      const theSorting = sorting[0];
      const foundIndx = (sorts as TableSortType[]).findIndex((e) => e.id === theSorting?.id);
      
      if (foundIndx === 0) {
        const decs = !(sorts[0].decs);
        const firstSort = {...sorts[0], decs};
        setSorts((prev) => [firstSort, ...(prev.slice(1))]);
      } else {
        setSorts((prev) => [sorts[foundIndx], ...prev.filter((_, idx: number) => idx != foundIndx)]);
      }
    }
  }, [sorting]);


  useEffect(()=>{
    const getData = async() => {
      try {
        const data = await getContent({
          sorts,
          pagination: {
            pageIndex,
            pageSize
          },
          q: q.trim()
        });
        setTotalDocuments(data.total);
        setTableData(data.data);
      } catch (error) {
        console.error(error);
        setTableData([]);
        setTotalDocuments(0);
        if (isAuthError(error))
          RedirectToLogin(); 
      }
    };

    if (!playlistNewUi && !playlistUi && dataChaged) getData();
  }, [playlistUi, playlistNewUi]);

  useEffect(()=>{
    const getData = async() => {
      try {
        const data = await getContent({
          sorts,
          pagination: {
            pageIndex,
            pageSize
          },
          q: q.trim()
        });
        setTotalDocuments(data.total);
        setTableData(data.data);
      } catch (error) {
        console.error(error);
        setTableData([]);
        setTotalDocuments(0);
        if (isAuthError(error))
          RedirectToLogin(); 
      }
    };

    getData();

  }, [toggleDataState, sorts, pageSize, pageIndex, q]);

  useEffect(()=>{
    if (table && tableData) {
      const foundSelectedDocumentIds =
        table.getRowModel().rows.map((row: Row<Document>, idx: number) => {
          return {
            index: idx,
            docId: row?.original?.id
          }
        })
        .filter((e: DocTableIdType) => typeof e?.docId === 'number' && docIds.includes(e?.docId));
      
      const selectedObj: {[key: number]: boolean} = {};

      foundSelectedDocumentIds.forEach((e: DocTableIdType)=> {
        selectedObj[e?.index] = true;
      });

      dispatch(setRowSelection(selectedObj));
    }

  }, [tableData]);


  useEffect(() => {
    if (table && tableData)
    {
      const documentRowIds: number[] =
        table.getRowModel().rows.map((row: Row<Document>) => row?.original?.id)
        .filter((e: number | undefined | null) => typeof e === 'number');
      const selectedDocumentIds: number[] =
        table.getSelectedRowModel().rows.map((row: Row<Document>) => row?.original?.id)
        .filter((e: number | undefined | null) => typeof e === 'number');
      const deselectedDocumentIds = documentRowIds.filter((e) => !selectedDocumentIds.includes(e));
      const nextDocIds = Array.from(
        new Set([
          ...docIds.filter((e: number) => !deselectedDocumentIds.includes(e)),
          ...selectedDocumentIds,
        ])
      );
      dispatch(setDocIds(nextDocIds.length ? nextDocIds: []));
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
        <div className="flex justify-start rounded-2xl items-center
          border border-gray-500 overflow-clip
          ">
          <Search className='ml-1 cursor-pointer'
            onClick={(e: React.MouseEvent<SVGSVGElement>) => {
              e.preventDefault();
              if (searchRef?.current)
                setQ(searchRef?.current?.value?? "");
            }}
          />
          <Input
            className="
              border-transparent
              border-l
              border-l-gray-200
              ring-0 ring-offset-0
              outline-none
              focus-visible:border-transparent
              focus-visible:border-l 
              focus-visible:border-l-gray-200
              focus-visible:ring-0 focus-visible:ring-offset-0
              focus-visible:outline-none
              hover:border-transparent
              hover:border-l
              hover:border-l-gray-200
              hover:ring-0 hover:ring-offset-0
              hover:outline-none
              ml-1 rounded-none
              focus:ring-0 max-w-sm
              px-2 py-2
            "
            ref={searchRef}
            placeholder="ค้นหาคำสั่งศาล..."
            onKeyDown={async(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === "Enter") {
                e.preventDefault();
                setQ(e?.currentTarget?.value?? "");
                e.currentTarget.blur();
              }
            }}
          />
        </div>
        <div className="ml-auto flex items-center gap-x-2">
          {
            docIds && docIds?.length > 0 &&
            <ActionDropdownAll>
                <SlidersVertical />
            </ActionDropdownAll>
          }
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
          {docIds.length} of{" "}
          {totalDocuments} row(s) selected.
        </div>
        <div className="flex gap-x-2">
          <Button variant="outline" onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();
            if (pagination.pageSize <= 20) return;
            const currentPageIndex = paginations.indexOf(pagination.pageSize);
            if (currentPageIndex === -1 || currentPageIndex <= 0) return;
            setPageIndex(0);
            setPageSize(paginations[currentPageIndex - 1]);
            dispatch(setPagination({pageIndex: 0, pageSize: paginations[currentPageIndex - 1]}));
          }}
          disabled={pagination.pageSize <= 20 || paginations.indexOf(pagination.pageSize) <= 0}
          >
            <ChevronLeft/>
          </Button>
            <p className="flex flex-col justify-center items-center">{pagination.pageSize}</p>
          <Button variant="outline" onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();
            if (pagination.pageSize >= 100) return;
            const currentPageIndex = paginations.indexOf(pagination.pageSize);
            if (currentPageIndex === -1 || currentPageIndex >= paginations.length - 1) return;
            setPageIndex(0);
            setPageSize(paginations[currentPageIndex + 1]);
            dispatch(setPagination({pageIndex: 0, pageSize: paginations[currentPageIndex + 1]}));
          }}
          disabled={pagination.pageSize >= 100 || paginations.indexOf(pagination.pageSize) >= paginations.length - 1}
          >
            <ChevronRight />
          </Button>
        </div>
        <div className="flex gap-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPageIndex((prev) => prev - 1)}
            disabled={pageIndex < 1}
          >
            ก่อนหน้า
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPageIndex((prev) => prev + 1)}
            disabled={pageIndex >= Math.floor(totalDocuments/pageSize)}
          >
            ถัดไป
          </Button>
        </div>
      </div>
    </div>
  )
}