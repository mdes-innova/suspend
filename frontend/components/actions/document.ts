'use server';

import { AuthError } from "../exceptions/auth";
import { getAccess } from "./auth";

type SortType = {
  name: string,
  decs: boolean,
  id: string
}

type PaginationType = {
  pageIndex: number,
  pageSize: number
}

type ContentProps = {
  sorts: SortType[],
  pagination: PaginationType
}

export async function getContent(props: ContentProps) {
  const sortQueries = props.sorts.map((e) => `sort=${e.name}`).join('&');
  const decsQueries = props.sorts.map((e) => `decs=${e.decs}`).join('&');

  try {
    const access = await getAccess();
    const baseUrl = process.env.NODE_ENV === "development"? process.env.BACKEND_URL_DEV: process.env.BACKEND_URL_PROD;
    const res = await fetch(`${baseUrl}/document/documents/content/?${sortQueries}&${decsQueries}`
      + `&page=${props.pagination.pageIndex}&pagesize=${props.pagination.pageSize}`, {
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

export async function downloadPdf(did: number) {
  try {
  const access = await getAccess();
    const response = await fetch(`${process.env.NODE_ENV === "development"? process.env.BACKEND_URL_DEV: process.env.BACKEND_URL_PROD}/document/documents/pdf-download/${did}/`, {
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

export async function downloadUrls(did: number) {
  try {
  const access = await getAccess();
    const response = await fetch(`${process.env.NODE_ENV === "development"? process.env.BACKEND_URL_DEV: process.env.BACKEND_URL_PROD}/document/documents/urls-download/${did}/`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${access}`
      }
    }); 
    if (!response.ok) {
      if (response.status === 401)
        throw new AuthError('Authenticatioin fail.');
      throw new Error('Download urls failed');
    }

    return response.blob();
  } catch (error) {
    throw error;
  }
}