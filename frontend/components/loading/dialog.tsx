'use client';

import { useAppSelector } from "../store/hooks";
import { BeatLoader } from "react-spinners";
import { Card } from "../ui/card";

export default function DialogLoading() {
    const uiOpen = useAppSelector((state: any) => state.loadingUi.openDialog);

    return uiOpen? 
        <Card className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 p-20">
            <BeatLoader size={16} color='rgb(26, 188, 156)'/>
        </Card>
    : <></>;
}