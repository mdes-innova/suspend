'use client';

import { RootState } from "../store";
import { ALERTUI, closeModal } from "../store/features/alert-ui-slice";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { CheckCircle2Icon, CircleX } from "lucide-react";

export default function MyAlert() {
    const modalOpen = useAppSelector((state: RootState) => state.alertUi.modalOpen);
    const alertUi = useAppSelector((state: RootState) => state.alertUi.ui);
    const dispatch = useAppDispatch();

    if (!modalOpen) return null;

    let componet = null

    switch (alertUi) {
        case ALERTUI.successful_register:
            componet = <SuccessfulRegister />; 
            break;

        case ALERTUI.fail_register:
            componet = <FailRegister />; 
            break;

        case ALERTUI.successful_groupsave:
            componet = <SuccessfulGroupSaved />; 
            break;

        case ALERTUI.fail_groupsave:
            componet = <FailGroupSaved />; 
            break;
    
        default:
            break;
    }

    return (
        <div className="w-full h-full block absolute top-0 left-0 z-40 bg-background/50"
            onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                e.preventDefault();
                dispatch(closeModal());
            }}
        >
        <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50
                w-fit animate-in fade-in zoom-in"
            onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                e.stopPropagation();
            }}
                >
            {componet}
        </div>
        </div>
    );
}

function SuccessfulRegister() {
    const dispatch = useAppDispatch();
    return (
    <Alert className="py-6 px-10 relative border-2 border-green-500">
        <div className="absolute top-0 right-0"
            onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                e.stopPropagation();
                dispatch(closeModal());
            }}
        >
            <CircleX color="rgb(100, 100, 100)" className="opacity-20"/>
        </div>
        <AlertTitle className="text-xl flex justify-start gap-x-1">
            <CheckCircle2Icon size={24} />
            ลงทะเบียนสำเร็จ 
        </AlertTitle>
        <AlertDescription>
            ท่านได้ลงทะเบียนใช้งานสำหรับผู้ใช้ใหม่ได้สำเร็จ
        </AlertDescription>
    </Alert>
    );
}

function FailRegister() {
    const dispatch = useAppDispatch();
    return (
        <Alert className="py-6 px-10 relative border-2 border-red-500">
            <div className="absolute top-0 right-0"
                onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                    e.stopPropagation();
                    dispatch(closeModal());
                }}
            >
                <CircleX color="rgb(100, 100, 100)" className="opacity-20"/>
            </div>
            <AlertTitle className="text-xl flex justify-start gap-x-1">
                <CircleX size={24} />
                ลงทะเบียนไม่สำเร็จ 
            </AlertTitle>
            <AlertDescription>
                ท่านได้ลงทะเบียนใช้งานสำหรับผู้ใช้ไม่ได้สำเร็จ โปรดลองใหม่
            </AlertDescription>
        </Alert>
    );
}

function SuccessfulGroupSaved() {
    const dispatch = useAppDispatch();
    return (
    <Alert className="py-6 px-10 relative border-2 border-green-500">
        <div className="absolute top-0 right-0"
            onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                e.stopPropagation();
                dispatch(closeModal());
            }}
        >
            <CircleX color="rgb(100, 100, 100)" className="opacity-20"/>
        </div>
        <AlertTitle className="text-xl flex justify-start gap-x-1">
            <CheckCircle2Icon size={24} />
            บันทึกฉบับบร่างสำเร็จ
        </AlertTitle>
        <AlertDescription>
            ฉบับบร่างนี้ได้ถูกบันทึกสำเร็จ
        </AlertDescription>
    </Alert>
    );
}

function FailGroupSaved() {
    const dispatch = useAppDispatch();
    return (
        <Alert className="py-6 px-10 relative border-2 border-red-500">
            <div className="absolute top-0 right-0"
                onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                    e.stopPropagation();
                    dispatch(closeModal());
                }}
            >
                <CircleX color="rgb(100, 100, 100)" className="opacity-20"/>
            </div>
            <AlertTitle className="text-xl flex justify-start gap-x-1">
                <CircleX size={24} />
                บันทึกไม่สำเร็จ 
            </AlertTitle>
            <AlertDescription>
                ไม่สามารถบันทึกฉบับบร่างนี้ได้ โปรดลองใหม่
            </AlertDescription>
        </Alert>
    );
}