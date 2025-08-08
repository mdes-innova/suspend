'use client';
import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { DropdownMenuUser } from './user-dropdown';
import { useAppDispatch  } from '../components/store/hooks';
import { setUser } from '../components/store/features/user-auth-slice';
import { getProfile } from './actions/user';

const HIDDEN_ROUTES = ['login', 'secret', 'no-navbar', 'confirm'];

export default function DefaultBar({ children }: { children?: Readonly<React.ReactNode> }) {
    const pathname = usePathname();
    const pathId = (pathname.split('/'))[1];
    const dispatch = useAppDispatch();
    
    useEffect(() => {
        const getData = async() => {
            const user = await getProfile();
            dispatch(setUser(user)); 
        }
        getData();
    }, []);

    if (HIDDEN_ROUTES.map(elem => pathId.includes(elem)).some(Boolean) ||
        pathname.includes('mail/confirm')) {
        return (
            <>{ children }</>
        );
    }

    return (
         <div className="w-full min-h-dvh flex flex-col justify-start items-start relative">
            <div className="w-full h-36 bg-blue-400 flex justify-between items-center px-4">
                <div className="w-32 h-32 block relative selection:none cursor-pointer"
                    onClick={(e: React.MouseEvent<HTMLDivElement>) => {
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
                <DropdownMenuUser/>
            </div>
            { children }
        </div>
    );
}