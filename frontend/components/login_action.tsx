'use server';

import { redirect } from 'next/navigation';

interface LoginResult {
  success?: boolean;
  error?: string;
}

export async function login(formData: FormData): Promise<LoginResult> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email and password are required.' };
  }

  // Mock authentication (replace this with real DB/API check)
  if (email === 'test@example.com' && password === 'password123') {
    // You can also set cookies/session here if needed
    return { success: true };
  } else {
    return { error: 'Invalid email or password.' };
  }
}
