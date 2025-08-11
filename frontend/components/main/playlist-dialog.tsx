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

import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Plus } from "lucide-react";
import { addToGroup, getGroups } from "../actions/group";
import { getDocumentList } from "../actions/document";
import { Datetime2Thai } from "@/lib/utils";
import { RootState } from "../store";
import { type Group, type Document } from "@/lib/types";
 

function MyScrollArea({ data }: { data: Group[] }) {
  const dispatch = useAppDispatch();
  const docIds = useAppSelector((state: RootState) =>state.playlistDialogUi.docIds);

  return (
    <ScrollArea className="h-48 w-full rounded-md ">
      <div className="p-4">
        {data.map((elem: Group) => (
          <>
            <div key={`playlist-${elem.id}`} className="text-sm cursor-pointer w-full flex justify-between" 
            onClick={async(e: React.MouseEvent<HTMLDivElement>) => {
              e.preventDefault();
              if (docIds && docIds.length){
                try {
                  const addResJson = await addToGroup({
                    groupId: elem.id,
                    docIds,
                    mode: 'append'
                  });
                  
                  const newPlaylist = addResJson.name;
                  const documentList = await getDocumentList(docIds);
                  dispatch(closeModal({ui: PLAYLISTUI.list,
                    info: [newPlaylist, ...documentList.map((ee: Document) => ee.orderNo)] }));
                } catch (error) {
                  console.error(error);
                  dispatch(closeModal({ui: PLAYLISTUI.new,
                    info: [error as string], err: true }));
                }
              }
            }}>
              <div>
                {elem.name}
              </div>
              <div>
                {Datetime2Thai(elem.createdAt)}
              </div>
            </div>
            <Separator className="my-2" />
          </>
        ))}
      </div>
    </ScrollArea>
  )
}

export default function PlaylistDialog() {
    const dispatch = useAppDispatch();
    const uiOpen = useAppSelector((state: RootState) => state.playlistDialogUi.listOpen);
    const [data, setData] = useState<Group[]>([]);

    useEffect(() => {
      const getData = async() => {
        if (uiOpen) {
          try{
            const playlist = await getGroups(); 
            setData(playlist);
          } catch (error) {
            console.error(error);
           dispatch(closeModal({ui: PLAYLISTUI.list}));
           dispatch(closeModal({ui: PLAYLISTUI.new, info: ["error"], err: true}));
          }
        }
      }
      getData();
    }, [uiOpen]);

    return (
        <Dialog open={uiOpen}
            onOpenChange={(open: boolean) => {
                if (!open) dispatch(closeModal({ui: PLAYLISTUI.list}));
            }}
        >
            <DialogContent className="sm:max-w-[425px] min-w-[800px]">
                <DialogHeader>
                <DialogTitle>Select a playlist</DialogTitle>
                </DialogHeader>
                <MyScrollArea data={data}/>
                <DialogFooter>
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