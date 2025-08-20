'use client';

import { useSidebar } from "@/components/ui/sidebar";
import { Button } from "./ui/button";
import Image from 'next/image';
import logo from "@/public/images/logo.png";

export function CustomTrigger() {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      onClick={toggleSidebar}
      className="h-12 w-12 text-lg  max-md:p-0 max-md:m-0"
      variant="outline"
      id="app-bar-trigger"
    >
      <div className="max-md:hidden">☰</div>
      <div className="relative h-full w-full min-md:hidden">
        <Image 
          src={logo}
          alt="Button Image" 
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
      </div>
    </Button>
  );
}