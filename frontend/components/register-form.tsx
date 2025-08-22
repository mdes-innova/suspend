'use client';

import { zodResolver } from "@hookform/resolvers/zod";
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

import { useState } from "react";
import { PasswordInput } from "./password-input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { isAuthError } from '@/components/exceptions/auth';
import { registerUser } from "./actions/user";
import { type Isp } from "@/lib/types";
import { RedirectToLogin } from "./reload-page";
import { useEffect } from 'react';
import { useAppDispatch } from "./store/hooks";
import { ALERTUI, openModal } from "./store/features/alert-ui-slice";

type TheUser = {
  username: string,
  password: string,
  confirmPassword: string
}


export default function RegisterForm({ ispData }: { ispData: Isp[] }) {

  const [userType, setUserType]= useState('user');
  const [isp, setIsp] = useState("");
  const dispatch = useAppDispatch(); 

  const UserFormSchema = z.object({
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

  const StaffFormSchema = z.object({
    username: z.string().min(2, {
      message: "ชื่อผู้ใช้งานน้อยกว่า 2 ตัวอักษร",
    }),
    password: z.string().min(6, {
      message: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร",
    }),
    confirmPassword: z.string(),
  }).refine((data: TheUser) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "รหัสผ่านไม่ตรงกัน",
  });

  const FormSchema = z.union([UserFormSchema, StaffFormSchema]);
  type FormValues = z.infer<typeof FormSchema>;

  const userDefaults = {
      username: "",
      password: "",
      confirmPassword: "",
      email: ""
  };

  const staffDefaults = {
      username: "",
      password: "",
      confirmPassword: "",
  }
  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: userType === 'user'? staffDefaults : userDefaults,
  });

  useEffect(() => {
    form.reset(userType === 'user'? staffDefaults : userDefaults as FormValues);
    setIsp('');
  }, [userType]);

  const onSubmit = async (values: FormValues) => {
    const email = 'email' in values ? values.email : undefined;
    const extendedValues  = {
      username: values.username,
      password: values.password,
      email,
      ispId: (isp != "" && userType === 'user')? parseInt(isp): undefined,
      isStaff: userType === 'user'? false: true
    }

    // if (isp != "")
    //   extendedValues['ispId'] = parseInt(isp);

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

  return (
    <div className="h-full w-full flex flex-col justify-center items-center">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
          <FormField
            control={form.control}
            name="username"
            render={({ field }: { field:  ControllerRenderProps<z.infer<typeof FormSchema>, "username">}) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="Username" {...field} />
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
                <FormLabel>Password</FormLabel>
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
                <FormLabel>Confirm password</FormLabel>
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
            <RadioGroup value={userType} onValueChange={(value) => {
                setUserType(value);
              }}>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="user" id="r1" />
                    <Label htmlFor="r1">User (ISP)</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="staff" id="r2" />
                    <Label htmlFor="r2">Staff</Label>
                </div>
            </RadioGroup>
            {
              userType === "user" &&
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
            }
             {
              userType === "user" &&
              <div>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }: { field:  ControllerRenderProps<z.infer<typeof FormSchema>, "email">}) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
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
            }
          <Button type="submit">Register</Button>
        </form>
      </Form>
    </div>
  )
}
