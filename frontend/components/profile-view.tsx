'use client';

import { type User } from "@/lib/types";
import { useState, useEffect } from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/playlist-dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input";
import { PasswordInput } from "./password-input";


export default function ProfileView({ profileData }: { profileData: User }) {
  const [userData, setUserData] = useState<User | null>(profileData?? null);

  const formSchema = z.object({
    username: z.string().min(2, {
      message: "ชื่อผู้ใช้งานน้อยกว่า 2 ตัวอักษร",
    }),
    password: z.string().min(6, {
      message: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร",
    }),
    confirmPassword: z.string(),
    email: z.string().email({
      message: "กรุณากรอกอีเมลที่ถูกต้อง",
    })
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
      email: ""
    },
  })

  const onSubmit = async(values: z.infer<typeof formSchema>) => {

  }

  return (
    <div className="w-full h-full flex justify-start p-4 pt-10">
      <div className="flex h-40">
        <div className="flex flex-col justify-center items-center">
          <Avatar className="w-40 h-full p-1">
            <AvatarImage src="/images/avatars/user.png" alt="suspend-user-avatar" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="mt-2 max-w-none w-fit" variant="secondary">Edit</Button>
            </DialogTrigger>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    แก้ไขโปรไฟล์
                  </DialogTitle>
                </DialogHeader>
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ชื่อผู้ใช้งาน</FormLabel>
                      <FormControl>
                        <Input placeholder="ชื่อผู้ใช้งาน..." {...field} />
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
                      <FormLabel>รหัสผ่าน</FormLabel>
                      <FormControl>
                        <PasswordInput
                          placeholder="••••••••"
                          {...field}
                        />
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
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>อีเมล</FormLabel>
                      <FormControl>
                        <Input placeholder="อีเมล..." {...field} />
                      </FormControl>
                      {/* <FormDescription>
                        This is your public display name.
                      </FormDescription> */}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">ยกเลิก</Button>
                  </DialogClose>
                  <Button type="submit">บันทึก</Button>
                </DialogFooter>
              </DialogContent>
            </form>
          </Form>
          </Dialog>
        </div>
        <div className="flex flex-col justify-center items-start gap-y-1 px-4">
          <Label className="text-2xl font-bold">Username</Label>
          <Label>Role</Label>
          <Label className="mt-2 italic">email</Label>
        </div>
      </div>
    </div>
  );
}