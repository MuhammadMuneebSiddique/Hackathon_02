'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import loginImage from "@?public/ach3 1.png";
import Image from "next/image";
import { login as authLogin, getSessionData } from '@/lib/authentication-methods';

export default function LoginClient() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginAttempted, setLoginAttempted] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

// Check session status on component mount
useEffect(() => {
  const checkSession = async () => {
    setIsLoading(true);
    const sessionData = await getSessionData();
    setSession(sessionData);
    setIsLoading(false);
  };
  checkSession();
}, []);

  // Get callback URL from query params, default to dashboard
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  // Redirect if already authenticated
  useEffect(() => {
    if (session && !isLoading) {
      router.push(callbackUrl);
    }
  }, [session, isLoading, router, callbackUrl]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setLoginAttempted(true); // Set the flag to indicate a login attempt

    try {
      // Use the authentication method from lib/authentication-methods.ts
      await authLogin({
        email: formData.email,
        password: formData.password,
        rememberMe: false, // We removed the remember me checkbox
      });

      // If login is successful, the user will be redirected by the useEffect
      // since the session will update and trigger the redirect
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      // Stop loading indicator
      setLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-[#3f3f3f] text-[2.5vw] mobile:text-[1.6vw] sm:text-[1.4vw]  md:text-[1.2vw] lg:text-[1vw]">
      <div className="bg-white rounded-[1em] p-[2em]  grid grid-cols-1 md:grid-cols-2 items-center gap-[2em] w-[85vw] max-w-400 shadow-xl">
        {/* Left Section – Login Form */}
        <div className="flex flex-col justify-center">
          {/* Heading */}
          <h1 className="text-[2em] font-semibold mb-[1em] text-left">Sign In</h1>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-3xl">
              {error}
            </div>
          )}

          {/* Email Input */}
          <div className="flex items-center border-[0.08em] border-gray-400 rounded-[0.5em] p-[0.6em] mb-[0.7em]">
            {/* User Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-[1em] h-[1em] text-gray-500 mr-[0.6em] shrink-0"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-8.963-2.975M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className="border-none outline-none w-full text-[1.3em]"
              required
            />
          </div>

          {/* Password Input */}
          <div className="flex items-center border-[0.08em] border-gray-400 rounded-[0.5em] p-[0.6em] mb-[0.7em]">
            {/* Lock Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-[1em] h-[1em] text-gray-500 mr-[0.6em] shrink-0"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className="border-none outline-none w-full text-[1.3em]"
              required
            />
          </div>


          {/* Login Button */}
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className={`bg-[#ff7a7a] text-white border-none rounded-[0.5em] py-[0.7em] px-[1em] text-[1.3em] cursor-pointer w-full hover:bg-[#ff6666] transition ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          {/* Forgot Password and Register Links */}
          <div className="flex flex-col space-y-2 mt-2">
            <Link href="/forgot-password" className="text-blue-600 text-center text-[0.9em] font-medium hover:underline">
              Forgot Password?
            </Link>
            <p className="mt-2 text-[1em] text-center">
              Don't have an account?{' '}
              <Link href="/register" className="text-blue-600 font-medium hover:underline">
                Create One
              </Link>
            </p>
          </div>
        </div>

        {/* Right Section – Illustration */}
        <div className="hidden md:flex items-center justify-center">
          {/* Login Illustration Image - Please replace the src with your actual illustration URL */}
          <Image
            src={loginImage}
            alt="Login Illustration"
            className="w-[45vw] h-auto"
          />
        </div>
      </div>
    </div>
  );
}