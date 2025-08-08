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
import { BookCard } from "./court-order/book-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as React from "react"
import { ResetPassword } from "./reset-password";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { PasswordInput } from "./password-input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card } from "./ui/card";
import DatePicker from "./date-picker";


const FormSchema = z.object({
  // username: z.string().min(2, {
  //   message: "Username must be at least 2 characters.",
  // }),
  name: z.string(),
  kind: z.string(),
  desc: z.string()
})

export default function CourtOrders() {

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
        <div className="h-full w-full flex flex-col justify-center items-center px-6 gap-y-4">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4 w-full">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel className="inline-flex items-center gap-0.5">
                                เลขหนังสือ<span className="text-red-400">*</span>
                            </FormLabel>
                            <FormControl>
                            <Input {...field} onChange={(e) => {
                                setErrorMessage('')
                                field.onChange(e)
                            }} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <div className="w-full h-full flex flex-col justify-between items-start">
                        <FormLabel className="inline-flex items-center gap-0.5">
                            วันที่<span className="text-red-400">*</span>
                        </FormLabel>
                        <DatePicker />
                    </div>
                    <FormField
                        control={form.control}
                        name="desc"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel className="inline-flex items-center gap-0.5">
                                เรื่อง<span className="text-red-400">*</span>
                            </FormLabel>
                            <FormControl>
                            <Input {...field} onChange={(e) => {
                                setErrorMessage('')
                                field.onChange(e)
                            }} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="desc"
                        render={({ field }) => (
                        <FormItem>                    
                            <FormLabel className="inline-flex items-center gap-0.5">
                                ชั้นความเร็ว<span className="text-red-400">*</span>
                            </FormLabel>
                            <FormControl>
                            <Input {...field} onChange={(e) => {
                                setErrorMessage('')
                                field.onChange(e)
                            }} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="desc"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel className="inline-flex items-center gap-0.5">
                                ชั้นความลับ<span className="text-red-400">*</span>
                            </FormLabel>
                            <FormControl>
                            <Input {...field} onChange={(e) => {
                                setErrorMessage('')
                                field.onChange(e)
                            }} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </form>
            </Form>
            <BookCard />
            <CourtCard />
        </div>
  )
}