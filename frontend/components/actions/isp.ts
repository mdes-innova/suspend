'use server';

import { getAccess } from "./auth";
import { AuthError } from "../exceptions/auth";

export async function getIsps() {
  const access = await getAccess();

  try {
    const res = await fetch(
      `${process.env.BACKEND_URL}/api/isp/isps/`,
      {
        headers: {
          Authorization: `Bearer ${access}`
        },
      }
    );

    if (!res.ok) {
      if (res.status === 401)
        throw new AuthError('Authentication fail.');
      throw new Error('Get ISPs fail.');
    }

    const isps = await res.json();
    return isps;
  } catch (error) {
    throw error;
  }
}
