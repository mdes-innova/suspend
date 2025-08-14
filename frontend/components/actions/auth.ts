'use server'

import { cookies } from 'next/headers';
import { AuthError } from "../exceptions/auth";

export async function getAccess() {
  const cookieStore = await cookies();
  const url = process.env.NODE_ENV === "development"? process.env.BACKEND_URL_DEV: process.env.BACKEND_URL_PROD;

  if (cookieStore.has('access')) {
    const access = cookieStore.get('access')?.value;
    try {
      const res = await fetch(`${url}/user/users/me/`,
        {
          headers: {
            "Authorization": `Bearer ${access}`,
          }
        }
      );

      if (res.ok)
        return access;
      else {
        if (res.status === 401) {
          if (cookieStore.has('refresh')) {
            const refresh = cookieStore.get('refresh')?.value;
            try {
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

              cookieStore.set({
                  name: 'access',
                  value: data.access,
                  httpOnly: true,
                  secure: process.env.NODE_ENV === 'production',
                  sameSite: 'lax',
                  path: '/',
                  maxAge: 60 * 5,  // 5 minutes
              });

              return data.access;
            } catch (error) {
              console.error(error);
              throw new AuthError('No cookie found.');
            }
          } else {
            throw new AuthError('No refresh found.');
          }
        } else {
          throw new Error('Cannot get access token.');
        }
      }
    } catch (error) {
      console.error(error);
    }
  } else {
    if (cookieStore.has('refresh')) {
      const refresh = cookieStore.get('refresh')?.value;
      try {
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

        cookieStore.set({
            name: 'access',
            value: data.access,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 5,  // 5 minutes
        });

        return data.access;
      } catch (error) {
        console.error(error);
        throw new AuthError('No cookie found.');
      }
    } else {
      throw new AuthError('No refresh found.');
    }
  }
}