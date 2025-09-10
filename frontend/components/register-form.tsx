'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, ControllerRenderProps } from "react-hook-form";
import { z } from "zod";
import { format } from 'date-fns';

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
  return (
    <div className="h-full w-full flex flex-col justify-start items-center mt-4">
      <NormalUserForm ispData={ispData} />
    </div>
  )
}

function NormalUserForm({ ispData }: { ispData: Isp[] }) {
  const [userType, setUserType]= useState('user');
  const [isp, setIsp] = useState("");
  const [date, setDate] = useState<Date>();
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
    givenName: z.string().min(2, {
      message: "ชื่อผู้ใช้งานน้อยกว่า 2 ตัวอักษร",
    }).optional(),
    familyName: z.string().min(2, {
      message: "นามสกุลผู้ใช้งานน้อยกว่า 2 ตัวอักษร",
    }).optional(),
  }).refine((data: TheUser) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "รหัสผ่านไม่ตรงกัน",
  });

  const defaultValues = {
      username: "",
      password: "",
      confirmPassword: "",
      email: "",
      givenName: "",
      familyName: ""
  };

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    shouldUnregister: true,
    defaultValues
  })

  useEffect(() => {
    form.reset();
    setIsp('');
  }, [userType]);

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    const username = values.username && values.username != ''? values.username: undefined;
    const givenName = values.givenName && values.givenName != ''? values.givenName: undefined;
    const familyName = values.familyName && values.familyName != ''? values.familyName: undefined;
    const email = values.email && values.email != ''? values.email: undefined;
    const isStaff = userType === 'user'? false: true;
    const thaiid = isStaff;
    const ispId = (isp != "" && userType === 'user')? parseInt(isp): undefined;
    const birthdate = date? format(date, 'yyyy-MM-dd'): undefined;
    const extendedValues  = {
      username,
      givenName: isStaff? givenName: undefined,
      familyName: isStaff? familyName: undefined,
      password: values.password,
      email,
      ispId,
      isStaff,
      thaiid,
      birthdate: isStaff? birthdate: undefined
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
        <RadioGroup className="flex justify-center gap-x-2" value={userType} onValueChange={(value) => {
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
          {userType !== 'user' && <FormField
            control={form.control}
            name="givenName"
            render={({ field }: { field:  ControllerRenderProps<z.infer<typeof FormSchema>, "givenName">}) => (
              <FormItem>
                <FormLabel>ชื่อ</FormLabel>
                <FormControl>
                  <Input placeholder="ชื่อ..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />}
          {userType !== 'user' && <FormField
            control={form.control}
            name="familyName"
            render={({ field }: { field:  ControllerRenderProps<z.infer<typeof FormSchema>, "familyName">}) => (
              <FormItem>
                <FormLabel>สกุล</FormLabel>
                <FormControl>
                  <Input placeholder="สกุล..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />}
          {userType !== 'user' && <div className="flex flex-col justify-between items-start">
              <FormLabel className="inline-flex items-center gap-0.5">
                  เกิดวันที่<span className="text-red-400">*</span>
              </FormLabel>
              <ThaiDateYearPicker date={date} setDate={setDate}/>
          </div>}
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
