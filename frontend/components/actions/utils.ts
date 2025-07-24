'use server';

import { AuthError } from "../exceptions/auth";
import { getAccess } from "./auth";

export async function getCurrentDate() {
    const access = await getAccess();

    try {
        const res = await fetch(`${process.env.BACKEND_URL}/current-time/`, {
        headers: {
          Authorization: `Bearer ${access}`
        },
      });
        
        if (!res.ok) {
            if (res.status === 401)
                throw new AuthError('Authentication fail.')
        }

        const currentDate = await res.json();
        return currentDate.current_date;
    } catch (error) {
       throw error; 
    }
}