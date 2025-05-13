'use client';
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Send } from "lucide-react";
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
} from "@/components/ui/form";

const FormSchema = z.object({
    // username: z.string().min(2, {
    //   message: "Username must be at least 2 characters.",
    // }),
    username: z.string(),
    email: z.string()
})

export function ResetPassword() {
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
        username: "",
        email: "",
        },
    })

    const onSubmit = (e: any) => {
        e.preventDefault();
    }

  return (
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
            <DialogTitle>รีเซ็ตรหัสผ่าน</DialogTitle>
            <DialogDescription>
                รีเซ็ตรหัสผ่านสำหรับ ISP เท่านั้น
            </DialogDescription>
            </DialogHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
                <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                        <Input placeholder="Username" {...field} />
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
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                        <Input placeholder="user@example.com" {...field} />
                        </FormControl>
                        {/* <FormDescription>
                        This is your public display name.
                        </FormDescription> */}
                        <FormMessage />
                    </FormItem>
                    )}
                />
                </form>
            </Form>
            {/* <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                Name
                </Label>
                <Input id="name" value="Pedro Duarte" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">
                Username
                </Label>
                <Input id="username" value="@peduarte" className="col-span-3" />
            </div>
            </div> */}
            <DialogFooter>
            <Button type="submit"><Send /><span>Sent</span></Button>
            </DialogFooter>
        </DialogContent>
  )
}

// import { useAppDispatch, useAppSelector } from '../components/store/hooks';
// import { closeModal } from '../components/store/features/password-reset-ui-slice';
// import { useState } from 'react';
// import { CircleX } from 'lucide-react';

// export default function ResetPassword() {
//     const dispatch = useAppDispatch();
//     const isModalOpen = useAppSelector((state: any) => state.passwordResetUi.modalOpen);

//     const [errorMessage, setErrorMessage] = useState('');

//     const handleSubmit = (e: any) => {
//     }

//     return (
//         <>
//             {isModalOpen && 
//                 <div className="flex flex-col justify-center items-center absolute top-0 left-0 w-full h-full z-30 animate-in fade-in"
//                     onClick={(e: any)=>{
//                         dispatch(closeModal());
//                     }}>
//                     <form onSubmit={handleSubmit} 
//                         className="space-y-1 w-fit p-10 rounded-xl shadow-[4px_8px_16px_rgba(0,0,0,0.6)]
//                             relative bg-background max-md:p-4"
//                             onClick={(e: any)=>{
//                                 e.stopPropagation();
//                             }}>
//                             <div className="absolute top-0 right-0 p-2 cursor-pointer max-md:p-1"
//                                 onClick={(e: any)=> {
//                                     dispatch(closeModal());
//                                 }}
//                             >
//                                 <CircleX size={32} color={"#d3d3d3"} />
//                             </div>
//                         <div className="w-full text-center text-xl font-bold">รีเซ็ตรหัสผ่าน</div>
//                         <div className="flex w-[500px] justify-between max-md:w-[340px] max-md:flex max-md:flex-col">
//                             <label className="flex flex-col justify-center" htmlFor="username">ชื่อผู้ใช้งาน:</label>
//                             <input
//                                 type="text"
//                                 id="username"
//                                 name="username"
//                                 required
//                                 className="mt-1 text-foreground w-96 px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-border
//                                     max-md:w-84"
//                                 placeholder="username"
//                                 onChange={() => {
//                                     setErrorMessage('');
//                                 }}/>
//                         </div>
//                         <div className="flex w-[500px] justify-between max-md:w-[340px] max-md:flex max-md:flex-col">
//                             <label className="flex flex-col justify-center" htmlFor="email">อีเมล:</label>
//                             <input
//                                 type="email"
//                                 id="email"
//                                 name="email"
//                                 required
//                                 className="mt-1 text-foreground w-96 px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-border
//                                     max-md:w-84"
//                                 placeholder="email@example.com"
//                                 onChange={() => {
//                                     setErrorMessage('');
//                                 }}/>
//                         </div>
//                         <div className="flex w-[500px] justify-between max-md:w-[340px]">
//                             <div className="flex flex-col justify-center">หมายเหตุ:</div>
//                             <div className="flex flex-col justify-center font-bold w-96 pl-1">รีเซ็ตรหัสผ่านสำหรับ ISP เท่านั้น</div>
//                         </div>
//                         <div className="flex justify-center w-full">
//                             <button
//                                 type="submit"
//                                 className="w-fit bg-[#34c6b7] text-background font-bold px-6
//                                 py-2 rounded-xl hover:ring hover:ring-border transition duration-300"
//                             >
//                                 ส่ง
//                             </button>
//                         </div>
 
//                     </form> 
//                 </div>
//             }
//         </>
//     );
// }