'use server'

import { cookies } from 'next/headers';
import { AuthError } from "../exceptions/auth";

export async function getAccess() {
  try {
    const cookieStore = await cookies();
    const access = cookieStore.get("access")?.value;
    const refresh = cookieStore.get("refresh")?.value;
    const url = process.env.NODE_ENV === "development"? process.env.BACKEND_URL_DEV: process.env.BACKEND_URL_PROD;

    if (access) {
      const access = cookieStore.get('access')?.value;
        const resAccessMe = await fetch(`${url}/user/users/me/`,
          {
            headers: {
              "Authorization": `Bearer ${access}`,
            }
          }
        );

        if (resAccessMe.ok)
          return access;
    }

    if (!refresh) throw new AuthError(`Refresh token not found.`);

    const res = await fetch(
      `${url}/token/refresh/`,
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
    const newAccess = data.access;
    cookieStore.set({
      name: 'access',
      value: newAccess,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 4,
    });

    return newAccess;
  } catch (error) {
    console.error(error);
    throw new AuthError('Getting access fail.');  
  }
}