'use server'
 
import { cookies } from 'next/headers';

export async function getCookie(name: string) {
    const cookieStore = await cookies();
    if (cookieStore.has('access'))
        return cookieStore.get(name)?.value;
    else
        throw Error('No cookie found.')
}