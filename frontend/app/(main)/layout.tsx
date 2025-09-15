
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Toaster } from "@/components/ui/sonner"
import DialogLoading from "@/components/loading/dialog";
import DefaultBar from "@/components/default-bar";

export default function Layout({children}: { children?: React.ReactNode}) {
    return (
        <>
            <SidebarProvider>
                <AppSidebar />
                <DefaultBar>
                <DialogLoading />
                {children}
                </DefaultBar>
            </SidebarProvider>
            <Toaster />
        </>
    );
}