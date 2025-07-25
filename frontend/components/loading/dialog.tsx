'use client';

import { useAppSelector } from "../store/hooks";
import { RingLoader } from "react-spinners";

export default function DialogLoading() {
    const uiOpen = useAppSelector((state: any) => state.loadingUi.openDialog);

    return uiOpen? 
        <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
            <RingLoader size={160} color='blue'/>
        </div>
    : <></>;
}