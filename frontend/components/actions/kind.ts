'use server';

import { AuthError } from "../exceptions/auth";
import { getAccess } from "./auth";

export async function getKinds() {
  const access = await getAccess();

  try {
    const res = await fetch(
      `${process.env.NODE_ENV === "development"? process.env.BACKEND_URL_DEV: process.env.BACKEND_URL_PROD}/kind/kinds/`,
      {
        headers: {
          Authorization: `Bearer ${access}`
        },
      }
    );

    if (!res.ok) {
      if (res.status === 401)
        throw new AuthError('Authentication fail.');
      throw new Error('Fetch failed');
    }

    const kinds = await res.json();
    return kinds;
  } catch (error) {
    return error;
  }
}

export async function getLastKind() {
  const access = await getAccess();
  try {
    const res = await fetch(
        `${process.env.NODE_ENV === "development"? process.env.BACKEND_URL_DEV: process.env.BACKEND_URL_PROD}/kind/kinds/last/`,
      {
        headers: {
          Authorization: `Bearer ${access}`
        },
      }
    );

    if (!res.ok) {
      if (res.status === 401)
        throw new AuthError('Authentication fail.');
      throw new Error('Fetch failed');
    }

    const kind = await res.json();
    return kind;
  } catch (error) {
    throw error;
  }
}
