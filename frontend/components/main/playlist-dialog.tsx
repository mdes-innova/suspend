'use client';

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/playlist-dialog";
import { Button } from "@/components/ui/button"
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { openModal, closeModal, PLAYLISTUI } from "../store/features/playlist-diaolog-ui-slice";
import { useEffect, useState } from "react";

import { Plus } from "lucide-react";
import { addToGroup, getGroupList } from "../actions/group";
import { getDocumentList } from "../actions/document";
import { Date2Thai } from "@/lib/client/utils";
import { RootState } from "../store";
import { type Group, type Document } from "@/lib/types";
import { isAuthError } from '@/components/exceptions/auth';
import { RedirectToLogin } from "../reload-page";
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
import { ArrowUpDown } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Input } from "../ui/input";
import { Skeleton } from "../ui/skeleton";
import { DialogClose } from "../ui/dialog";


const columns: ColumnDef<Group>[] = [
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
    id: 'วันที่สร้าง',
    accessorKey: "createdAt",
    sortingFn: (rowA: Row<Group>, rowB: Row<Group>, columnId: string) => {
      const dateA = new Date(rowA.getValue(columnId));
      const dateB = new Date(rowB.getValue(columnId));
      return dateA.getTime() - dateB.getTime(); // ascending
    },
    header: ({ column }: { column: Column<Group> }) => {
      return (
        <div className='inline-flex gap-x-2 w-full '
        >
          วันที่สร้าง
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
          {row.getValue('วันที่สร้าง')?
            Date2Thai(row.getValue('วันที่สร้าง')):
            '-'
          }
          </div>
      );
    },
  },
]

type LoadingTableType = {
    id1: number,
    id2: number
}

const loadingColumns: ColumnDef<LoadingTableType>[] = [
  {
    id: 'ชื่อฉบับร่าง',
    accessorKey: "name",
    header: () => {
      return (
        <div className='inline-flex gap-x-2 w-full'>
          ฉบับบร่าง
        </div>
      )
    },
    cell: () => {
      return (
        <div>
          <Skeleton className="w-40 h-6"></Skeleton>
          </div>
      );
    },
  },
  {
    id: 'วันที่สร้าง',
    accessorKey: "createdAt",
    header: () => {
      return (
        <div className='inline-flex gap-x-2 w-full'>
          วันที่สร้าง
        </div>
      )
    },
    cell: () => {
      return (
        <div>
          <Skeleton className="w-40 h-6"></Skeleton>
          </div>
      );
    },
  },
]

function GroupTable() {
    const [sorting, setSorting] = useState<SortingState>([])
    const docIds = useAppSelector((state: RootState) =>state.playlistDialogUi.docIds);
    const [tableData, setTableData] = useState<Group[]>([]);
    const dispatch = useAppDispatch();
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
        []
    );
    const dataChanged = useAppSelector((state: RootState) => state.groupListUi.dataChanged);
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

  const loadingTable = useReactTable({
      data: Array.from({length: 10}).map((_, idx: number) => {
        return (
          {
            id1: idx,
            id2: idx
          }
        );
      }),
      columns: loadingColumns,
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
        setTableData([]);
        if (isAuthError(error))
          RedirectToLogin();
      }
    }

    getData();
  }, [dataChanged]);

  if (!tableData || (tableData as Group[]).length < 1)
    return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          disabled
          className="w-40"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {loadingTable.getHeaderGroups().map((headerGroup: HeaderGroup<LoadingTableType>) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header: Header<LoadingTableType, unknown>) => {
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
            {loadingTable.getRowModel().rows?.length ? (
              loadingTable.getRowModel().rows.map((row: Row<LoadingTableType>) => {
                return (
                <TableRow
                  key={row.id}
                  className="cursor-pointer"
                >
                  {row.getVisibleCells().map((cell: Cell<LoadingTableType, unknown>) => (
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
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            disabled
          >
            ก่อนหน้า
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled
          >
            ถัดไป
          </Button>
        </div>
      </div>
    </div>
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
                  onClick={async(e: React.MouseEvent<HTMLDivElement>) => {
                  e.preventDefault();
                  if (docIds && docIds.length){
                    const original = row?.original;
                    const groupId = original?.id;
                    if (typeof groupId != 'number') return;

                    try {
                      const addResJson = await addToGroup({
                        groupId,
                        docIds,
                        mode: 'append'
                      });
                      
                      const newPlaylist = addResJson.name;
                      const documentList = await getDocumentList(docIds);
                      dispatch(closeModal({ui: PLAYLISTUI.list,
                        info: [newPlaylist, ...documentList.map((ee: Document) => ee.orderNo)] }));
                    } catch (error) {
                      dispatch(closeModal({ui: PLAYLISTUI.new,
                        info: [error as string], err: true }));
                      if (isAuthError(error))
                        RedirectToLogin();
                    }
                  }
                }}
                >
                  {row.getVisibleCells().map((cell: Cell<Group, unknown>) => (
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
 

export default function PlaylistDialog() {
    const dispatch = useAppDispatch();
    const uiOpen = useAppSelector((state: RootState) => state.playlistDialogUi.listOpen);

    return (
        <Dialog open={uiOpen}
            onOpenChange={(open: boolean) => {
                if (!open) dispatch(closeModal({ui: PLAYLISTUI.list}));
            }}
        >
            <DialogContent className="max-w-[1000px] min-w-[1000px]
                        max-lg:min-w-[700px] max-lg:max-w-[700px]
                        max-md:min-w-[400px] max-md:max-w-[400px]
                        overflow-auto max-h-[90dvh]">
                <DialogHeader>
                <DialogTitle>เลือกฉบับร่าง</DialogTitle>
                </DialogHeader>
                <GroupTable />
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">ยกเลิก</Button>
                  </DialogClose>
                  <Button type="submit" onClick={async(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.preventDefault();
                    dispatch(closeModal({ ui: PLAYLISTUI.list }));
                    dispatch(openModal({ ui: PLAYLISTUI.new }));
                  }}><Plus size={10} />Create new</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}