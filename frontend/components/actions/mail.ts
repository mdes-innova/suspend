'use server';

import { AuthError } from "../exceptions/auth";
import { getAccess } from "./auth";

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
