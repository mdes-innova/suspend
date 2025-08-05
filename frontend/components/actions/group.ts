'use server';

import { AuthError } from "../exceptions/auth";
import { getAccess } from "./auth";

export async function getGroups() {
  const access = await getAccess();

  try {
    const res = await fetch(`${process.env.NODE_ENV === "development"? process.env.BACKEND_URL_DEV: process.env.process.env.BACKEND_URL_PROD}/group/groups/`, {
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

export async function getGroupList() {
  const access = await getAccess();

  try {
    const res = await fetch(`${process.env.NODE_ENV === "development"? process.env.BACKEND_URL_DEV: process.env.process.env.BACKEND_URL_PROD}/group/groups/group-list/`, {
      method: 'GET',
      headers: {
          Authorization: `Bearer ${access}`
        },
    }); 

      if (!res.ok) {
      if (res.status === 401)
          throw new AuthError('Authentication fail.')
      throw new Error('Get group list fail.');
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
    const res = await fetch(`${process.env.NODE_ENV === "development"? process.env.BACKEND_URL_DEV: process.env.process.env.BACKEND_URL_PROD}/group/groups/${groupId}/`, {
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
    const res = await fetch(`${process.env.NODE_ENV === "development"? process.env.BACKEND_URL_DEV: process.env.process.env.BACKEND_URL_PROD}/group/groups/`, {
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

export async function RemoveGroup(groupId: number) {
  const access = await getAccess();

  try {
    const res = await fetch(`${process.env.NODE_ENV === "development"? process.env.BACKEND_URL_DEV: process.env.process.env.BACKEND_URL_PROD}/group/groups/${groupId}/`, {
      method: 'DELETE',
      headers: {
          Authorization: `Bearer ${access}`
        },
    }); 

      if (!res.ok) {
      if (res.status === 401)
          throw new AuthError('Authentication fail.')
      throw new Error('Remove a group fail.');
      }

      return {data: 'Deleted.'};
  } catch (error) {
      throw error; 
  }
}

export async function addToGroup({ docIds, mode, groupId }: {
    docIds: number[], mode?: string, groupId: number
}) {
  const access = await getAccess();

  try {
    const res = await fetch(`${process.env.NODE_ENV === "development"? process.env.BACKEND_URL_DEV: process.env.process.env.BACKEND_URL_PROD}/group/groups/${groupId}/`, {
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

export async function RenameGroup({ name, groupId }: {
    name: string, groupId: number
}) {
  const access = await getAccess();

  try {
    const res = await fetch(`${process.env.NODE_ENV === "development"? process.env.BACKEND_URL_DEV: process.env.process.env.BACKEND_URL_PROD}/group/groups/${groupId}/`, {
      method: 'PATCH',
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
      throw new Error('Rename a group fail.');
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
    const res = await fetch(`${process.env.NODE_ENV === "development"? process.env.BACKEND_URL_DEV: process.env.process.env.BACKEND_URL_PROD}/group/groups/${groupId}/`, {
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
    const res = await fetch(`${process.env.NODE_ENV === "development"? process.env.BACKEND_URL_DEV: process.env.process.env.BACKEND_URL_PROD}/group/groups/by-document/${docId}/`, {
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
    const res = await fetch(`${process.env.NODE_ENV === "development"? process.env.BACKEND_URL_DEV: process.env.process.env.BACKEND_URL_PROD}/group/groups/by-name/ไม่มีชื่อ/`, {
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

export async function setDocumentNo({
  groupId,
  documentNo
}: {
  groupId: number,
  documentNo: string
}) {
  const access = await getAccess();

  try {
    const url = process.env.NODE_ENV === "development"? process.env.BACKEND_URL_DEV: process.env.process.env.BACKEND_URL_PROD
    const res = await fetch(`${url}/group/groups/${groupId}/`, {
      method: 'PATCH',
      headers: {
          Authorization: `Bearer ${access}`,
          "Content-Type": "application/json"
        },
      body: JSON.stringify({
        documentNo
      })
    }); 

      if (!res.ok) {
      if (res.status === 401)
          throw new AuthError('Authentication fail.')
      throw new Error('Update documentNo for a group fail.');
      }
      const content = await res.json();
      return content;
  } catch (error) {
      throw error; 
  }
}

export async function setDocumentDate({
  groupId,
  documentDate 
}: {
  groupId: number,
  documentDate: string
}) {
  const access = await getAccess();

  try {
    const url = process.env.NODE_ENV === "development"? process.env.BACKEND_URL_DEV: process.env.process.env.BACKEND_URL_PROD
    const res = await fetch(`${url}/group/groups/${groupId}/`, {
      method: 'PATCH',
      headers: {
          Authorization: `Bearer ${access}`,
          "Content-Type": "application/json"
        },
      body: JSON.stringify({
       documentDate 
      })
    }); 

      if (!res.ok) {
      if (res.status === 401)
          throw new AuthError('Authentication fail.')
      throw new Error('Update documentDate for a group fail.');
      }
      const content = await res.json();
      return content;
  } catch (error) {
      throw error; 
  }
}

export async function setDocumentTitle({
  groupId,
  title
}: {
  groupId: number,
  title: string
}) {
  const access = await getAccess();

  try {
    const url = process.env.NODE_ENV === "development"? process.env.BACKEND_URL_DEV: process.env.process.env.BACKEND_URL_PROD
    const res = await fetch(`${url}/group/groups/${groupId}/`, {
      method: 'PATCH',
      headers: {
          Authorization: `Bearer ${access}`,
          "Content-Type": "application/json"
        },
      body: JSON.stringify({
        title
      })
    }); 

      if (!res.ok) {
      if (res.status === 401)
          throw new AuthError('Authentication fail.')
      throw new Error('Update title for a group fail.');
      }
      const content = await res.json();
      return content;
  } catch (error) {
      throw error; 
  }
}

export async function setDocumentSpeed({
  groupId,
  speed
}: {
  groupId: number,
  speed: number
}) {
  const access = await getAccess();

  try {
    const url = process.env.NODE_ENV === "development"? process.env.BACKEND_URL_DEV: process.env.process.env.BACKEND_URL_PROD
    const res = await fetch(`${url}/group/groups/${groupId}/`, {
      method: 'PATCH',
      headers: {
          Authorization: `Bearer ${access}`,
          "Content-Type": "application/json"
        },
      body: JSON.stringify({
        speed
      })
    }); 

      if (!res.ok) {
      if (res.status === 401)
          throw new AuthError('Authentication fail.')
      throw new Error('Update speed for a group fail.');
      }
      const content = await res.json();
      return content;
  } catch (error) {
      throw error; 
  }
}
export async function setDocumentSecret({
  groupId,
  secret
}: {
  groupId: number,
  secret: number
}) {
  const access = await getAccess();

  try {
    const url = process.env.NODE_ENV === "development"? process.env.BACKEND_URL_DEV: process.env.process.env.BACKEND_URL_PROD
    const res = await fetch(`${url}/group/groups/${groupId}/`, {
      method: 'PATCH',
      headers: {
          Authorization: `Bearer ${access}`,
          "Content-Type": "application/json"
        },
      body: JSON.stringify({
        secret
      })
    }); 

      if (!res.ok) {
      if (res.status === 401)
          throw new AuthError('Authentication fail.')
      throw new Error('Update secret for a group fail.');
      }
      const content = await res.json();
      return content;
  } catch (error) {
      throw error; 
  }
}