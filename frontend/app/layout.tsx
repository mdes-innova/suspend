import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_Thai } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"
import DefaultBar from "@/components/default-bar";
import Providers from './providers';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Toaster } from "@/components/ui/sonner"
import { type User } from "@/lib/types";
import { CustomTrigger } from "@/components/sidebar-trigger";
import { getProfile } from "@/components/actions/user";
import DialogLoading from "@/components/loading/dialog";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


const notoThai = Noto_Sans_Thai({
  subsets: ['thai'],  // include Thai glyphs
  weight: ['400', '700'], // choose available font weights
  variable: '--font-noto-thai', // optional CSS variable
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Suspend",
  description: "ระบบระงับการเผยแพร่ซึ่งข้อมูลคอมพิวเตอร์ที่มีความผิดตาม พ.ร.บ. คอมพิวเตอร์",
  openGraph: {
    title: "Suspense",
    description: "Open Graph description",
    url: `${process.env.NEXT_PUBLIC_FRONTEND}`,
    siteName: "Suspend",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let user: User | null = null;
  try {
    const resJson = await getProfile();
    user = resJson;
    if (user && resJson.isp) user['isp'] = resJson.isp.name;
  } catch (_) {
    user = null;
  }

  return (
    // <html lang="en" suppressHydrationWarning>
      <html lang="th" className={notoThai.className} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false} // Disable system theme detection
        forcedTheme="light" // Force the theme to always be light
        disableTransitionOnChange
      >
          <div className="w-full min-h-full relative">
              <Providers>
                <SidebarProvider>
                  <AppSidebar />
                {/* <SidebarProvider> */}
                  <DefaultBar user={user ?? null}>
                    <div className="absolute top-0 left-0 w-24 h-24">
                      <CustomTrigger />
                    </div>
                    <DialogLoading />
                    {children}
                  </DefaultBar>
                </SidebarProvider>
                {/* </SidebarProvider> */}
              </Providers>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
