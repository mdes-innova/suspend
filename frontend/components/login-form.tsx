'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

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
        <label htmlFor="email" className="block text-sm font-medium text-foreground">
            Email address
        </label>
        <input
            type="email"
            name="email"
            required
            className="mt-1 text-foreground w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-border"
            placeholder="you@example.com"
            onChange={() => {
                setErrorMessage('');
            }}
        />
        </div>

        <div>
        <label htmlFor="password" className="block text-sm font-medium text-foreground">
            Password
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
            className="w-full bg-chart-1 text-foregroud py-2 rounded-xl hover:ring hover:ring-border transition duration-300"
        >
            Sign In
        </button>
        </div>
        {true && <div className="text-destructive">{errorMessage}</div>}
    </form>
  );
}
