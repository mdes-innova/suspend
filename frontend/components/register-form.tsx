'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, ControllerRenderProps } from "react-hook-form";
import { z } from "zod";
import { format } from 'date-fns';
import Image from 'next/image';

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
import { ThaiDateYearPicker } from "./date-picker";

type TheUser = {
  username: string,
  password: string,
  confirmPassword: string
}


export default function RegisterForm({ ispData }: { ispData: Isp[] }) {
  const [userKind, setUserKind] = useState("normal");

  return (
    <div className="h-full w-full flex flex-col justify-start items-center mt-4">
      <RadioGroup value={userKind} onValueChange={setUserKind} className="flex ">
        <div className="flex items-center gap-3">
          <RadioGroupItem value="normal" id="r1" />
          <Label htmlFor="r1">ปกติ</Label>
        </div>
        <div className="flex items-center gap-3">
          <RadioGroupItem value="thaiid" id="r2" />
          <div className="h-4 w-10 relative">
            <Image
              src='/images/thaid_logo.png'
              alt='thaiid'
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
          </div>
        </div>
    </RadioGroup>
    {
      userKind === 'normal' &&
      <NormalUserForm ispData={ispData} />
    }
    {
      userKind === 'thaiid' &&
      <ThaiIdUserForm />
    }
    </div>
  )
}

function NormalUserForm({ ispData }: { ispData: Isp[] }) {
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
      isStaff: userType === 'user'? false: true,
      thaiid: false,
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
          <Button type="submit">ลงทะเบียน</Button>
        </form>
      </Form>
  );
}

function ThaiIdUserForm() {
  const dispatch = useAppDispatch(); 
  const [date, setDate] = useState<Date>();

  const UserFormSchema = z.object({
    givenName: z.string().min(2, {
      message: "ชื่อผู้ใช้งานน้อยกว่า 2 ตัวอักษร",
    }),
    familyName: z.string().min(2, {
      message: "นามสกุลผู้ใช้งานน้อยกว่า 2 ตัวอักษร",
    }),
  });

 
  type FormValues = z.infer<typeof UserFormSchema>;

  const userDefaults = {
      givenName: "",
      familyName: "",
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(UserFormSchema),
    defaultValues: userDefaults,
  });

  const onSubmit = async (values: FormValues) => {
    try {
      if (!date)
        throw new Error('Birthdate cannot be left empty.');
      const extendedValues  = {
        thaiid: true,
        givenName: values.givenName,
        familyName: values.familyName,
        birthdate: format(date, 'yyyy-MM-dd'),
        isStaff: true
      }
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
            name="givenName"
            render={({ field }: { field:  ControllerRenderProps<z.infer<typeof UserFormSchema>, "givenName">}) => (
              <FormItem>
                <FormLabel>ชื่อ</FormLabel>
                <FormControl>
                  <Input placeholder="ชื่อ..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="familyName"
            render={({ field }: { field:  ControllerRenderProps<z.infer<typeof UserFormSchema>, "familyName">}) => (
              <FormItem>
                <FormLabel>สกุล</FormLabel>
                <FormControl>
                  <Input placeholder="สกุล..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex flex-col justify-between items-start">
              <FormLabel className="inline-flex items-center gap-0.5">
                  เกิดวันที่<span className="text-red-400">*</span>
              </FormLabel>
              <ThaiDateYearPicker date={date} setDate={setDate}/>
          </div>
          <Button type="submit">ลงทะเบียน</Button>
        </form>
      </Form>
  );
}