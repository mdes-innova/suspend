'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '../components/store/hooks';
import { openModal } from '../components/store/features/password-reset-ui-slice';

export default function LoginPage() {
  const dispatch = useAppDispatch();

  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const rawFormData = {
      username: formData.get('username'),
      password: formData.get('password'),
    };

    try {
      const response = await axios.post('api/auth/login/', rawFormData,
        {
          withCredentials: true
        }
      );
        router.replace('/');
        router.refresh();
    } catch (error) {
      setErrorMessage('ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 w-full p-10 rounded-xl shadow-[4px_8px_16px_rgba(0,0,0,0.6)]">
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
            required
            className="mt-1 text-foreground w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-border"
            placeholder="••••••••"
            onChange={() => {
                setErrorMessage('');
            }}
        />
        </div>

        <div>
        <button
            type="submit"
            className="w-full bg-[#34c6b7] text-background font-bold
              py-2 rounded-xl hover:ring hover:ring-border transition duration-300"
        >
            เข้าสู่ระบบ
        </button>
        </div>
        {errorMessage != '' && <div className="text-destructive">{errorMessage}</div>}
        <p className="cursor-pointer text-[#34c6b7] underline"
          onClick={(e: any) => {
            e.preventDefault();
            dispatch(openModal());
          }}>รีเซ็ตรหัสผ่าน</p>
    </form>
  );
}
