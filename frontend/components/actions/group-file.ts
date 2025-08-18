'use server';

import { AuthError } from "../exceptions/auth";
import { getAccess } from "./auth";

export async function GetFilesFromGroup(gid: number) {
  try {
    const access = await getAccess();
    const response = await fetch(`${process.env.NODE_ENV === "development"? process.env.BACKEND_URL_DEV: process.env.BACKEND_URL_PROD}/group/files/by-group/${gid}/`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${access}`
      }
    }); 
    if (!response.ok) {
      if (response.status === 401)
        throw new AuthError('Authenticatioin fail.');
      throw new Error('Get files from a group failed');
    }

    const content = await response.json();
    return content;
  } catch (error) {
    throw error;
  }
}

export async function uploadFile({
  formData
}: {
  formData: FormData
}) {
  try {
    const access = await getAccess();
    console.log(formData);
    const response = await fetch(`${process.env.NODE_ENV === "development"? process.env.BACKEND_URL_DEV: process.env.BACKEND_URL_PROD}/group/files/upload/`, {
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

export async function downloadFile(fid: number) {
  try {
    const access = await getAccess();
    const response = await fetch(`${process.env.NODE_ENV === "development"? process.env.BACKEND_URL_DEV: process.env.BACKEND_URL_PROD}/group/files/download/${fid}/`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${access}`
      }
    }); 
    if (!response.ok) {
      if (response.status === 401)
        throw new AuthError('Authenticatioin fail.');
      throw new Error('Download failed');
    }

    return response.blob();
  } catch (error) {
    throw error;
  }
}

export async function RemoveFile(fid: number) {
  try {
    const access = await getAccess();
    const res = await fetch(
      `${process.env.NODE_ENV === "development"? process.env.BACKEND_URL_DEV: process.env.BACKEND_URL_PROD}/group/files/${fid}/`,
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

export async function Edit({
  fid, file, isp
}: {
  fid: number, file?: Blob, isp?: string
}) {
  try {

    const access = await getAccess();
    const formData = new FormData();
    if (file != undefined) formData.append('file', file);
    if (isp != undefined) formData.append('isp', isp);

    const res = await fetch(
      `${process.env.NODE_ENV === "development"? process.env.BACKEND_URL_DEV: process.env.BACKEND_URL_PROD}/group/files/${fid}/edit/`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${access}`
        },
        body: formData
      }
    );

    if (!res.ok) {
      if (res.status === 401)
        throw new AuthError('Authenticatioin fail.');
      throw new Error('Edit fail failed');
    }

    const content = await res.json();
    return content;
  } catch (error) {
    throw error;
  }
}