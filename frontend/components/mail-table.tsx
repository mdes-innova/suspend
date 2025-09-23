'use client';

import { Mail, MailGroup } from "@/lib/types";
import {
  ColumnDef,
  PaginationState,
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
  RowSelectionState,
  HeaderGroup,
  Header,
  Updater
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, ChevronRight, ChevronLeft, Search } from "lucide-react"
import { Input } from "./ui/input";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Datetime2Thai } from "@/lib/client/utils";
import { LoadingMailTable } from "./loading/content";
import { RedirectToLogin } from "./reload-page";
import { isAuthError } from "./exceptions/auth";
import { getContent } from "./actions/mail";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { RootState } from "./store";
import { setColumnFilters, setColumnVisibility, setPagination, setRowSelection, setSorting } from "./store/features/mailbox-list-ui-slice";

const columns: ColumnDef<MailGroup>[] = [
 {
    id: 'วันที่',
    accessorKey: "createdAt",
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
    id: 'มาตรา',
    accessorKey: "section",
    header: ({ column }: { column: Column<MailGroup>}) => {
      return (
        <div className='inline-flex gap-x-2 w-full '
        >
          มาตรา 
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
      const sectionName = original?.section?.name?? '-';
      return (
        <div>
          {sectionName}
          </div>
      );
    },
  }, {
    id: 'ผู้ส่ง',
    accessorKey: "user",
    header: ({ column }: { column: Column<MailGroup>}) => {
      return (
        <div className='inline-flex gap-x-2 w-full '
        >
          ผู้ส่ง
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
      const user = original?.user;
      if (!user?.thaiid)
        return (
          <div>
            {user?.username}
            </div>
        );
      else
        return (
          <div>
            {user?.givenName} {user?.familyName}
            </div>
        );
    },
  }, {
    id: 'ส่ง',
    accessorKey: "mails",
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
        const numSends = (mails.filter((e: Mail) => e?.status === 'successful')).length;
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

function resolveUpdater<T>(updater: Updater<T>, previous: T): T {
  return typeof updater === "function"
    ? (updater as (prev: T) => T)(previous)
    : updater;
}

type TableSortType = {
  name: string,
  decs: boolean,
  id: string
}

export default function MailTable() {
    const [sorts, setSorts] = useState<TableSortType[]>([
    {
      name: 'createdAt',
      id: 'วันที่',
      decs: true
    },
    {
      name: 'documentNo',
      id: 'เลขหนังสือ',
      decs: false 
    },
    {
      name: 'section',
      id: 'มาตรา',
      decs: false
    },
    {
      name: 'user',
      id: 'ผู้ส่ง',
      decs: false
    },
    {
      name: 'sends',
      id: 'ส่ง',
      decs: false
    },
    {
      name: 'confirms',
      id: 'ยืนยัน',
      decs: false
    },
  ]);
  const [tableData, setTableData] = useState<MailGroup[] | null>(null);
    const sorting = useAppSelector((state: RootState) => state.mailboxListUi.sorting);
    const columnFilters = useAppSelector((state: RootState) => state.mailboxListUi.columnFilters);
    const columnVisibility = useAppSelector((state: RootState) => state.mailboxListUi.columnVisibility);
    const rowSelection = useAppSelector((state: RootState) => state.mailboxListUi.rowSelection);
    const pagination = useAppSelector((state: RootState) => state.mailboxListUi.pagination); 
    const [pageIndex, setPageIndex] = useState(pagination.pageIndex);
    const [pageSize, setPageSize] = useState(pagination.pageSize);
    const dispatch = useAppDispatch();
    const [totalDocuments, setTotalDocuments] = useState(100);
    const searchRef = useRef<HTMLInputElement>(null);
    const paginations = [20, 50, 100];
    const [q, setQ] = useState("");
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
    })

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

    getData();

  }, [sorts, pageSize, pageIndex, q]);


  if (!tableData)
    return (
      <LoadingMailTable />
  );

    return (
    <div className="w-full">
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
      <div className="flex items-center justify-between py-4">
        <div className='block h-1 w-1'></div>
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
    );
}