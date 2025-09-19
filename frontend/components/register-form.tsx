'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, ControllerRenderProps } from "react-hook-form";
import { z } from "zod";
// import { format } from 'date-fns';

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
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
import { useState } from "react";
import { PasswordInput } from "./password-input";
import { isAuthError } from '@/components/exceptions/auth';
import { registerUser } from "./actions/user";
import { type Isp } from "@/lib/types";
import { RedirectToLogin } from "./reload-page";
// import { useEffect } from 'react';
import { useAppDispatch } from "./store/hooks";
import { ALERTUI, openModal } from "./store/features/alert-ui-slice";

type TheUser = {
  username: string,
  password: string,
  confirmPassword: string
}


export default function RegisterForm({ ispData }: { ispData: Isp[] }) {
  return (
    <div className="h-full w-full flex flex-col justify-start items-center mt-4">
      <NormalUserForm ispData={ispData} />
    </div>
  )
}

function NormalUserForm({ ispData }: { ispData: Isp[] }) {
  const [isp, setIsp] = useState("");
  const dispatch = useAppDispatch(); 

  const FormSchema = z.object({
    username: z.string().min(2, {
      message: "ชื่อผู้ใช้งานน้อยกว่า 2 ตัวอักษร",
    }),
    password: z.string().min(6, {
      message: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร",
    }),
    confirmPassword: z.string(),
    email: z.string().email({
      message: "กรุณากรอกอีเมลที่ถูกต้อง",
    }),
  }).refine((data: TheUser) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "รหัสผ่านไม่ตรงกัน",
  });

  const defaultValues = {
      username: "",
      password: "",
      confirmPassword: "",
      email: "",
  };

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    shouldUnregister: true,
    defaultValues
  })

  // useEffect(() => {
  //   form.reset();
  //   setIsp('');
  // }, [userType]);

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    const username = values.username && values.username != ''? values.username: undefined;
    const email = values.email && values.email != ''? values.email: undefined;
    const ispId = isp != ""? parseInt(isp): undefined;
    const extendedValues  = {
      username,
      password: values.password,
      email,
      ispId,
    }
    try {
      await registerUser(extendedValues);
      dispatch(openModal(ALERTUI.successful_register));

    } catch (error) {
      if (isAuthError(error)) {
        RedirectToLogin();
      }
      else {
      dispatch(openModal(ALERTUI.fail_register));
      }
    }
  }
  return(
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
          <FormField
            control={form.control}
            name="username"
            render={({ field }: { field:  ControllerRenderProps<z.infer<typeof FormSchema>, "username">}) => (
              <FormItem>
                <FormLabel>ชื่อผู้ใช้งาน</FormLabel>
                <FormControl>
                  <Input placeholder="ชื่อผู้ใช้งาน..." {...field} />
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
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          /> 
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }: { field:  ControllerRenderProps<z.infer<typeof FormSchema>, "confirmPassword">}) => (
              <FormItem>
                <FormLabel>ยืนยันรหัสผ่าน</FormLabel>
                <FormControl>
                  <PasswordInput
                    placeholder="••••••••"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          /> 
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
              <div>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }: { field:  ControllerRenderProps<z.infer<typeof FormSchema>, "email">}) => (
                    <FormItem>
                      <FormLabel>อีเมล</FormLabel>
                      <FormControl>
                        <Input placeholder="isp@example.com" {...field} onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          field.onChange(e);
                        }}/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
          <Button type="submit">ลงทะเบียน</Button>
        </form>
      </Form>
  );
}
