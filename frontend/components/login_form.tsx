'use client';

import { useState } from 'react';
import { login } from './login_action';

export default function LoginForm() {
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(formData: FormData) {
    const result = await login(formData);
    if (result?.error) {
      setError(result.error);
    } else {
      window.location.href = '/dashboard'; // Redirect after login
    }
  }

  return (
    <form action={handleLogin} className="flex flex-col gap-4 p-4 max-w-sm mx-auto">
      <h1 className="text-2xl font-bold">Login</h1>
      <input
        type="email"
        name="email"
        placeholder="Email"
        required
        className="border p-2 rounded"
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        required
        className="border p-2 rounded"
      />
      <button type="submit" className="bg-blue-500 text-white p-2 rounded">
        Log In
      </button>
      {error && <p className="text-red-500">{error}</p>}
    </form>
  );
}