'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export async function loginAction(formData: FormData) {
//   const email = formData.get('email');
//   const password = formData.get('password');

  // Simulate server-side validation or call your auth service
//   const isValidUser = email === 'test@example.com' && password === 'password123';
    try {
        const response = await axios.post(`http://localhost:8000/api/token/`,
            {
                username: "user@example.com",
                password: "string" 
            }
        );
        const { access, refresh } = response.data;

        console.log(access);
        console.log(refresh);
        // redirect('/');
        
    } catch (error) {
        // throw new Error('Invalid credentials');
    }

//   if (!isValidUser) {
//     throw new Error('Invalid credentials');
//   }

  // Set cookie (example: session token)
//   cookies().set('session', 'fake-session-token', { httpOnly: true });

  // Redirect after login
}