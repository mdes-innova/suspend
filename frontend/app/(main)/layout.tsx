
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Toaster } from "@/components/ui/sonner"
import { CustomTrigger } from "@/components/sidebar-trigger";
import DialogLoading from "@/components/loading/dialog";
import DefaultBar from "@/components/default-bar";

export default function Layout({children}: { children?: React.ReactNode}) {
    return (
        <>
            <SidebarProvider>
                <AppSidebar />
                <DefaultBar>
                <div className="absolute top-0 left-0 w-24 h-24">
                    <CustomTrigger />
                </div>
                <DialogLoading />
                {children}
                </DefaultBar>
            </SidebarProvider>
            <Toaster />
        </>
    );
}