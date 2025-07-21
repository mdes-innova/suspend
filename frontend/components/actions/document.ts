'use server';

import { AuthError } from "../exceptions/auth";
import { getAccess } from "./auth";

export async function getContent() {
  const access = await getAccess();

  try {
    const res = await fetch(`${process.env.BACKEND_URL}/api/document/documents/content/`, {
      headers: {
          Authorization: `Bearer ${access}`
        },
    }); 

      if (!res.ok) {
      if (res.status === 401)
          throw new AuthError('Authentication fail.')
      throw new Error('Get content fail.');
      }

      const content = await res.json();
      return content;
  } catch (error) {
      throw error; 
  }
}