'use server';

import { type GroupFile } from "@/lib/types";
import { getAccess } from "./auth";
import { GetFilesFromGroup } from "./group-file";

export async function SendMail({
    groupId, groupFile
}: {
    groupId: number,
    groupFile: GroupFile
}) {
    const access = await getAccess();

    try {
        const res = await fetch(
        `${process.env.NODE_ENV === "development"?
            process.env.BACKEND_URL_DEV: process.env.process.env.BACKEND_URL_PROD}/mail/mails/send/`,
        {
            headers: {
                Authorization: `Bearer ${access}`,
                "Content-Type": "application/json"
            },
            method: "POST",
            body: JSON.stringify({
                groupId,
                groupFileId: groupFile.id,
                isp_id: groupFile.isp?.id
            })
        }
        );

        if (!res.ok) {
        if (res.status === 401)
            throw new AuthError('Authentication fail.');
        throw new Error('Mail failed');
        }

        const mail = await res.json();
        return mail;
    } catch (error) {
        return error;
    }

}

export async function SendMails(groupId: number) {
    const groupFiles = await GetFilesFromGroup(groupId);
    await Promise.all(groupFiles.map(async(groupFile: GroupFile) => {
        await SendMail({
            groupId,
            groupFile
        });
    }));
}