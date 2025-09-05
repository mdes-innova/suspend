'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import Image from 'next/image';
import Link from 'next/link';
import { useForm, ControllerRenderProps } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { PasswordInput } from "./password-input";
import { useSearchParams } from "next/navigation";
import { getProfile, loginUser } from "./actions/user";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { setUser } from "./store/features/user-auth-slice";
import { RootState } from "./store";
import { useRouter } from 'next/navigation';


const FormSchema = z.object({
  username: z.string(),
  password: z.string()
})

export default function LoginForm({ loginOptions }: { loginOptions: string }) {

  const params = useSearchParams();
  const [errorMessage, setErrorMessage] = useState('');
  const dispatch = useAppDispatch();
  const user = useAppSelector((state: RootState) => state.userAuth.user);
  const router = useRouter();

  useEffect(() => {
    const getData = async() => {
      try {
        const checkUser = await getProfile();
        dispatch(setUser(checkUser));
      } catch {
      }
    }

    if (!user)
      getData();
  }, []);

  useEffect(() => {
    if (user && window) {
      router.replace(params.get('pathname')?? '/');
    }
  }, [user]);


  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  })


  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    try {
      const logedinUser = await loginUser({
        ...values
      });
      dispatch(setUser(logedinUser));

    } catch (error) {
      console.error(error);
      setErrorMessage('ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง');
    }
  }

  return (
    <div className="h-full w-full flex flex-col justify-center items-center">
      <Form {...form} className={`${loginOptions === 'normal' ? '': 'w-full'}`}>
        <form onSubmit={form.handleSubmit(onSubmit)} className={`w-2/3 space-y-6 ${loginOptions === 'normal' ? '': 'space-y-0 w-full'}`}>
        { loginOptions === 'normal' &&
          <>
          <FormField
            control={form.control}
            name="username"
            render={({ field }: { field:  ControllerRenderProps<z.infer<typeof FormSchema>, "username">}) => (
              <FormItem>
                <FormLabel>ชื่อผู้ใช้งาน</FormLabel>
                <FormControl>
                  <Input placeholder="Username" {...field} onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setErrorMessage('');
                    field.onChange(e);
                  }}/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }: { field:  ControllerRenderProps<z.infer<typeof FormSchema>, "password">}) => (
              <FormItem>
                <FormLabel>รหัสผ่าน</FormLabel>
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
          /></>} 
          <div className="flex flex-col justify-center items-center w-full ">
            {loginOptions === 'normal' && <Button type="submit">เข้าสู่ระบบ</Button>}
            {loginOptions === 'thaiid' && <Link className="w-full" href={`/thaiid/?pathname=${params.get('pathname')?? '%2F'}`}>
              <Button variant='outline' className="flex justify-center items-center w-full">
                <div className="text-xl">
                  เข้าสู่ระบบด้วย
                </div>
                <div className="h-6 w-20 relative">
                  <Image
                    src='/images/thaid_logo.png'
                    alt='thaiid'
                    fill
                    className="object-cover"
                    sizes="100vw"
                    priority
                  />
                </div>
              </Button>
            </Link>}
          </div>
        </form>
      </Form>
      <div className="h-2 block mt-1">
        {errorMessage != '' && <div className="text-destructive">{errorMessage}</div>}
      </div>
    </div>
  )
}