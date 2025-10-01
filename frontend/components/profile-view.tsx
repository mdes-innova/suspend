'use client';

import { type User } from "@/lib/types";
import { useState, useRef, useEffect } from "react";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input";
import { PasswordInput } from "./password-input";
import { isAuthError } from "./exceptions/auth";
import { RedirectToLogin } from "./reload-page";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { RootState } from "./store";
import { updateUser } from "./actions/user";
import { setUser } from "./store/features/user-auth-slice";
import Link from 'next/link';


export default function ProfileView() {
  const [openEdit, setOpenEdit] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const dispatch = useAppDispatch();
  const user: User | null = useAppSelector((state: RootState) => state.userAuth.user)
  const submitRef = useRef<HTMLButtonElement>(null);

  const formSchema = z.object({
    newUsername: z.string(),
    newPassword: z.string(),
    newEmail: z.string()
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newUsername: "",
      newPassword: "",
      newEmail: ""
    },
  })

  const onSubmit = async(values: z.infer<typeof formSchema>) => {
    try {
      if (values.newUsername === '' && values.newPassword === '' && values.newEmail === ''){
        throw new Error("กรุณาใส่ข้อมูลที่ท่านต้องการแก้ไข");
      }
      if (user && typeof user?.id === 'number') {
        const updatedUser = await updateUser({
          userId: user.id,
          username: values.newUsername=== ""? undefined: values.newUsername,
          password: values.newPassword=== ""? undefined: values.newPassword,
          email: values.newEmail=== ""? undefined: values.newEmail
        });

        dispatch(setUser(updatedUser));
        setErrorMsg('');
        setOpenEdit(false);
      } else{
        throw new Error("ไม่พบผู้ใช้งานที่ต้องการแก้ไข");
      }
    } catch (error) {
      if (isAuthError(error))  
        RedirectToLogin();
      else
        setErrorMsg((error as { message: string}).message);
    }
  }

  return (
    <div className="w-full h-full flex justify-start p-4 pt-10">
      <div className="flex h-40">
        <div className="flex flex-col justify-center items-center">
          <Avatar className="w-40 h-full p-1 max-lg:w-20">
            <AvatarImage src="/images/avatars/user.png" alt="suspend-user-avatar" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <Dialog open={openEdit} onOpenChange={(open) => {
            setErrorMsg('');
            setOpenEdit(open);
          }}>
            <DialogTrigger asChild>
              <Button
                disabled={user?.thaiid?? false}
                className="mt-2 max-w-none w-fit" variant="secondary">Edit</Button>
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
                  name="newUsername"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ชื่อผู้ใช้งาน</FormLabel>
                      <FormControl>
                        <Input placeholder="ชื่อผู้ใช้งาน..." {...field} 
                         onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          setErrorMsg('');
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
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>รหัสผ่าน</FormLabel>
                      <FormControl>
                        <PasswordInput
                          placeholder="••••••••"
                          {...field}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setErrorMsg('');
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
                  name="newEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>อีเมล</FormLabel>
                      <FormControl>
                        <Input placeholder="อีเมล..." {...field}
                         onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          setErrorMsg('');
                          field.onChange(e)
                        }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <p className="h-4 text-red-600">{errorMsg}</p>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">ยกเลิก</Button>
                  </DialogClose>
                    <Button onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                      e.preventDefault();
                      if (submitRef?.current) {
                        setErrorMsg('');
                        submitRef?.current?.click()
                      }
                    }}>บันทึก</Button>
                </DialogFooter>
              </DialogContent>
              <Button type="submit" ref={submitRef} className="hidden">บันทึก</Button>
            </form>
          </Form>
          </Dialog>
        </div>
        <div className="flex flex-col justify-center items-start gap-y-1 px-4">
          <Label className="text-2xl font-bold">
            {user?.thaiid? `${user?.givenName} ${user?.familyName}`: user?.username?? ''}
            </Label>
          <Label>{!user? '': user?.isSuperuser? 'Admin' : user?.isStaff? 'Staff': 'ISP'}</Label>
          <Label className="mt-2 italic">{user?.email?? ''}</Label>
        </div>
      </div>
    </div>
  );
}

