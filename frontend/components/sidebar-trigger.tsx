'use client';

import { useSidebar } from "@/components/ui/sidebar"
import { Button } from "./ui/button";

export function CustomTrigger() {
  const { toggleSidebar } = useSidebar()

  return <Button onClick={toggleSidebar} className="h-12 w-12 text-lg" variant="outline">
    ☰
  </Button>
}