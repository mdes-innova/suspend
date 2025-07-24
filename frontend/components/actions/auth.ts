'use server'

import { cookies } from 'next/headers';
import { AuthError } from "../exceptions/auth";

export async function getAccess() {
  const cookieStore = await cookies();

  if (cookieStore.has('access')) {
    const access = cookieStore.get('access')?.value;
    return access;
  } else {
    if (cookieStore.has('refresh')) {
      const refresh = cookieStore.get('refresh')?.value;
      try {
        const res = await fetch(
          `${process.env.BACKEND_URL}/token/refresh/`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh }),
          }
        );

        if (!res.ok) {
          throw new AuthError(`Token refresh failed: ${res.status}`);
        }

        const data = await res.json();
        return data.access;
      } catch (error) {
        throw new Error('No cookie found.');
      }
    } else {
      throw new AuthError('No refresh found.');
    }
  }
}