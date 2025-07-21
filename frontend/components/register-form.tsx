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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { ResetPassword } from "./reset-password";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { PasswordInput } from "./password-input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { AuthError } from "./exceptions/auth";
import { registerUser } from "./actions/user";
import { type UserRegister, type Isp } from "@/lib/types";

const FormSchema = z.object({
  // username: z.string().min(2, {
  //   message: "Username must be at least 2 characters.",
  // }),
  username: z.string(),
  password: z.string(),
  confirmPassword: z.string()
})

export default function RegisterForm({ ispData }: { ispData: Isp }) {

  const [errorMessage, setErrorMessage] = useState('');
  const [userType, setUserType]= useState('user');
  const [success, setSuccess] = useState(false);
  const [isp, setIsp] = useState("")
  const router = useRouter();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: ""
    },
  })

  // function onSubmit(data: z.infer<typeof FormSchema>) {
  //   toast({
  //     title: "You submitted the following values:",
  //     description: (
  //       <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
  //         <code className="text-white">{JSON.stringify(data, null, 2)}</code>
  //       </pre>
  //     ),
  //   })
  // }

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    const extendedValues: UserRegister = {
      username: values.username,
      password: values.password,
      isStaff: userType === 'user'? false: true
    };

    // if (isp != "")
    //   extendedValues['ispId'] = parseInt(isp);

    try {
      await registerUser(extendedValues);
      router.refresh();
      setErrorMessage('');
      setSuccess(true);

    } catch (error) {
      if (error instanceof AuthError)
        router.redirect('/login?path=/register');
      else{
        setSuccess(false);
        setErrorMessage('ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง');
      }
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
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm password</FormLabel>
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
            <RadioGroup value={userType} onValueChange={(value) => setUserType(value)}>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="user" id="r1" />
                    <Label htmlFor="r1">User</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="staff" id="r2" />
                    <Label htmlFor="r2">Staff</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="admin" id="r3" />
                    <Label htmlFor="r3">Admin</Label>
                </div>
            </RadioGroup>
            <div>
                <label htmlFor="isp" className="block text-sm font-medium text-foreground">
                    ISP
                </label>
                <Select
                name="isp-user"
                required
                value={isp}
                onValueChange={(value: string) => {
                  setIsp(value);
                }}
              >
                <SelectTrigger className="w-full" >
                  <SelectValue placeholder="เลือก ISP" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                    <SelectLabel>ISP</SelectLabel>
                    <>
                      {ispData.map((isp: Isp, idx: number) => (<SelectItem  
                          key={`isp-${idx}`} value={`${isp.id}`}> {isp.name}
                          </SelectItem>)
                      )}
                    </>
                    </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          <Button type="submit">Register</Button>
        </form>
      </Form>
      <div className="h-2 block mt-1">
        {errorMessage != '' && !success && <div className="text-destructive">{errorMessage}</div>}
        {errorMessage == '' && success && <div className="text-green-600">ลงทะเบียนสำเร็จ</div>}
      </div>
    </div>
  )
}

// 'use client';

// import { useAppSelector } from '../components/store/hooks';
// import { useRouter } from 'next/navigation';
// import { useEffect, useState } from 'react';
// import axios from 'axios';
// import {RotatingLines} from 'react-loader-spinner';
// import {
//   Select,
//   SelectContent,
//   SelectGroup,
//   SelectItem,
//   SelectLabel,
//   SelectTrigger,
//   SelectValue,
// } from './ui/select';

// export default function RegisterForm() {
//     const user = useAppSelector((state: any) => state.userAuth.user);
//     const [isp, setIsp] = useState('')
//     const router = useRouter();
//     const [errorMessage, setErrorMessage] = useState('');
//     const [success, setSuccess] = useState(false);
//     const [registerLoading, setRegisterLoading] = useState(false);

//     if (user && (!user?.isStaff || !user.isActive))
//         router.back();

//     async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
//         event.preventDefault();

//         const formData = new FormData(event.currentTarget);
//         const rawFormData = {
//             username: formData.get('username'),
//             password: formData.get('password'),
//             isp: isp === ''? null: isp
//         };

