'use server';

import { type GroupFile } from "@/lib/types";
import { getAccess } from "./auth";
import { GetFilesFromGroup } from "./group-file";
import { AuthError } from "../exceptions/auth";

export async function getMails() {
    const access = await getAccess();
    const url = process.env.NODE_ENV === "development"? process.env.BACKEND_URL_DEV: process.env.process.env.BACKEND_URL_PROD;
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
            process.env.BACKEND_URL_DEV: process.env.process.env.BACKEND_URL_PROD}/mail/mails/send/`,
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
            process.env.BACKEND_URL_DEV: process.env.process.env.BACKEND_URL_PROD}/mail/mails/send-mails/`,
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
  const access = await getAccess();

  try {
    const url = process.env.NODE_ENV === "development"? process.env.BACKEND_URL_DEV: process.env.process.env.BACKEND_URL_PROD;
    const res = await fetch(`${url}/mail/mails/confirm/`, {
      method: 'POST',
      body: JSON.stringify({
        hash
      }),
      headers: {
          Authorization: `Bearer ${access}`,
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
    const url = process.env.NODE_ENV === "development"? process.env.BACKEND_URL_DEV: process.env.process.env.BACKEND_URL_PROD;
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
