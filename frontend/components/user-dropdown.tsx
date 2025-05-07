'use client';

export default function UserDropdown() {
    const menus = ["ข้อมูลส่วนตัว", "ออกจากระบบ"]
    return (
        <div className="flex flex-col justify-start items-center absolute z-40 px-6
            top-0 -left-36 bg-background space-y-2 rounded-md">
           {
            menus.map((e: string, index: number) => (
                <div className={`cursor-pointer`}
                key={`user-profile-menu-${index}`}>
                        {e}
                </div>
            ))
           } 
        </div>
    );
}