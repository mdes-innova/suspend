'use client';
import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { DropdownMenuUser } from './user-dropdown';
import SlideBar from './slidebar';
import { useAppDispatch } from '../components/store/hooks';
import { setUser } from '../components/store/features/user-auth-slice';

type DefaultBarProps = {
  user: any;
  children: React.ReactNode;
};

const HIDDEN_ROUTES = ['/login', '/secret', '/no-navbar'];

export default function DefaultBar({ user, children }: Readonly<DefaultBarProps>) {
    const pathname = usePathname();
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(setUser({
            username: user?.username,
            isStaff: user?.isStaff,
            isActive: user?.isActive
        }));
    }, []);

    if (HIDDEN_ROUTES.includes(pathname)) {
        return (
            <>{ children }</>
        );
    }

    return (
        <div className="w-full h-dvh flex flex-col justify-start items-start ">
            <div className="w-full h-36 bg-blue-400 flex justify-between items-center px-4">
                <div className="w-32 h-32 block relative selection:none cursor-pointer"
                    onClick={(e: any) => {
                        if (window) window.location.href = `${process.env.NEXT_PUBLIC_FRONTEND}`;
                    }}>
                    <Image 
                        src="/images/logo.png"
                        alt="Home logo"
                        fill
                        className="object-cover"
                        sizes="100vw"
                        priority
                    />
                </div>
                <div className="flex flex-col h-full justify-center items-start mr-auto pl-10">
                    <div className="text-2xl font-bold">ระบบระงับการเผยแพร่ซึ่งข้อมูลคอมพิวเตอร์ที่มีความผิดตาม พ.ร.บ. คอมพิวเตอร์</div>
                    <div>กองป้องกันและปราบปรามการกระทำความผิดทางเทคโรโลยีสารสนเทศ</div>
                </div>
                <DropdownMenuUser user={user} />
            </div>
            <div className="flex justify-start items-start w-full h-full ">
                <SlideBar />
                <div className="w-full pt-2">
                    { children }
                </div>
            </div>
        </div>
    );
}