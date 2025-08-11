import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_Thai } from "next/font/google";
import "@/app/globals.css";
import { ThemeProvider } from "@/components/theme-provider"
import Providers from '@/app/providers';

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

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
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
                {children}
              </Providers>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}