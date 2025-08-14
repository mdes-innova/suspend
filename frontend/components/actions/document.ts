'use server';

import { AuthError } from "../exceptions/auth";
import { getAccess } from "./auth";

export async function getContent() {
  try {
    const access = await getAccess();
    const res = await fetch(`${process.env.NODE_ENV === "development"? process.env.BACKEND_URL_DEV: process.env.BACKEND_URL_PROD}/document/documents/content/`, {
      headers: {
          Authorization: `Bearer ${access}`
        },
    }); 

      if (!res.ok) {
      if (res.status === 401)
          throw new AuthError('Authentication fail.')
      throw new Error('Get content fail.');
      }

      const content = await res.json();
      return content;
  } catch (error) {
      throw error; 
  }
}

export async function clearSelections() {

  try {
    const access = await getAccess();
    const res = await fetch(`${process.env.NODE_ENV === "development"? process.env.BACKEND_URL_DEV: process.env.BACKEND_URL_PROD}/document/documents/clear-selection/`, {
      method: 'POST',
      headers: {
          Authorization: `Bearer ${access}`
        },
    }); 

      if (!res.ok) {
      if (res.status === 401)
          throw new AuthError('Authentication fail.')
      throw new Error('Clear selection fail.');
      }

      const content = await res.json();
      return content;
  } catch (error) {
      throw error; 
  }
}

export async function getDocument(docId: number) {
  try {
    const access = await getAccess();
    const res = await fetch(`${process.env.NODE_ENV === "development"? process.env.BACKEND_URL_DEV: process.env.BACKEND_URL_PROD}/document/documents/${docId}/`, {
      method: 'GET',
      headers: {
          Authorization: `Bearer ${access}`
        },
    }); 

      if (!res.ok) {
      if (res.status === 401)
          throw new AuthError('Authentication fail.')
      throw new Error('Get a document fail.');
      }

      const content = await res.json();
      return content;
  } catch (error) {
      throw error; 
  }
}

export async function getDocumentList(ids: number[]) {
  try {
    const access = await getAccess(); 
    const res = await fetch(`${process.env.NODE_ENV === "development"? process.env.BACKEND_URL_DEV: process.env.BACKEND_URL_PROD}/document/documents/document-list/`, {
      method: 'POST',
      headers: {
          Authorization: `Bearer ${access}`,
          "Content-Type": "application/json"
        },
      body: JSON.stringify({
        ids
      })
    }); 

      if (!res.ok) {
      if (res.status === 401)
          throw new AuthError('Authentication fail.')
      throw new Error('Get document list fail.');
      }

      const content = await res.json();
      return content;
  } catch (error) {
      throw error; 
  }
}