//         if (rawFormData['password'] != formData.get('confirm-password')) {
//             setRegisterLoading(false);
//             setErrorMessage('รหัสผ่านไม่เหมือนกัน')
//         }

//         try {
//             setRegisterLoading(true);
//             const _ = await axios.post('api/register/', rawFormData,
//                 {withCredentials: true}
//             );
//             setRegisterLoading(false);
//             setErrorMessage('');
//             setSuccess(true);
//         } catch (error) {
//             setRegisterLoading(false);
//             setSuccess(false);
//             setErrorMessage('ลงทะเบียนไม่สำเร็จ');
//         }
//   }


//     return (
//         <div className='w-full h-full flex justify-center items-center'>
//             <form onSubmit={handleSubmit} className="space-y-5 w-[700px] p-10 rounded-xl shadow-[4px_8px_16px_rgba(0,0,0,0.6)]">
//                 <div>
//                 <label htmlFor="username" className="block text-sm font-medium text-foreground">
//                     ชื่อผู้ใช้งาน
//                 </label>
//                 <input
//                     type="text"
//                     id="username"
//                     name="username"
//                     required
//                     className="mt-1 text-foreground w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-border"
//                     placeholder="username"
//                     onChange={() => {
//                         setErrorMessage('');
//                         setSuccess(false);
//                     }}
//                 />
//                 </div>

//                 <div>
//                     <label htmlFor="password" className="block text-sm font-medium text-foreground">
//                         รหัสผ่าน
//                     </label>
//                     <input
//                         type="password"
//                         name="password"
//                         id="password"
//                         required
//                         className="mt-1 text-foreground w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-border"
//                         placeholder="••••••••"
//                         onChange={() => {
//                             setErrorMessage('');
//                             setSuccess(false);
//                         }}
//                     />
//                 </div>
//                 <div>
//                     <label htmlFor="confirm-password" className="block text-sm font-medium text-foreground">
//                         ยืนยันรหัสผ่าน
//                     </label>
//                     <input
//                         type="password"
//                         name="confirm-password"
//                         id="confirm-password"
//                         required
//                         className="mt-1 text-foreground w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-border"
//                         placeholder="••••••••"
//                         onChange={() => {
//                             setErrorMessage('');
//                             setSuccess(false);
//                         }}
//                     />
//                 </div>
//                 <div>
//                     <label htmlFor="isp" className="block text-sm font-medium text-foreground">
//                         ISP
//                     </label>
//                     <Select
//                         name="isp"
//                         required
//                         value={isp} onValueChange={(val) => setIsp(val)}
//                     >
//                         <SelectTrigger className="w-[180px]">
//                         <SelectValue placeholder="Select a ISP" />
//                         </SelectTrigger>
//                         <SelectContent>
//                             <SelectGroup>
//                             <SelectLabel>ISP</SelectLabel>
//                             <SelectItem value="apple">Apple</SelectItem>
//                             <SelectItem value="banana">Banana</SelectItem>
//                             <SelectItem value="blueberry">Blueberry</SelectItem>
//                             <SelectItem value="grapes">Grapes</SelectItem>
//                             <SelectItem value="pineapple">Pineapple</SelectItem>
//                             </SelectGroup>
//                         </SelectContent>
//                     </Select>
//                 </div>

//                 <div>
//                 <button
//                     type="submit"
//                     className="w-full bg-[#34c6b7] text-background font-bold h-12 relative items-center
//                     py-2 rounded-xl hover:ring hover:ring-border transition duration-300 flex justify-center"
//                 >
//                 {!registerLoading &&
//                     <div>
//                         ลงทะเบียน
//                     </div>
//                 }
//                 {registerLoading &&
//                     <RotatingLines 
//                     visible={true}
//                     width="40"
//                     strokeColor="#FFFFFF"
//                     strokeWidth="5"
//                     animationDuration="0.75"
//                     />
//                 }
//                 </button>
//                 </div>
//                 {errorMessage != '' && !success && <div className="text-destructive">{errorMessage}</div>}
//                 {errorMessage == '' && success && <div className="text-green-600">ลงทะเบียนสำเร็จ</div>}
//             </form>
//         </div>
//     );
// }