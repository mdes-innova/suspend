'use server';

import { AuthError } from "../exceptions/auth";
import { getAccess } from "./auth";

export async function getCurrentDate() {
    try {
      const access = await getAccess();
      const res = await fetch(`${process.env.NODE_ENV === "development"? process.env.BACKEND_URL_DEV: process.env.BACKEND_URL_PROD}/current-time/`, {
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