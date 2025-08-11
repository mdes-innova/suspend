'use client';

import { BarLoader } from "react-spinners";

export default function ConfirmLoading() {
    return (
        <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
            <BarLoader height={32} width={256} color='rgb(26, 188, 156)'/>
        </div>
    );
}