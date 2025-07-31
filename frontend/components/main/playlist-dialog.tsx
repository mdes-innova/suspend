'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/playlist-dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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

type Playlist = {
  id: number,
  username: string,
  name: string,
  modifiedAt: Date,
}
 
const tags = Array.from({ length: 50 }).map(
  (_, i, a) => `v1.2.0-beta.${a.length - i}`
)
 
function MyScrollArea({ data }: { data: Playlist[] }) {
  const dispatch = useAppDispatch();
  const docIds = useAppSelector(state=>state.playlistDialogUi.docIds);

  return (
    <ScrollArea className="h-48 w-full rounded-md ">
      <div className="p-4">
        {data.map((elem) => (
          <>
            <div key={`playlist-${elem.id}`} className="text-sm cursor-pointer w-full flex justify-between" 
            onClick={async(e: any) => {
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
                  console.log(documentList)
                  dispatch(closeModal({ui: PLAYLISTUI.list,
                    info: [newPlaylist, ...documentList.map(ee => ee.orderNo)] }));
                } catch (error) {
                  dispatch(closeModal({ui: PLAYLISTUI.new,
                    info: [error1 as string], err: true }));
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
    const uiOpen = useAppSelector(state => state.playlistDialogUi.listOpen);
    const [data, setData] = useState<Playlist[]>([]);

    useEffect(() => {
      const getData = async() => {
        if (uiOpen) {
          try{
            const playlist = await getGroups(); 
            setData(playlist);
          } catch (error) {
           dispatch(closeModal({ui: PLAYLISTUI.list}));
           dispatch(closeModal({ui: PLAYLISTUI.new, info: ["error"], err: true}));
          }
        }
      }
      getData();
    }, [uiOpen]);

    return (
        <Dialog open={uiOpen}
            onOpenChange={(open) => {
                if (!open) dispatch(closeModal({ui: PLAYLISTUI.list}));
            }}
        >
            <DialogContent className="sm:max-w-[425px] min-w-[800px]">
                <DialogHeader>
                <DialogTitle>Select a playlist</DialogTitle>
                </DialogHeader>
                <MyScrollArea data={data}/>
                <DialogFooter>
                  <Button type="submit" onClick={async(e: any) => {
                    e.preventDefault();
                    dispatch(closeModal({ ui: PLAYLISTUI.list }));
                    dispatch(openModal({ ui: PLAYLISTUI.new }));
                  }}><Plus size={10} />Create new</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}