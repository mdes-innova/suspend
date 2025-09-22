import LoginForm from "@/components/login-form";
import Image from 'next/image';
import { Suspense } from 'react';
import logo from "@/public/images/de.png";

async function LoginComponent() {
  let loginOptions = 'normal';
  try {
    const url = process.env.NODE_ENV === "development"? process.env.BACKEND_URL_DEV: process.env.BACKEND_URL_PROD;
    const res = await fetch(`${url}/login-options/`); 

    if (!res.ok) {
      if (res.status === 401)
          throw new Error('Login fail.')
      throw new Error('Get login options fail.');
    }

    loginOptions = (await res.json()).loginOptions;

    return (
      <div className='w-full h-full flex flex-col px-2'>
        <LoginForm loginOptions={loginOptions} />
      </div>
    );
  } catch {
      <div className='w-full h-full flex flex-col px-2'>
        <LoginForm loginOptions={loginOptions} />
        {loginOptions === 'thaiid' && <div className="text-destructive">ไม่สามารถเข้าสู่ระบบได้</div>}
      </div>
  }
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <div className="min-h-screen flex flex-col justify-between max-md:gap-y-4 relative w-full max-sm:justify-center">
        <div className="block w-full h-16 bg-[#34c6b7] max-sm:hidden"></div>
        <div className="flex items-center justify-center bg-background
          w-full max-md:flex max-md:flex-col max-md:gap-y-6">
          <div className="flex-1 flex flex-col justify-center items-center h-full">
            <div className="w-[560px] h-[500px] relative max-lg:w-[360px] max-lg:h-[360px]
            max-sm:w-[280px] max-sm:h-[280px]
            ">
              <Image 
                src={logo}
                alt="Home logo"
                fill
                className="object-contain"
                sizes="100vw"
                priority
            />
            </div>
            {/* <div className="text-3xl max-lg:text-xl">กระทรวงดิจิทัลเพื่อเศรษฐกิจและสังคม</div>
            <div className="text-3xl max-lg:text-xl">Ministry of Digital Economy and Society</div> */}
          </div>
          <div className="flex-1 flex flex-col h-full justify-center items-center">
            <div className="flex flex-col w-[420px] gap-y-4 max-sm:w-[300px]">
              <div className="flex justify-between items-center w-full gap-x-4 max-sm:gap-x-1">
                {/* <svg width="120" height="4" xmlns="http://www.w3.org/2000/svg">
                  <line x1="0" y1="2" x2="100%" y2="2" stroke="#34c6b7" strokeWidth="6" />
                </svg> */}
                <hr className="border-t-4 border-[#34c6b7] flex-[1]" />
                <h1 className="text-3xl font-bold text-[#34c6b7] max-sm:text-xl flex-[1] text-center">เข้าสู่ระบบ</h1>
                <hr className="border-t-4 border-[#34c6b7] flex-[1]" />
                {/* <svg width="120" height="4" xmlns="http://www.w3.org/2000/svg">
                  <line x1="0" y1="2" x2="100%" y2="2" stroke="#34c6b7" strokeWidth="6" />
                </svg> */}
              </div>
              <LoginComponent />
            </div>
          </div>
        </div>
        <div className="block w-full h-16 bg-[#34c6b7] max-sm:hidden"></div>
      </div>

    </Suspense>
  );
}
