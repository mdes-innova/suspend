'use client';

import {type Group } from "@/lib/types";
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
  Row,
  Column,
  Cell,
  Header,
  HeaderGroup,
  Updater,
  PaginationState
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, MoreHorizontal, Trash2,
  FolderPen, Plus, ChevronLeft, ChevronRight, Search } from "lucide-react"
import { Input } from "./ui/input";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import {useState} from 'react';
import Link from 'next/link';
import { NewPlaylistSheet } from "./main/new-playlist-sheet";
import { openModal, PLAYLISTUI } from './store/features/playlist-diaolog-ui-slice';
import { useAppDispatch, useAppSelector } from './store/hooks';
import {useEffect, useRef} from 'react';
import { getContent, RemoveGroup, RenameGroup } from "./actions/group";
import { Datetime2Thai } from "@/lib/client/utils";
import { setPagination, setRename, toggleDataChanged } from "./store/features/group-list-ui-slice";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetTitle,
} from "@/components/ui/sheet"
import { Label } from "./ui/label";
import { RootState } from "./store";
import { isAuthError } from '@/components/exceptions/auth';
import { RedirectToLogin } from "./reload-page";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "./ui/playlist-dialog";
import { LoadingGroupTable } from "./loading/content";

function resolveUpdater<T>(updater: Updater<T>, previous: T): T {
  return typeof updater === "function"
    ? (updater as (prev: T) => T)(previous)
    : updater;
}

