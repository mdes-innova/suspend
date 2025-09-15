'use client';
import React, { useEffect } from 'react';
import Image from 'next/image';
import { DropdownMenuUser } from './user-dropdown';
import { useAppDispatch, useAppSelector  } from '../components/store/hooks';
import { setUser } from '../components/store/features/user-auth-slice';
import { getProfile } from './actions/user';
import { isAuthError } from './exceptions/auth';
import { RedirectToLogin } from './reload-page';
import { RootState } from './store';
import Link from 'next/link';
import { CustomTrigger } from './sidebar-trigger';


export default function DefaultBar({ children }: { children?: Readonly<React.ReactNode> }) {
    const dispatch = useAppDispatch();
    const user = useAppSelector((state: RootState) => state.userAuth.user);
    
    useEffect(() => {
        const getData = async() => {
            try {
                const user = await getProfile();
                dispatch(setUser(user)); 
            } catch (error) {
                if (isAuthError(error)) {
                    RedirectToLogin();
                }
            }
        }
        if (!user)
            getData();
    }, []);

    return (
         <div className="w-full min-h-dvh flex flex-col justify-start items-start relative">
            <CustomTrigger />
            <div className="w-full h-36 max-h-36 bg-blue-400 flex justify-between py-0
            items-center px-4 max-lg:px-1 max-md:p-0">
                <div className="w-32 h-32 max-lg:w-20 max-lg:h-20 block
                    relative selection:none max-md:hidden"
                    >
                    <Link className='absolute top-0 left-0 h-full w-full z-10 ' href='/'></Link>
                    <Image 
                        src="/images/de.png"
                        alt="Home logo"
                        fill
                        className="object-contain"
                        sizes="100vw"
                        priority
                    />
                </div>
                <div className="flex flex-col h-36 justify-center items-start mr-auto
                pl-10 max-lg:pl-4 max-md:pl-2 max-md:pt-2 relative">
                    <Link className="absolute top-0 left-0 w-full h-full min-md:hidden" href='/'></Link>
                    <div>
                        <div className="text-2xl font-bold max-lg:text-sm">ระบบระงับการเผยแพร่ซึ่งข้อมูลคอมพิวเตอร์ที่มีความผิดตาม พ.ร.บ. คอมพิวเตอร์</div>
                        <div className="text-xl max-lg:text-xs">กองป้องกันและปราบปรามการกระทำความผิดทางเทคโรโลยีสารสนเทศ</div>
                    </div>
                </div>
                <div className="max-md:hidden">
                    <DropdownMenuUser/>
                </div>
            </div>
            { children }
        </div>
    );
}