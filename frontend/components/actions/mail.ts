'use server';

import { type GroupFile, type Document, type Group } from "@/lib/types";
import { AuthError } from "../exceptions/auth";
import { getAccess } from "./auth";
import { addToGroup } from "./group";

export async function getMails(isp?: boolean) {
    const url = `${process.env.BACKEND_URL}/mail/mails/${(isp != undefined)? isp? 'isp/': 'draft/': ''}`;
  const access = await getAccess();

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
          Authorization: `Bearer ${access}`
        },
    }); 

      if (!res.ok) {
      if (res.status === 401)
          throw new AuthError('Authentication fail.')
      throw new Error('Get mails fail.');
      }

      const content = await res.json();
      return content;
  } catch (error) {
      throw error; 
  }
}

export async function getMail(mailId: number) {
  const access = await getAccess();

  try {
    const res = await fetch(`${process.env.BACKEND_URL}/mail/mails/${mailId}/`, {
      method: 'GET',
      headers: {
          Authorization: `Bearer ${access}`
        },
    }); 

      if (!res.ok) {
      if (res.status === 401)
          throw new AuthError('Authentication fail.')
      throw new Error('Get a mail fail.');
      }

      const content = await res.json();
      return content;
  } catch (error) {
      throw error; 
  }
}

export async function postMail({
    subject, description, date, toUserIds, groupId
}: {
    subject: string,
    description: string,
    date: Date,
    toUserIds: number[],
    groupId: number
}) {
  const access = await getAccess();

  try {
    const res = await fetch(`${process.env.BACKEND_URL}/mail/mails/`, {
      method: 'POST',
      body: JSON.stringify({
        subject,
        description,
        date: date.toISOString().split("T")[0],
        toUserIds,
        groupId 
      }),
      headers: {
          Authorization: `Bearer ${access}`,
          "Content-Type": "application/json"
        },
    }); 

      if (!res.ok) {
      if (res.status === 401)
          throw new AuthError('Authentication fail.')
      throw new Error('Create a new mail fail.');
      }

      const content = await res.json();
      return content;
  } catch (error) {
      throw error; 
  }
}

export async function CreateGroupFile({
  groupId, original_filename
}: {
  groupId: number,
  original_filename?: string
}) {
  const access = await getAccess();
  const res = await fetch(
    `${process.env.BACKEND_URL}/group/groups/${groupId}/group-file/`,
    {
      method: 'POST',
      headers: {
          Authorization: `Bearer ${access}`,
          "Content-Type": "application/json"
      },
      body: JSON.stringify({
        originalFilename: original_filename,
      })
    },
  );

  if (!res.ok) {
    if (res.status === 401)
        throw new AuthError('Authentication fail.')
      throw new Error('Create a new group file fail.');
  }

  const content = await res.json();
  return content;
}

export async function uploadFile({
  formData, gfid
}: {
  formData: FormData, gfid: number
}) {
  const access = await getAccess();
  console.log(access)
  
  try {
    const response = await fetch(`${process.env.BACKEND_URL}/group/groups/upload/${gfid}/`, {
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

export async function downloadFile(gfid: number) {
  const access = await getAccess();
  try {
    const response = await fetch(`${process.env.BACKEND_URL}/group/groups/download/${gfid}/`, {
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

export async function SaveDraft({
  groupId, groupFiles, docIds
}: {
  groupId: number,
  groupFiles: GroupFile[],
  docIds: number[]
}) {
  const access = await getAccess();

  await Promise.all(groupFiles.map(async(groupFile: GroupFile) => {
    const newGroupFile = await CreateGroupFile({
      groupId,
      original_filename: groupFile.originalFilename
    });

    const formData = new FormData();
    formData.append('file', groupFile.file as File);

    await uploadFile(
      {
        formData,
        gfid: newGroupFile.id
      }
    );
  }));

  const res = await addToGroup({
    docIds,
    groupId
  });

  if (!res.ok) {
    if (res.status === 401)
        throw new AuthError('Authentication fail.')
    throw new Error('Save draft fail.');
  }

  const content = await res.json();
  return content;
}
