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
import { useEffect, useState, useRef } from "react";
import { Plus, ChevronRight, ChevronLeft, ArrowUpDown, Search } from "lucide-react";
import { addToGroup, getContent } from "../actions/group";
import { getDocumentList } from "../actions/document";
import { Date2Thai } from "@/lib/client/utils";
import { RootState } from "../store";
import { type Group, type Document } from "@/lib/types";
import { isAuthError } from '@/components/exceptions/auth';
import { RedirectToLogin } from "../reload-page";
import {
  PaginationState,
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
  Updater
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Input } from "../ui/input";
import { DialogClose } from "../ui/dialog";
import { setGroupPagination } from "../store/features/content-list-ui-slice";
import { PlaylistDialogLoading } from "../loading/content";

function resolveUpdater<T>(updater: Updater<T>, previous: T): T {
  return typeof updater === "function"
    ? (updater as (prev: T) => T)(previous)
    : updater;
}

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
    id: 'วันที่',
    accessorKey: "modifiedAt",
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
          {row.getValue('วันที่')?
            Date2Thai(row.getValue('วันที่')):
            '-'
          }
          </div>
      );
    },
  },
]

type TableSortType = {
  name: string,
  decs: boolean,
  id: string
}

function GroupTable() {
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
  ]);
    const [sorting, setSorting] = useState<SortingState>([])
    const docIds = useAppSelector((state: RootState) =>state.playlistDialogUi.docIds);
    const [tableData, setTableData] = useState<Group[] | null>(null);
    const dispatch = useAppDispatch();
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
        []
    );
    const pagination = useAppSelector((state: RootState) => state.contentListUi.groupPagination); 
    const [pageIndex, setPageIndex] = useState(pagination.pageIndex);
    const [pageSize, setPageSize] = useState(pagination.pageSize);
    const [columnVisibility, setColumnVisibility] =
        useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = useState({}) 
    const [totalDocuments, setTotalDocuments] = useState(100);
    const searchRef = useRef<HTMLInputElement>(null);
    const paginations = [20, 50, 100];
    const [q, setQ] = useState("");
    const table = useReactTable({
        data: tableData?? [],
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        onPaginationChange: (updater: Updater<PaginationState>) =>
          dispatch(setGroupPagination(resolveUpdater(updater, pagination))),
        enableMultiSort: true,
        manualPagination: true,
        enableSorting: false,
        state: {
          sorting,
          columnFilters,
          columnVisibility,
          rowSelection,
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
    return <PlaylistDialogLoading />;

    return (
    <div className="block w-full max-lg:min-w-[600px] max-md:w-[400px] max-md:max-w[400px] max-md:min-w-[400px]">
      <div className="flex items-center py-4 w-full max-md:w-[400px] max-md:max-w[400px] max-md:min-w-[400px]">
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
            placeholder="ค้นหาฉบับร่าง..."
            onKeyDown={async(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === "Enter") {
                e.preventDefault();
                setQ(e?.currentTarget?.value?? "");
                e.currentTarget.blur();
              }
            }}
          />
        </div> 
      </div>
      <div className="rounded-md border w-full max-md:w-[400px]">
        <Table>
          <TableHeader className="block w-full ">
            {table.getHeaderGroups().map((headerGroup: HeaderGroup<Group>) => (
              <TableRow key={headerGroup.id} className="flex items-center justify-between w-full">
                {headerGroup.headers.map((header: Header<Group, unknown>) => {
                  return (
                    <TableHead key={header.id} className="flex flex-col justify-center">
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
          <TableBody className="block max-h-[50vh] overflow-auto w-full">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row: Row<Group>) => {
                return (
                <TableRow
                  key={row.id}
                  className='flex items-center justify-between w-full cursor-pointer'
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
      <div className="flex items-center justify-between py-4 max-md:w-[400px]">
        <div className="text-sm text-muted-foreground block h-1 w-1">
        </div>
        <div className="flex gap-x-2">
          <Button variant="outline" onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();
            if (pagination.pageSize <= 20) return;
            const currentPageIndex = paginations.indexOf(pagination.pageSize);
            if (currentPageIndex === -1 || currentPageIndex <= 0) return;
            setPageIndex(0);
            setPageSize(paginations[currentPageIndex - 1]);
            dispatch(setGroupPagination({pageIndex: 0, pageSize: paginations[currentPageIndex - 1]}));
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
            dispatch(setGroupPagination({pageIndex: 0, pageSize: paginations[currentPageIndex + 1]}));
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
                        max-md:min-w-fit max-md:max-w-fit max-md:w-fit
                        overflow-auto">
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
                  }}><Plus size={10} />สร้างฉบับบร่างใหม่</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
