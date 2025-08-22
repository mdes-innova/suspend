'use client';

import { User } from "@/lib/types";
import { ProfileIspView } from "./profile-view";


export default function ProfileIspsView({ data }: { data: User[] }) {
  return (
    <div className="grid grid-cols-2 w-full">
        {
            data?.map((e, idx) => {
                return (
                    <div key={`user-isp-profile-${idx}`}>
                        <ProfileIspView orgUser={e} isIsps={true}/>
                    </div>
                );
            })
        }
    </div>
  );
}