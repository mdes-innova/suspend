'use server';

import { type GroupFile } from "@/lib/types";
import { getAccess } from "./auth";
import { AuthError } from "../exceptions/auth";
import { v4 as uuidv4 } from 'uuid';

export async function getMails() {
    const access = await getAccess();
    const url = process.env.NODE_ENV === "development"? process.env.BACKEND_URL_DEV: process.env.BACKEND_URL_PROD;
  try {
    const res = await fetch(`${url}/mail/mails/`, {
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

export async function SendMail({
    groupId, groupFile
}: {
    groupId: number,
    groupFile: GroupFile
}) {
    const access = await getAccess();

    try {
        const res = await fetch(
        `${process.env.NODE_ENV === "development"?
            process.env.BACKEND_URL_DEV: process.env.BACKEND_URL_PROD}/mail/mails/send/`,
        {
            headers: {
                Authorization: `Bearer ${access}`,
                "Content-Type": "application/json"
            },
            method: "POST",
            body: JSON.stringify({
                groupId,
                groupFileId: groupFile.id,
                isp_id: groupFile.isp?.id
            })
        }
        );

        if (!res.ok) {
        if (res.status === 401)
            throw new AuthError('Authentication fail.');
        throw new Error('Mail failed');
        }

        const mail = await res.json();
        return mail;
    } catch (error) {
        return error;
    }

}

export async function SendMails(groupId: number) {
    const access = await getAccess();
    try {
        const res = await fetch(
        `${process.env.NODE_ENV === "development"?
            process.env.BACKEND_URL_DEV: process.env.BACKEND_URL_PROD}/mail/mails/send-mails/`,
        {
            headers: {
                Authorization: `Bearer ${access}`,
                "Content-Type": "application/json"
            },
            method: "POST",
            body: JSON.stringify({
                groupId
            })
        }
        );

        if (!res.ok) {
        if (res.status === 401)
            throw new AuthError('Authentication fail.');
        throw new Error('Send mails failed');
        }

        const mails = await res.json();
        return mails;
    } catch (error) {
        return error;
    }
}

export async function confirm(hash: string) {

  try {
    const url = process.env.NODE_ENV === "development"? process.env.BACKEND_URL_DEV: process.env.BACKEND_URL_PROD;
    const res = await fetch(`${url}/mail/mails/confirm/`, {
      method: 'POST',
      body: JSON.stringify({
        hash
      }),
      headers: {
          "Content-Type": "application/json"
        },
    }); 

      if (!res.ok) {
      if (res.status === 401)
          throw new AuthError('Authentication fail.')
      throw new Error('Confirm fail.');
      }

      const content = await res.json();
      return content;
  } catch (error) {
      throw error; 
  }
}

export async function getStaffMails() {
    const access = await getAccess();
    const url = process.env.NODE_ENV === "development"? process.env.BACKEND_URL_DEV: process.env.BACKEND_URL_PROD;
  try {
    const res = await fetch(`${url}/mail/mails/staff-mails/`, {
      method: 'GET',
      headers: {
          Authorization: `Bearer ${access}`
        },
    }); 

      if (!res.ok) {
      if (res.status === 401)
          throw new AuthError('Authentication fail.')
      throw new Error('Get staff mails fail.');
      }

      const content = await res.json();
      return content;
  } catch (error) {
      throw error; 
  }
}

export async function getGroupMails(groupMailId: string) {
    const access = await getAccess();
    const url = process.env.NODE_ENV === "development"? process.env.BACKEND_URL_DEV: process.env.BACKEND_URL_PROD;
  try {
    const res = await fetch(`${url}/mail/mails/group-mail/${groupMailId}/`, {
      method: 'GET',
      headers: {
          Authorization: `Bearer ${access}`
        },
    }); 

      if (!res.ok) {
      if (res.status === 401)
          throw new AuthError('Authentication fail.')
      throw new Error('Get group mails fail.');
      }

      const content = await res.json();
      return content;
  } catch (error) {
      throw error; 
  }
}

export async function downloadFile(fid: number) {
  const access = await getAccess();
  try {
    const response = await fetch(`${process.env.NODE_ENV === "development"? process.env.BACKEND_URL_DEV: process.env.BACKEND_URL_PROD}/mail/mailfiles/download/${fid}/`, {
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

export async function sendIspMail({
  groupFileId,
  groupId
}: {
  groupFileId: number,
  groupId: number
}) {
  try {
    const access = await getAccess();
    const url = process.env.NODE_ENV === "development"? process.env.BACKEND_URL_DEV: process.env.BACKEND_URL_PROD;
    const res = await fetch(`${url}/mail/mails/send-isp/`, {
      method: 'POST',
      body: JSON.stringify({
        groupFileId,
        groupId
      }),
      headers: {
          "Authorization": `Bearer ${access}`,
          "Content-Type": "application/json"
        },
    }); 

      if (!res.ok) {
      if (res.status === 401)
          throw new AuthError('Authentication fail.')
      throw new Error('Send mail fail.');
      }

      const content = await res.json();
      return content;
  } catch (error) {
      throw error; 
  }
}