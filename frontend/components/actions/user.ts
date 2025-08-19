'use server';

import { type UserRegister } from "@/lib/types";
import { AuthError } from "../exceptions/auth";
import { getAccess } from "./auth";
import { cookies } from 'next/headers';

export async function getProfile() {

    try {
        const access = await getAccess();
        const res = await fetch(`${process.env.NODE_ENV === "development"? process.env.BACKEND_URL_DEV: process.env.BACKEND_URL_PROD}/user/users/me/`, {
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

export async function getUsers() {

    try {
        const access = await getAccess();
        const url = process.env.NODE_ENV === "development"? process.env.BACKEND_URL_DEV: process.env.BACKEND_URL_PROD;
        const res = await fetch(`${url}/user/users/`, {
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

export async function registerUser(userRegisterParams: UserRegister) {
    try {
        const access = await getAccess(); 
        const res = await fetch(`${process.env.NODE_ENV === "development"? process.env.BACKEND_URL_DEV: process.env.BACKEND_URL_PROD}/user/users/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${access}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(
            userRegisterParams
        )
      });
        
        if (!res.ok) {
            if (res.status === 401)
                throw new AuthError('Authentication fail.')
            else
                throw new Error("Register new user fail.");
        }
        const profile = await res.json();
        return profile;
    } catch (error) {
        console.error(error)
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
        const cookieStore = await cookies()
        const url = process.env.NODE_ENV === "development"? process.env.BACKEND_URL_DEV: process.env.BACKEND_URL_PROD;
        const res = await fetch(`${url}/token/`, {
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

        cookieStore.set({
            name: 'access',
            value: access,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 5,  // 5 minutes
        });

        cookieStore.set({
            name: 'refresh',
            value: refresh,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7,  // 5 minutes
        });

        const userRes = await fetch(`${url}/user/users/me/`, {
            headers: {
            Authorization: `Bearer ${access}`
            },
        });
        
        if (!userRes.ok) {
            if (userRes.status === 401)
                throw new AuthError('Authentication fail.')
        }

        const profile = await userRes.json();
        return profile;

    } catch (error) {
       throw error; 
    }
}

export async function logoutUser() {
    try {
        const cookieStore = await cookies();
        cookieStore.delete('access');
        cookieStore.delete('refresh');
    } catch (error) {
       throw error; 
    }
}