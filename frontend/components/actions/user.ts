'use server';

import { AuthError } from "../exceptions/auth";
import { getAccess } from "./auth";
import { cookies, headers } from 'next/headers';

export async function getProfile() {
    const access = await getAccess();

    try {
        const res = await fetch(`${process.env.BACKEND_URL}/api/user/users/me/`, {
        headers: {
          Authorization: `Bearer ${access}`
        },
      });
        
        if (!res.ok) {
            if (res.status === 401)
                throw new AuthError('Authentication fail.')
        }

        const profile = await res.json();
        return profile;
    } catch (error) {
       throw error; 
    }
}

export async function registerUser({
    username,
    password,
    userType,
    isp,
}: {
    username: string,
    password: string,
    userType: string
    isp: string,
}) {
   const access = await getAccess(); 

    try {
        const res = await fetch(`${process.env.BACKEND_URL}/api/user/users/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${access}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username,
            password,
            isp,
            isStaff: userType === 'user'? false: true
        })
      });
        
        if (!res.ok) {
            if (res.status === 401)
                throw new AuthError('Authentication fail.')
        }
        const profile = await res.json();
        return profile;
    } catch (error) {
       throw error; 
    }
}

export async function loginUser({
    username,
    password,
}: {
    username: string,
    password: string
}) {
    try {
        const headersList = await headers();
        const forwardedFor = headersList.get('x-forwarded-for') || '';
        const ip = forwardedFor.split(',')[0];
        const res = await fetch(`${process.env.BACKEND_URL}/api/token/`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username,
            password,
        })
      });
        
        if (!res.ok) {
            if (res.status === 401)
                throw new AuthError('Authentication fail.')
        }
        const data = await res.json();
        const {access} = data;
        const {refresh } = data;

        cookies().set({
            name: 'access',
            value: access,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 5,  // 5 minutes
        });

        cookies().set({
            name: 'refresh',
            value: refresh,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7,  // 5 minutes
        });

    } catch (error) {
       throw error; 
    }
}