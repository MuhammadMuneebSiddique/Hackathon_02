import { Suspense } from 'react';
import LoginClient from './LoginClient';

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="w-screen h-screen flex items-center justify-center bg-[#3f3f3f] text-[2.5vw] mobile:text-[1.6vw] sm:text-[1.4vw]  md:text-[1.2vw] lg:text-[1vw]">
        <div className="bg-white rounded-[1em] p-[2em] items-center gap-[2em] w-[85vw] max-w-400 shadow-xl">
          <div className="flex flex-col justify-center">
            <h1 className="text-[2em] font-semibold mb-[1em] text-left">Sign In</h1>
            <div className="text-center py-[2vw] text-gray-500">Loading...</div>
          </div>
        </div>
      </div>
    }>
      <LoginClient />
    </Suspense>
  );
}