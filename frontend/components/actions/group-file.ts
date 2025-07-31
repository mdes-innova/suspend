'use server';

import { type GroupFile, type Document, type Group } from "@/lib/types";
import { AuthError } from "../exceptions/auth";
import { getAccess } from "./auth";
import { addToGroup, RenameGroup } from "./group";

export async function GetFilesFromGroup(gid: number) {
  const access = await getAccess();
  try {
    const response = await fetch(`${process.env.BACKEND_URL}/group/files/by-group/${gid}/`, {
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
  const access = await getAccess();
  
  try {
    const response = await fetch(`${process.env.BACKEND_URL}/group/files/upload/`, {
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
  const access = await getAccess();
  try {
    const response = await fetch(`${process.env.BACKEND_URL}/group/files/download/${fid}/`, {
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
  const access = await getAccess();
  try {
    const res = await fetch(
      `${process.env.BACKEND_URL}/group/files/${fid}/`,
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

export async function SaveDraft({
  groupId, docIds, name
}: {
  groupId: number,
  docIds: number[],
  name?: string
}) {
  const access = await getAccess();

  if (name != undefined)
    await RenameGroup({
      groupId,
      name
    });

  if (docIds && docIds.length > 0)
    await addToGroup({
      docIds,
      groupId
    });

  return {
    data: 'Saved draft successfully.'
  }; 
}

export async function Edit({
  fid, file, isp
}: {
  fid: number, file?: Blob, isp?: string
}) {
  const access = await getAccess();
  const formData = new FormData();
  if (file != undefined) formData.append('file', file);
  if (isp != undefined) formData.append('isp', isp);

  try {
    const res = await fetch(
      `${process.env.BACKEND_URL}/group/files/${fid}/edit/`,
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