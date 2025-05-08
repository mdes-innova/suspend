'use client';
import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import UserDropdown, { DropdownMenuUser } from './user-dropdown';
import { Button } from "@/components/ui/button";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import SlideBar from './slidebar';

type DefaultBarProps = {
  user: any;
  children: React.ReactNode;
};

const HIDDEN_ROUTES = ['/login', '/secret', '/no-navbar'];

export default function DefaultBar({ user, children }: Readonly<DefaultBarProps>) {
    const pathname = usePathname();
    const [showMenu, setShowMenu] = useState(false);

    if (HIDDEN_ROUTES.includes(pathname)) {
        return (
            <>{ children }</>
        );
    }

    return (
        <div className="w-full h-[150%] flex justify-start items-start relative">
            <div className="fixed top-0 left-0 w-full h-36 bg-blue-400 z-30 flex justify-between items-center px-4">
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
                <DropdownMenuUser user={user} />
                {/* <div className="flex flex-col justify-center items-center">
                    <div className="text-xl font-bold mr-4 cursor-pointer select-none hover:underline"
                        onClick={(e: any) => {
                            e.preventDefault();
                            setShowMenu(prev => !prev);
                        }}
                    >{user}</div>
                    <div className="relative h-0 w-0">
                        { showMenu &&
                            <UserDropdown />
                        }
                    </div>
                </div> */}
            </div>
            <div className="fixed top-0 left-0 h-full  w-96">
                <SlideBar />
            </div>
            { children }
        </div>
    );
}