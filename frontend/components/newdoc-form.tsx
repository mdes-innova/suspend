'use client';

import { useAppSelector } from '../components/store/hooks';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import {RotatingLines} from 'react-loader-spinner';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from './ui/select';

export default function NewdocForm() {
    const user = useAppSelector((state: any) => state.userAuth.user);
    const [isp, setIsp] = useState('')
    const router = useRouter();
    const [errorMessage, setErrorMessage] = useState('');
    const [success, setSuccess] = useState(false);
    const [registerLoading, setRegisterLoading] = useState(false);

    // if (user && (!user?.isStaff || !user.isActive))
    //     router.back();

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const rawFormData = {
            username: formData.get('username'),
            password: formData.get('password'),
            isp: isp === ''? null: isp
        };

        if (rawFormData['password'] != formData.get('confirm-password')) {
            setRegisterLoading(false);
            setErrorMessage('รหัสผ่านไม่เหมือนกัน')
        }

        try {
            setRegisterLoading(true);
            const _ = await axios.post('api/register/', rawFormData,
                {withCredentials: true}
            );
            setRegisterLoading(false);
            setErrorMessage('');
            setSuccess(true);
        } catch (error) {
            setRegisterLoading(false);
            setSuccess(false);
            setErrorMessage('ลงทะเบียนไม่สำเร็จ');
        }
  }


    return (
        <div className='w-full h-full flex justify-center items-center'>
            <form onSubmit={handleSubmit} className="space-y-5 w-[700px] p-10 rounded-xl shadow-[4px_8px_16px_rgba(0,0,0,0.6)]">
                <div>
                <label htmlFor="username" className="block text-sm font-medium text-foreground">
                    ชื่อผู้ใช้งาน
                </label>
                <input
                    type="text"
                    id="username"
                    name="username"
                    required
                    className="mt-1 text-foreground w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-border"
                    placeholder="username"
                    onChange={() => {
                        setErrorMessage('');
                        setSuccess(false);
                    }}
                />
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-foreground">
                        รหัสผ่าน
                    </label>
                    <input
                        type="password"
                        name="password"
                        id="password"
                        required
                        className="mt-1 text-foreground w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-border"
                        placeholder="••••••••"
                        onChange={() => {
                            setErrorMessage('');
                            setSuccess(false);
                        }}
                    />
                </div>
                <div>
                    <label htmlFor="confirm-password" className="block text-sm font-medium text-foreground">
                        ยืนยันรหัสผ่าน
                    </label>
                    <input
                        type="password"
                        name="confirm-password"
                        id="confirm-password"
                        required
                        className="mt-1 text-foreground w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-border"
                        placeholder="••••••••"
                        onChange={() => {
                            setErrorMessage('');
                            setSuccess(false);
                        }}
                    />
                </div>
                <div>
                    <label htmlFor="isp" className="block text-sm font-medium text-foreground">
                        ISP
                    </label>
                    <Select
                        name="isp"
                        required
                        value={isp} onValueChange={(val) => setIsp(val)}
                    >
                        <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select a ISP" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                            <SelectLabel>ISP</SelectLabel>
                            <SelectItem value="apple">Apple</SelectItem>
                            <SelectItem value="banana">Banana</SelectItem>
                            <SelectItem value="blueberry">Blueberry</SelectItem>
                            <SelectItem value="grapes">Grapes</SelectItem>
                            <SelectItem value="pineapple">Pineapple</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>

                <div>
                <button
                    type="submit"
                    className="w-full bg-[#34c6b7] text-background font-bold h-12 relative items-center
                    py-2 rounded-xl hover:ring hover:ring-border transition duration-300 flex justify-center"
                >
                {!registerLoading &&
                    <div>
                        ลงทะเบียน
                    </div>
                }
                {registerLoading &&
                    <RotatingLines 
                    visible={true}
                    width="40"
                    strokeColor="#FFFFFF"
                    strokeWidth="5"
                    animationDuration="0.75"
                    />
                }
                </button>
                </div>
                {errorMessage != '' && !success && <div className="text-destructive">{errorMessage}</div>}
                {errorMessage == '' && success && <div className="text-green-600">ลงทะเบียนสำเร็จ</div>}
            </form>
        </div>
    );
}