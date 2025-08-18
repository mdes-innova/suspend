'use server';

import { AuthError } from "../exceptions/auth";
import { getAccess } from "./auth";

export async function getSections() {

  try {
    const access = await getAccess();
    const res = await fetch(
      `${process.env.NODE_ENV === "development"? process.env.BACKEND_URL_DEV: process.env.BACKEND_URL_PROD}/section/sections/`,
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

export async function createSection({
    name
}: {
    name: string
}) {
  try {
    const access = await getAccess();
    const res = await fetch(
      `${process.env.NODE_ENV === "development"? process.env.BACKEND_URL_DEV: process.env.BACKEND_URL_PROD}/section/sections/`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${access}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name
        })
      }
    );

    if (!res.ok) {
      if (res.status === 401)
        throw new AuthError('Authentication fail.');
      throw new Error('Fetch failed');
    }

    const section = await res.json();
    return section;
  } catch (error) {
    return error;
  }
}

export async function getSection(sectionId) {

  try {
    const access = await getAccess();
    const res = await fetch(
      `${process.env.NODE_ENV === "development"? process.env.BACKEND_URL_DEV: process.env.BACKEND_URL_PROD}/section/sections/${sectionId}`,
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
