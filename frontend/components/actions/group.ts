'use server';

import { AuthError } from "../exceptions/auth";
import { getAccess } from "./auth";

export async function getGroups() {
  const access = await getAccess();

  try {
    const res = await fetch(`${process.env.BACKEND_URL}/group/groups/`, {
      method: 'GET',
      headers: {
          Authorization: `Bearer ${access}`
        },
    }); 

      if (!res.ok) {
      if (res.status === 401)
          throw new AuthError('Authentication fail.')
      throw new Error('Get groups fail.');
      }

      const content = await res.json();
      return content;
  } catch (error) {
      throw error; 
  }
}

export async function getGroup(groupId: number) {
  const access = await getAccess();

  try {
    const res = await fetch(`${process.env.BACKEND_URL}/group/groups/${groupId}/`, {
      method: 'GET',
      headers: {
          Authorization: `Bearer ${access}`
        },
    }); 

      if (!res.ok) {
      if (res.status === 401)
          throw new AuthError('Authentication fail.')
      throw new Error('Get a group fail.');
      }

      const content = await res.json();
      return content;
  } catch (error) {
      throw error; 
  }
}

export async function postGroup(name: string) {
  const access = await getAccess();

  try {
    const res = await fetch(`${process.env.BACKEND_URL}/group/groups/`, {
      method: 'POST',
      body: JSON.stringify({
        name
      }),
      headers: {
          Authorization: `Bearer ${access}`,
          "Content-Type": "application/json"
        },
    }); 

      if (!res.ok) {
      if (res.status === 401)
          throw new AuthError('Authentication fail.')
      throw new Error('Create a new group fail.');
      }

      const content = await res.json();
      return content;
  } catch (error) {
      throw error; 
  }
}

export async function addToGroup({ docIds, mode, groupId }: {
    docIds: number[], mode: string, groupId: number
}) {
  const access = await getAccess();

  try {
    const res = await fetch(`${process.env.BACKEND_URL}/group/groups/${groupId}/`, {
      method: 'PATCH',
      body: JSON.stringify({
        documentIds: docIds,
        mode
      }),
      headers: {
          Authorization: `Bearer ${access}`,
          "Content-Type": "application/json"
        },
    }); 

      if (!res.ok) {
      if (res.status === 401)
          throw new AuthError('Authentication fail.')
      throw new Error('Adding to a group fail.');
      }

      const content = await res.json();
      return content;
  } catch (error) {
      throw error; 
  }
}

export async function removeDocumentFromGroup({ docIds, groupId }: {
    docIds: number[], groupId: number
}) {
  const access = await getAccess();

  try {
    const res = await fetch(`${process.env.BACKEND_URL}/group/groups/${groupId}/`, {
      method: 'PATCH',
      body: JSON.stringify({
        documentIds: docIds,
        mode: 'remove'
      }),
      headers: {
          Authorization: `Bearer ${access}`,
          "Content-Type": "application/json"
        },
    }); 

      if (!res.ok) {
      if (res.status === 401)
          throw new AuthError('Authentication fail.')
      throw new Error('Remove documents from a group fail.');
      }

      const content = await res.json();
      return content;
  } catch (error) {
      throw error; 
  }
}

export async function getGroupFromDocument(docId: number) {
  const access = await getAccess();

  try {
    const res = await fetch(`${process.env.BACKEND_URL}/group/groups/by-document/${docId}/`, {
      method: 'GET',
      headers: {
          Authorization: `Bearer ${access}`
        },
    }); 

      if (!res.ok) {
      if (res.status === 401)
          throw new AuthError('Authentication fail.')
      throw new Error('Get a group from a document fail.');
      }

      const content = await res.json();
      return content;
  } catch (error) {
      throw error; 
  }
}

export async function getUntilted() {
  const access = await getAccess();

  try {
    const res = await fetch(`${process.env.BACKEND_URL}/group/groups/by-name/Untitled/`, {
      method: 'GET',
      headers: {
          Authorization: `Bearer ${access}`
        },
    }); 

      if (!res.ok) {
      if (res.status === 401)
          throw new AuthError('Authentication fail.')
      throw new Error('Get Untitled group fail.');
      }
      const content = await res.json();
      return content;
  } catch (error) {
      throw error; 
  }
}