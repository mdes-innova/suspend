'use client';

import { Mail } from "lucide-react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function UserMailbox() {
    const router = useRouter();

    useEffect(() => {
        
    }, []);

    return (
        <div className='relative w-12 h-10 '>
                <Mail size={32} color='white' className="absolute z-20 top-0 left-0 cursor-pointer" onClick={
                    (e: any) => {
                        e.preventDefault();
                        router.push('/inbox');
                        router.refresh();
                    }
                }/>
                <div className="absolute top-0 right-2 rounded-md text-xs bg-red-400 w-4 text-white text-center z-30">0</div>
        </div>
    );
}