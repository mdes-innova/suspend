'use client';
import React, { useEffect } from 'react';
import Image from 'next/image';
import { DropdownMenuUser } from './user-dropdown';
import { useAppDispatch  } from '../components/store/hooks';
import { setUser } from '../components/store/features/user-auth-slice';
import { getProfile } from './actions/user';
import { isAuthError } from './exceptions/auth';
import { redirectToLogin } from './reload-page';


export default function DefaultBar({ children }: { children?: Readonly<React.ReactNode> }) {
    const dispatch = useAppDispatch();
    
    useEffect(() => {
        const getData = async() => {
            try {
                const user = await getProfile();
                dispatch(setUser(user)); 
            } catch (error) {
                if (isAuthError(error)) {
                    redirectToLogin();
                }
            }
        }
        getData();
    }, []);

    return (
         <div className="w-full min-h-dvh flex flex-col justify-start items-start relative">
            <div className="w-full h-36 bg-blue-400 flex justify-between items-center px-4 max-lg:px-1 max-md:p-0">
                <div className="w-32 h-32 max-lg:w-20 max-lg:h-20 block
                    relative selection:none cursor-pointer max-md:hidden"
                    onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                        e.preventDefault();
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
                <div className="flex flex-col h-full justify-center items-start mr-auto pl-10 max-lg:pl-4 max-md:pl-2 max-md:mt-2">
                    <div className="text-2xl font-bold max-lg:text-sm">ระบบระงับการเผยแพร่ซึ่งข้อมูลคอมพิวเตอร์ที่มีความผิดตาม พ.ร.บ. คอมพิวเตอร์</div>
                    <div className="text-xl max-lg:text-xs">กองป้องกันและปราบปรามการกระทำความผิดทางเทคโรโลยีสารสนเทศ</div>
                </div>
                <div className="max-md:hidden">
                    <DropdownMenuUser/>
                </div>
            </div>
            { children }
        </div>
    );
}