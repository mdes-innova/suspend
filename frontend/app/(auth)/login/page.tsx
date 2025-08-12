import LoginForm from "@/components/login-form";
import Image from 'next/image';
import { Suspense } from 'react';
import logo from "@/public/images/logo.png";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <div className="min-h-screen flex flex-col justify-between max-md:gap-y-4 relative w-full">
        <div className="block w-full h-16 bg-[#34c6b7]"></div>
        <div className="flex items-center justify-center bg-background
          w-full max-md:flex max-md:flex-col max-md:gap-y-6">
          <div className="flex-1 flex flex-col justify-center items-center h-full">
            <div className="w-[540px] h-[540px] relative max-lg:w-[360px] max-lg:h-[360px]">
              <Image 
                src={logo}
                alt="Home logo"
                fill
                className="object-cover"
                sizes="100vw"
                priority
            />
            </div>
            <div className="text-3xl max-lg:text-xl">กระทรวงดิจิทัลเพื่อเศรษฐกิจและสังคม</div>
            <div className="text-3xl max-lg:text-xl">Ministry of Digital Economy and Society</div>
          </div>
          <div className="flex-1 flex flex-col h-full justify-center items-center">
            <div className="flex flex-col w-[420px] gap-y-4">
              <div className="flex justify-between items-center w-full gap-x-4">
                <svg width="120" height="4" xmlns="http://www.w3.org/2000/svg">
                  <line x1="0" y1="2" x2="100%" y2="2" stroke="#34c6b7" strokeWidth="6" />
                </svg>
                <h1 className="text-3xl font-bold text-[#34c6b7]">เข้าสู่ระบบ</h1>
                <svg width="120" height="4" xmlns="http://www.w3.org/2000/svg">
                  <line x1="0" y1="2" x2="100%" y2="2" stroke="#34c6b7" strokeWidth="6" />
                </svg>
              </div>
              <LoginForm />
            </div>
          </div>
        </div>
        <div className="block w-full h-16 bg-[#34c6b7]"></div>
      </div>

    </Suspense>
  );
}
