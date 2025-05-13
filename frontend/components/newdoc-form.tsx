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

const FormSchema = z.object({
  // username: z.string().min(2, {
  //   message: "Username must be at least 2 characters.",
  // }),
  name: z.string(),
  kind: z.string(),
  desc: z.string()
})

export default function NewdocForm() {

  const [errorMessage, setErrorMessage] = useState('');
  const [progress, setProgress]= useState('user');
  const router = useRouter();
    const [isp, setIsp] = useState('')

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      kind: "",
      desc: ""
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
    // const rawFormData = {
    //   username: formData.get('username'),
    //   password: formData.get('password'),
    // };

    try {
      // setLoginLoading(true);
      const _ = await axios.post('api/auth/login/', values,
        {
          withCredentials: true
        }
      );
        router.push('/');
        router.refresh();
    } catch (error) {
      // setLoginLoading(false);
      setErrorMessage('ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง');
    }
  }

  return (
    <div className="h-full w-full flex flex-col justify-center items-center">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ชื่อ</FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
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
            name="kind"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ชนิด</FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
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
            name="desc"
            render={({ field }) => (
              <FormItem>
                <FormLabel>คำอธิบาย</FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
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
          <div className="flex justify-start items-start gap-x-6">
            <Label>
                ดำเนินการ
            </Label>
            <RadioGroup value={progress} onValueChange={(value) => setProgress(value)}>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="draft" id="r1" />
                    <Label htmlFor="r1">ฉบับร่าง</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="ready" id="r2" />
                    <Label htmlFor="r2">เสร็จสมบูรณ์</Label>
                </div>
            </RadioGroup>
          </div>
          <Button type="submit">บันทึก</Button>
        </form>
      </Form>
      <div className="h-2 block mt-1">
        {errorMessage != '' && <div className="text-destructive">{errorMessage}</div>}
      </div>
    </div>
  )
}