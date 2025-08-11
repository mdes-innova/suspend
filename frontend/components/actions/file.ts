'use server';

import { getAccess } from "./auth";
import { AuthError } from "../exceptions/auth";

export async function deleteUploadedFile(fid: number) {
  const access = await getAccess();
  try {
    const res = await fetch(
      `${process.env.NODE_ENV === "development"? process.env.BACKEND_URL_DEV: process.env.BACKEND_URL_PROD}/document/documents/file-delete/${fid}/`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${access}`
        },
      }
    );

    if (!res.ok) {
      if (res.status === 401)
        throw new AuthError('Authenticatioin fail.');
      throw new Error('Delete failed');
    }
    return 'File deleted.';
  } catch (error) {
    throw error;
  }
}

export async function downloadPdf(fid: number) {
  const access = await getAccess();
  try {
    const response = await fetch(`${process.env.NODE_ENV === "development"? process.env.BACKEND_URL_DEV: process.env.BACKEND_URL_PROD}/document/documents/pdf-download/${fid}/`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${access}`
      }
    }); 
    if (!response.ok) {
      if (response.status === 401)
        throw new AuthError('Authenticatioin fail.');
      throw new Error('Download pdf failed');
    }

    return response.blob();
  } catch (error) {
    throw error;
  }
}

export async function uploadFile({formData, kind = 'pdf'}: {formData: FormData, kind?: string}) {
  const access = await getAccess();
  
  try {
    const response = await fetch(`${process.env.NODE_ENV === "development"? process.env.BACKEND_URL_DEV: process.env.BACKEND_URL_PROD}/document/documents/${kind}-upload/`, {
      method: "POST",
      body: formData,
      headers: {
        "Authorization": `Bearer ${access}`
      }
    }); 
    if (!response.ok) {
      if (response.status === 401)
        throw new AuthError('Authenticatioin fail.');
      throw new Error('Upload fail.');
    }

    const isps = await response.json();
    return isps;
  } catch (error) {
    throw error;
  }
}

export async function getFileUrls(fid: number) {
  const access = await getAccess();
  try {
    const res = await fetch(
      `${process.env.NODE_ENV === "development"? process.env.BACKEND_URL_DEV: process.env.BACKEND_URL_PROD}/document/documents/file-urls/${fid}/`,
      {
        headers: {
          Authorization: `Bearer ${access}`
        },
      }
    );

    if (!res.ok) {
      if (res.status === 401)
        throw new AuthError('Authentication error.')
      throw new Error('Get file fail.');
    }

    const isps = await res.json();
    return isps;
  } catch (error) {
    throw error;
  }
}
