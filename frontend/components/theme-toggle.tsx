"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"


export function ThemToggle() {
  const { setTheme, theme } = useTheme()

  return (
      <Button variant="outline" size="icon"
        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
          e.preventDefault();
          if ((theme as string) === 'light') setTheme('dark');
          else setTheme('light');
        }}
      >
      {
        (theme as string) === 'light'?
          <Moon className="absolute h-[1.2rem] w-[1.2rem]" />:
          <Sun className="absolute h-[1.2rem] w-[1.2rem]" />
      }
      </Button>
  )
}
