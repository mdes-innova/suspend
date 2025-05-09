import LoginForm from "@/components/login-form";
import ResetPassword from "@/components/reset-password";
import Image from 'next/image';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between max-md:gap-y-4 relative w-full">
      <ResetPassword />
      <div className="block w-full h-16 bg-[#34c6b7]"></div>
      <div className="flex items-center justify-center bg-background
        w-full max-md:flex max-md:flex-col max-md:gap-y-6">
        <div className="flex-1 flex flex-col justify-center items-center h-full">
          <div className="w-[540px] h-[540px] relative max-lg:w-[360px] max-lg:h-[360px]">
            <Image 
              src="/images/logo.png"
              alt="Login logo"
              fill
              className="object-cover"
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
        {/* <div className="w-full max-w-md bg-card p-8 rounded-2xl shadow-lg">
          <h2 className="text-3xl font-bold text-center mb-6 text-foreground">Welcome Back 👋</h2>
          <p className="text-center text-sm text-foreground mt-6">
            Don&apos;t have an account?{' '}
            <a href="/register" className="text-primary hover:underline">
              Sign up
            </a>
          </p>
        </div> */}
      </div>
      <div className="block w-full h-16 bg-[#34c6b7]"></div>
    </div>
  );
}