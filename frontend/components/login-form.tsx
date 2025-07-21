'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogTrigger
} from '@/components/ui/dialog';
import { ResetPassword } from "./reset-password";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { PasswordInput } from "./password-input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useSearchParams } from "next/navigation";
import { usePathname } from "next/navigation";
import { loginUser } from "./actions/user";


const FormSchema = z.object({
  // username: z.string().min(2, {
  //   message: "Username must be at least 2 characters.",
  // }),
  username: z.string(),
  password: z.string()
})

export default function LoginForm() {

  const params = useSearchParams();
  const pathname = usePathname();
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
  }, []);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  })


  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    try {
      // const res = await fetch('api/auth/login/', 
      //   {
      //     method: 'POST',
      //     body: JSON.stringify(
      //       {
      //         ...values
      //       }
      //     ),
      //     credentials: 'include'
      //   }
      // );
      await loginUser({
        ...values
      });

      router.push(params.get('pathname')?? '/');
      router.refresh();
    } catch (error) {
      setErrorMessage('ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง');
    }
  }

  return (
    <div className="h-full w-full flex flex-col justify-center items-center">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="Username" {...field} onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setErrorMessage('');
                    field.onChange(e);
                  }}/>
                </FormControl>
                {/* <FormDescription>
                  This is your public display name.
                </FormDescription> */}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <PasswordInput
                    placeholder="••••••••"
                    {...field}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setErrorMessage('')
                      field.onChange(e)
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          /> 
          <Dialog>
            <DialogTrigger asChild>
              <Label className="underline cursor-pointer">รีเซ็ตรหัสผ่าน</Label>
            </DialogTrigger>
            <ResetPassword />
          </Dialog>
          <Button type="submit">Login</Button>
        </form>
      </Form>
      <div className="h-2 block mt-1">
        {errorMessage != '' && <div className="text-destructive">{errorMessage}</div>}
      </div>
    </div>
  )
}


// import { useState, useEffect } from 'react';
// import axios from 'axios';
// import { useRouter } from 'next/navigation';
// import { useAppDispatch } from '../components/store/hooks';
// import { openModal } from '../components/store/features/password-reset-ui-slice';
// import { setUser } from '../components/store/features/user-auth-slice';
// import {RotatingLines} from 'react-loader-spinner';

// export default function LoginPage() {
//   const dispatch = useAppDispatch();

//   const router = useRouter();
//   const [errorMessage, setErrorMessage] = useState('');
//   const [loginLoading, setLoginLoading] = useState(false);

//   useEffect(() => {
//     dispatch(setUser(null));
//   }, []);

//   async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
//     event.preventDefault();

//     const formData = new FormData(event.currentTarget);
//     const rawFormData = {
//       username: formData.get('username'),
//       password: formData.get('password'),
//     };

//     try {
//       setLoginLoading(true);
//       const _ = await axios.post('api/auth/login/', rawFormData,
//         {
//           withCredentials: true
//         }
//       );
//         router.push('/');
//         router.refresh();
//     } catch (error) {
//       setLoginLoading(false);
//       setErrorMessage('ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง');
//     }
//   }

//   return (
//     <form onSubmit={handleSubmit} className="space-y-5 w-full p-10 rounded-xl shadow-[4px_8px_16px_rgba(0,0,0,0.6)]">
//         <div>
//         <label htmlFor="username" className="block text-sm font-medium text-foreground">
//             ชื่อผู้ใช้งาน
//         </label>
//         <input
//             type="text"
//             id="username"
//             name="username"
//             required
//             className="mt-1 text-foreground w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-border"
//             placeholder="username"
//             onChange={() => {
//                 setErrorMessage('');
//             }}
//         />
//         </div>

//         <div>
//         <label htmlFor="password" className="block text-sm font-medium text-foreground">
//             รหัสผ่าน
//         </label>
//         <input
//             type="password"
//             name="password"
//             id="password"
//             required
//             className="mt-1 text-foreground w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-border"
//             placeholder="••••••••"
//             onChange={() => {
//                 setErrorMessage('');
//             }}
//         />
//         </div>

//         <div>
//         <button
//             type="submit"
//             className="w-full bg-[#34c6b7] text-background font-bold h-12 relative items-center
//               py-2 rounded-xl hover:ring hover:ring-border transition duration-300 flex justify-center"
//         >
//           {!loginLoading &&
//             <div>
//               เข้าสู่ระบบ
//             </div>
//           }
//           {loginLoading &&
//             <RotatingLines 
//               visible={true}
//               width="40"
//               strokeColor="#FFFFFF"
//               strokeWidth="5"
//               animationDuration="0.75"
//             />
//           }
//         </button>
//         </div>
//         {errorMessage != '' && <div className="text-destructive">{errorMessage}</div>}
//         <p className="cursor-pointer text-[#34c6b7] underline"
//           onClick={(e: any) => {
//             e.preventDefault();
//             dispatch(openModal());
//           }}>รีเซ็ตรหัสผ่าน</p>
//     </form>
//   );
// }