export function ProfileIspView({ orgUser, isIsps = false }:
  { orgUser: User, isIsps?: boolean}) {
  const [openEdit, setOpenEdit] = useState(false);
  const submitRef = useRef<HTMLButtonElement>(null);
  const me: User | null = useAppSelector((state: RootState) => state.userAuth.user)
  const [user, setUser] = useState<User | null>(orgUser);
  const [errorMsg, setErrorMsg] = useState('');

  const formSchema = z.object({
    newUsername: z.string(),
    newPassword: z.string(),
    newEmail: z.string()
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newUsername: "",
      newPassword: "",
      newEmail: ""
    },
  })

  const onSubmit = async(values: z.infer<typeof formSchema>) => {
    try {
      if (values.newUsername === '' && values.newPassword === '' && values.newEmail === ''){
        throw new Error("กรุณาใส่ข้อมูลที่ท่านต้องการแก้ไข");
      }
      
      if (user && typeof user?.id === 'number') {
        const updatedUser = await updateUser({
          userId: user.id,
          username: values.newUsername === ''? undefined: values.newUsername,
          password: values.newPassword === ''? undefined: values.newPassword,
          email: values.newEmail === ''? undefined: values.newEmail
        });

        setUser(updatedUser);
        setOpenEdit(false);
      } else {
        throw new Error("ไม่พบผู้ใช้งาน ISP ที่ต้องการแก้ไข");
      }
    } catch (error) {
      if (isAuthError(error))  
        RedirectToLogin();
      else 
        setErrorMsg((error as { message: string}).message);
    }
  }

  return (
    <div className="w-full h-full flex justify-start p-4 pt-10">
      <div className="flex h-40 max-lg:h-32">
        <div className="flex flex-col justify-center items-center">
          <Avatar className="w-40 h-full p-1 max-lg:w-32">
            <AvatarImage src="/images/avatars/user.png" alt="suspend-user-avatar" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          {
            me && me?.isSuperuser &&
            <Dialog open={openEdit} onOpenChange={(open) => {
              setErrorMsg('');
              setOpenEdit(open);
            }}>
              <DialogTrigger asChild>
                <Button disabled={user?.thaiid?? false}
                className="mt-2 max-w-none w-fit" variant="secondary">Edit</Button>
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
                    name="newUsername"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ชื่อผู้ใช้งาน</FormLabel>
                        <FormControl>
                          <Input placeholder="ชื่อผู้ใช้งาน..." {...field} 
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              setErrorMsg('');
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
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>รหัสผ่าน</FormLabel>
                        <FormControl>
                          <PasswordInput
                            placeholder="••••••••"
                            {...field}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              setErrorMsg('');
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
                    name="newEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>อีเมล</FormLabel>
                        <FormControl>
                          <Input placeholder="อีเมล..." {...field}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setErrorMsg('');
                            field.onChange(e)
                          }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <p className="h-4 text-red-600">{errorMsg}</p>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">ยกเลิก</Button>
                    </DialogClose>
                      <Button onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.preventDefault();
                        if (submitRef?.current) {
                          setErrorMsg('');
                          submitRef?.current?.click()
                        }
                      }}>บันทึก</Button>
                  </DialogFooter>
                </DialogContent>
                <Button type="submit" ref={submitRef} className="hidden">บันทึก</Button>
              </form>
            </Form>
            </Dialog>
          }
        </div>
        <div className="flex flex-col justify-center items-start gap-y-1 px-4">
          {
            isIsps?
            <Link className="text-2xl font-bold hover:underline"
              href={`/profile-view/isp/${user?.id}/user`}
              >
                {user?.thaiid? `${user?.givenName} ${user?.familyName}`: user?.username?? ''}
              </Link>:
            <Label className="text-2xl font-bold">
                {user?.thaiid? `${user?.givenName} ${user?.familyName}`: user?.username?? ''}
            </Label>
          }
          {isIsps? <></>:<Label>{!user? '': user?.isp?.name?? ''}</Label>}
          <Label className="mt-2 italic">{user?.email?? ''}</Label>
        </div>
      </div>
    </div>
  );
}

export function ProfileUserView({user}: {user?: User}) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const me: User | null = useAppSelector((state: RootState) => state.userAuth.user);
  useEffect(() => {
    if (user) setCurrentUser(user);
    else setCurrentUser(me);
  }, []);

  if (!currentUser) return <></>;
  return (
    <div className="w-full h-full flex justify-start p-4 pt-10">
      <div className="flex h-40 max-lg:h-32">
        <div className="flex flex-col justify-center items-center">
          <Avatar className="w-40 h-full p-1 max-lg:w-32">
            <AvatarImage src="/images/avatars/user.png" alt="suspend-user-avatar" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </div>
        <div className="flex flex-col justify-center items-start gap-y-1 px-4">
          <Label className="text-2xl font-bold">
              {currentUser?.thaiid? `${currentUser?.givenName} ${currentUser?.familyName}`: currentUser?.username?? ''}
          </Label>
          <Label>{currentUser?.isp? currentUser?.isp?.name: 'พนักงาน'}</Label>
          <Label className="mt-2 italic">{currentUser?.email?? ''}</Label>
          {currentUser?.phone? <Label className="mt-2 italic">โทร {currentUser?.phone?? ''}</Label>: <></>}
        </div>
      </div>
    </div>
  );
}