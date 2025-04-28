'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { redirect } from 'next/navigation';


export default function LoginPage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const rawFormData = {
      email: formData.get('email'),
      password: formData.get('password'),
    };

    try {
      const response = await axios.post('api/auth/login/', rawFormData);
        router.replace('/');
        router.refresh();
    } catch (error) {
      setErrorMessage('Invalid email or password.');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
        <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email address
        </label>
        <input
            type="email"
            name="email"
            required
            className="mt-1 text-black w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="you@example.com"
            onChange={() => {
                setErrorMessage('');
            }}
        />
        </div>

        <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
        </label>
        <input
            type="password"
            name="password"
            required
            className="mt-1 text-black w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="••••••••"
            onChange={() => {
                setErrorMessage('');
            }}
        />
        </div>

        <div>
        <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-xl hover:bg-blue-600 transition duration-300"
        >
            Sign In
        </button>
        </div>
        {errorMessage && <div className="text-red-400">{errorMessage}</div>}
    </form>
  );
}
