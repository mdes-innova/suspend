import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { NextRequest, NextResponse } from "next/server";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function getAccessFromRefresh(refresh: string) {
  try {
    const refreshRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/api/token/refresh/`, {
          method: 'POST',
          body: JSON.stringify(
              {
                  refresh
              }
          )
      },
    );
    if (!refreshRes.ok)
      throw new Error("Invalid refresh token");

    const { access } = await refreshRes.json();
    const response = NextResponse.next();
    response.cookies.set("access", access, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 5, // 5 minutes
    });
    return access;

  } catch (error) {
    throw new Error("Invalid refresh token");
  }
}