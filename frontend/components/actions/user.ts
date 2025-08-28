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

export async function getUser(userId: number) {

    try {
        const access = await getAccess();
        const url = process.env.NODE_ENV === "development"? process.env.BACKEND_URL_DEV: process.env.BACKEND_URL_PROD;
        const res = await fetch(`${url}/user/users/${userId}`, {
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

export async function getUserFromIsp(ispId: number) {
    try {
        const access = await getAccess();
        const baseUrl = process.env.NODE_ENV === "development"? process.env.BACKEND_URL_DEV: process.env.BACKEND_URL_PROD;
        const res = await fetch(`${baseUrl}/user/users/by-isp/${ispId}/`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${access}`
            },
        }); 

      if (!res.ok) {
      if (res.status === 401)
            throw new AuthError('Authentication fail.')
        throw new Error('Get a user from isp fail.');
      }

      const content = await res.json();
      return content;
  } catch (error) {
      throw error; 
  }
    
}

export async function getUsersFromIspList(ispIds: number[]) {
    try {
        const access = await getAccess();
        const res = await fetch(`${process.env.NODE_ENV === "development"? process.env.BACKEND_URL_DEV: process.env.BACKEND_URL_PROD}/user/users/by-isps/`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${access}`,
          "Content-Type": "application/json"
            },
        body: JSON.stringify({
            ispIds
        })
        }); 

      if (!res.ok) {
      if (res.status === 401)
            throw new AuthError('Authentication fail.')
        throw new Error('Get a user from isp fail.');
      }

      const content = await res.json();
      return content;
  } catch (error) {
      throw error; 
  }
    
}

export async function updateUser({
    userId,
    username,
    password,
    email
}: {
    userId: number,
    username: string | undefined,
    password: string | undefined,
    email: string | undefined
}) {
    try {
        const access = await getAccess();
        const baseUrl = process.env.NODE_ENV === "development"? process.env.BACKEND_URL_DEV: process.env.BACKEND_URL_PROD;
        const res = await fetch(`${baseUrl}/user/users/${userId}/`, {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${access}`,
                "Content-Type": "application/json"
                },
            body: JSON.stringify({
                username,
                password,
                email
            })
        }); 

      if (!res.ok) {
      if (res.status === 401)
            throw new AuthError('Authentication fail.')
        throw new Error('Update user fail.');
      }

      const content = await res.json();
      return content;
  } catch (error) {
      throw error; 
  }
}

export async function registerUser(userRegisterParams: UserRegister) {
    console.log(userRegisterParams)
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
            maxAge: 60 * 4.5,
        });

        cookieStore.set({
            name: 'refresh',
            value: refresh,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 23.9,
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