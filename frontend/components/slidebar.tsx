'use client';

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton
} from "./ui/sidebar"
export default function SlideBar() {
    const projects = [
        {
            url: "#",
            name: "Design Engineering"
        },
        {
            url: "#",
            name: "Sales & Marketing"
        },
        {
            url: "#",
            name: "Travel"
        },
        {
            url: "#",
            name: "Support"
        },
        {
            url: "#",
            name: "Feedback"
        },
    ]
    return (
        <div className="">
            <Sidebar className="mt-36 w-72">
                <SidebarContent>
                    <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                        {projects.map((project) => (
                            <SidebarMenuItem key={project.name}>
                            <SidebarMenuButton asChild>
                                <a href={project.url}>
                                <span>{project.name}</span>
                                </a>
                            </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
            </Sidebar>

        </div>
        );
    }
