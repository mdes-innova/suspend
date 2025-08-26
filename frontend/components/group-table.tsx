'use client';

import { User, type Group } from "@/lib/types";
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
  HeaderGroup
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, MoreHorizontal, Trash2, FolderPen, Plus } from "lucide-react"
import { Input } from "./ui/input";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import {useState} from 'react';
import Link from 'next/link';
import { NewPlaylistSheet } from "./main/new-playlist-sheet";
import { openModal, PLAYLISTUI } from './store/features/playlist-diaolog-ui-slice';
import { useAppDispatch, useAppSelector } from './store/hooks';
import {useEffect, useRef} from 'react';
import { getGroupList, RemoveGroup, RenameGroup } from "./actions/group";
import { Datetime2Thai } from "@/lib/client/utils";
import { setRename, toggleDataChanged } from "./store/features/group-list-ui-slice";
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
import LoadingTable from "./loading/content";

const columns: ColumnDef<Group>[] = [
  {
    id: 'วันที่',
    accessorKey: "modifiedAt",
    sortingFn: (rowA: Row<Group>, rowB: Row<Group>, columnId: string) => {
      const dateA = new Date(rowA.getValue(columnId));
      const dateB = new Date(rowB.getValue(columnId));
      return dateA.getTime() - dateB.getTime(); // ascending
    },
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
    sortingFn: (rowA: Row<Group>, rowB: Row<Group>, columnId: string) => {
      const lenA = (rowA.getValue(columnId) as unknown[]).length;
      const lenB = (rowB.getValue(columnId) as unknown[]).length;
      return lenA - lenB; // ascending
    },
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
    sortingFn: (rowA: Row<Group>, rowB: Row<Group>, columnId: string) => {
      const usernameA = rowA.getValue<User | null>(columnId)?.username ?? '-';
      const usernameB = rowB.getValue<User | null>(columnId)?.username ?? '-';
      return usernameA < usernameB ? -1 : usernameA > usernameB ? 1 : 0;
    },
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
      const username = original?.user?.username?? '-';
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
    const [sorting, setSorting] = useState<SortingState>([])
    const [tableData, setTableData] = useState<Group[] | null>(null);
    const dispatch = useAppDispatch();
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
        []
    );
    const dataChanged = useAppSelector((state: RootState) => state.groupListUi.dataChanged);
    const [columnVisibility, setColumnVisibility] =
        useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = useState({}) 
    const user = useAppSelector((state: RootState) => state.userAuth.user);
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
        const data = await getGroupList(); 
        setTableData(data);
      } catch (error) {
        setTableData(null);
        if (isAuthError(error))
          RedirectToLogin();
      }
    }

    getData();
  }, [dataChanged]);

  if (!tableData)
    return (
      <LoadingTable />
  );

    return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="ค้นหา ฉบับร่าง..."
          value={(table.getColumn("ชื่อฉบับร่าง")?.getFilterValue() as string) ?? ""}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            table.getColumn("ชื่อฉบับร่าง")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
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
    );
}