'use client';

import { ClipLoader} from "react-spinners";
import { Card } from "../ui/card";
export default function ConfirmLoading() {
    return (
        <div className="w-full flex justify-center">
            <Card>
                <ClipLoader size={24} />
            </Card>
        </div>
    );
}