const columns: ColumnDef<Group>[] = [
  {
    id: 'วันที่',
    accessorKey: "modifiedAt",
    header: ({ column }: { column: Column<Group> }) => {
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
    cell: ({ row }: { row: Row<Group> }) => {
      return (
        <div>
          {row.getValue('วันที่')?
            Datetime2Thai(row.getValue('วันที่')):
            '-'
          }
          </div>
      );
    },
  },
  {
    id: 'ชื่อฉบับร่าง',
    accessorKey: "name",
    header: ({ column }: { column: Column<Group> }) => {
      return (
        <div className='inline-flex gap-x-2 w-full '
        >
          ฉบับบร่าง
          <ArrowUpDown size={16} className="cursor-pointer"
          onClick={(e: React.MouseEvent<SVGSVGElement>) => {
            e.preventDefault();
            column.toggleSorting(column.getIsSorted() === "asc");
          }}/>
        </div>
      )
    },
    cell: ({ row }: { row: Row<Group> }) => {
      return (
        <div>
          {row.getValue('ชื่อฉบับร่าง')?? '-'}
          </div>
      );
    },
  },
  {
    id: 'จำนวนคำสั่งศาล',
    accessorKey: "documents",
    header: ({ column }: { column: Column<Group>}) => {
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
    cell: ({ row }: { row: Row<Group> }) => {
      const docs = row.getValue('จำนวนคำสั่งศาล') as unknown[] | undefined;
      return <div>{docs?.length ?? '-'}</div>;
    },
  },
  {
    id: 'ผู้ใช้งาน',
    accessorKey: "user",
    header: ({ column }: { column: Column<Group> }) => {
      return (
        <div className='inline-flex gap-x-2 w-full '
        >
          ผู้ใช้งาน 
          <ArrowUpDown size={16} className="cursor-pointer"
          onClick={(e: React.MouseEvent<SVGSVGElement>) => {
            e.preventDefault();
            column.toggleSorting(column.getIsSorted() === "asc");
          }}/>
        </div>
      )
    },
    cell: ({ row }: { row: Row<Group> }) => {
      const original = row.original;
      const username = original?.user?.thaiid?
        `${original?.user?.givenName} ${original?.user?.familyName}`: original?.user?.username?? '';
      return (
        <div>
          {username}
          </div>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }: { row: Row<Group> }) => {
      const {id, name} = row.original;
      return (
        <GroupActions id={id} name={name}/>
      );
    },
  },
]

type TableSortType = {
  name: string,
  decs: boolean,
  id: string
}

function GroupActions({
  id, name
}: {
  id: number,
  name: string
}) {

  const dispatch = useAppDispatch();
  const [uiOpen, setUiOpen] = useState(false);
  const [deleteDailogOpen, setDeleteDailogOpen] = useState(false);
  const rename = useAppSelector((state: RootState) => state.groupListUi.rename);
  const nameRef = useRef<HTMLInputElement>(null);
  const [deleteErrorMsg, setDeleteErrorMsg] = useState('');

    return (
    <div className="w-full text-right flex justify-end">
      <Dialog open={deleteDailogOpen} onOpenChange={(open) => {
        if (!open) setUiOpen(false);
        setDeleteErrorMsg('');
        setDeleteDailogOpen(open);
      }}>
        <DialogContent>
          <DialogTitle>
            ลบฉบับร่าง
          </DialogTitle>
          <DialogDescription>
            ท่านต้องการลบฉบับร่าง &quot;{name}&quot; หรือไม่?
          </DialogDescription>
          <div className="text-destructive block h-8">{deleteErrorMsg}</div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">ยกเลิก</Button>
            </DialogClose>
            <Button variant="destructive"
              onClick={async(e: React.MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation();
              try {
                await RemoveGroup(id);
                dispatch(toggleDataChanged())
                setUiOpen(false);
                setDeleteDailogOpen(false);
              } catch (error) {
                if (isAuthError(error)) 
                  RedirectToLogin(); 
                else
                  setDeleteErrorMsg(`ไม่สามารถลบฉบับร่าง "${name}" ได้`);
              }
            }}
            >ยืนยัน</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <DropdownMenu open={uiOpen} onOpenChange={setUiOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation();
              setDeleteErrorMsg('');
              setDeleteDailogOpen(false);
              setUiOpen(true);
            }}
          >
            <MoreHorizontal size={24} />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent>
          <DropdownMenuItem
            onClick={(e: React.MouseEvent<HTMLDivElement>) => {
              e.stopPropagation();
              e.preventDefault();
              dispatch(setRename(id));
              dispatch(toggleDataChanged());
              setUiOpen(false);
            }}
          >
            <FolderPen /><span>เปลี่ยนชื่อ</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
          onClick={async (e: React.MouseEvent<HTMLDivElement>) => {
              e.preventDefault();
              setDeleteErrorMsg('');
              setDeleteDailogOpen(true);
              setUiOpen(false);
            }}
          >
            <Trash2 /><span>ลบฉบับร่าง</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
        <Sheet open={rename != -1} onOpenChange={(open: boolean) => {
            if (!open) dispatch(setRename(-1));
        }}>
            <SheetContent>
                <SheetTitle>เปลี่ยนชื่อฉบับร่าง</SheetTitle>
                <div className="grid flex-1 auto-rows-min gap-6 px-4">
                    <div className="grid gap-3">
                        <Label htmlFor="sheet-demo-name">ชื่อ</Label>
                        <Input id="sheet-demo-name" defaultValue={name} ref={nameRef}/>
                    </div>
                </div>
                <SheetFooter>
                    <SheetClose asChild onClick={async(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.preventDefault();
                        if (nameRef?.current)
                          try {
                            await RenameGroup({name: nameRef?.current?.value, groupId: rename});
                          } catch (error) {
                            if (isAuthError(error))  
                              RedirectToLogin();
                          }
                        dispatch(toggleDataChanged());
                        dispatch(setRename(-1));
                    }}>
                        <Button>บันทึก</Button>
                    </SheetClose>
                    <SheetClose asChild>
                        <Button variant='destructive'>ยกเลิก</Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    </div>
  );
}

export default function GroupTable() {
  const [sorts, setSorts] = useState<TableSortType[]>([
    {
      name: 'modifiedAt',
      id: 'วันที่',
      decs: true
    },
    {
      name: 'name',
      id: 'ชื่อฉบับร่าง',
      decs: false 
    },
    {
      name: 'numDocuments',
      id: 'จำนวนคำสั่งศาล',
      decs: false
    },
    {
      name: 'user',
      id: 'ผู้ใช้งาน',
      decs: false
    },
  ]);
    const [sorting, setSorting] = useState<SortingState>([])
    const [tableData, setTableData] = useState<Group[] | null>(null);
    const dispatch = useAppDispatch();
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
        []
    );
    const pagination = useAppSelector((state: RootState) => state.groupListUi.pagination); 
    const [pageIndex, setPageIndex] = useState(pagination.pageIndex);
    const [pageSize, setPageSize] = useState(pagination.pageSize);
    const [columnVisibility, setColumnVisibility] =
        useState<VisibilityState>({})
    const user = useAppSelector((state: RootState) => state.userAuth.user);
    const [totalDocuments, setTotalDocuments] = useState(100);
    const searchRef = useRef<HTMLInputElement>(null);
    const paginations = [20, 50, 100];
    const [q, setQ] = useState("");
    const table = useReactTable({
      data: tableData?? [],
      columns: user?.isSuperuser?
        columns:
        columns?.filter((_, idx: number) => idx != columns.length - 2),
      onSortingChange: setSorting,
      onColumnFiltersChange: setColumnFilters,
      getCoreRowModel: getCoreRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      onColumnVisibilityChange: setColumnVisibility,
      onPaginationChange: (updater: Updater<PaginationState>) =>
        dispatch(setPagination(resolveUpdater(updater, pagination))),
      enableMultiSort: true,
      manualPagination: true,
      enableSorting: false,
      state: {
        sorting,
        columnFilters,
        columnVisibility,
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
      <LoadingGroupTable />
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
        <Link href="document-groups/-1">
          <Button variant="secondary" className="ml-1">สร้างแบบเร่งด่วน</Button>
        </Link>
        <div className="ml-auto flex items-center gap-x-1">
          <Button variant="outline" onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();
            dispatch(openModal({ ui: PLAYLISTUI.new }));
          }}><Plus /></Button>
          <NewPlaylistSheet main={true}/>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                คอลัมน์ <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column: Column<Group>) => column.getCanHide())
                .map((column: Column<Group>) => {
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
            {table.getHeaderGroups().map((headerGroup: HeaderGroup<Group>) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header: Header<Group, unknown>) => {
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
              table.getRowModel().rows.map((row: Row<Group>) => {
                return (
                <TableRow
                  key={row.id}
                  className="cursor-pointer"
                >
                  {row.getVisibleCells().map((cell: Cell<Group, unknown>, idx: number) => (
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