'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import registerImage from "../../public/R 2.png"
import Image from 'next/image';
import { register as authRegister } from '../../lib/authentication-methods';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

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
    setSuccess('');

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password strength
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);

    try {
      // Use the authentication method from lib/authentication-methods.ts
      await authRegister({
        email: formData.email,
        name: formData.name,
        password: formData.password,
      });

      setSuccess('Account created successfully! Redirecting to login...');

      // Redirect to login after a short delay
      setTimeout(() => {
        router.push('/login');
      }, 200);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen bg-gray-900 flex items-center justify-center text-[3.2vw] mobile:text-[2vw] sm:text-[1.5vw]  md:text-[1.3vw] lg:text-[1vw]">
      {/* Main Card Wrapper */}
      <div className="bg-white rounded-[1em] shadow-xl p-[2em] grid grid-cols-1 md:grid-cols-2 gap-[2em] w-[90vw] md:w-[85vw] max-w-6xl">

        {/* Left Section – Illustration */}
        <div className="hidden md:flex items-center justify-center order-2 md:order-1">
          {/* Replace the src with your preferred illustration URL */}
          <Image
            src={registerImage}
            alt="Signup Illustration"
            className="w-[25vw] max-w-md h-auto"
          />
        </div>

        {/* Right Section – Form */}
        <div className="flex flex-col justify-center order-1 md:order-2">
          {/* Heading */}
          <h1 className="text-center font-semibold text-[1.6em] mb-[1em]">
            Sign Up
          </h1>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Full Name */}
            <div className="flex items-center border-[0.08em] border-gray-300 rounded-[0.5em] p-[0.6em] mb-[0.7em]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-[1.2em] h-[1.2em] mr-[0.6em] text-gray-500 shrink-0"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                />
              </svg>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Full Name"
                className="w-full border-none outline-none text-[1em]"
                required
              />
            </div>

            {/* Email */}
            <div className="flex items-center border-[0.08em] border-gray-300 rounded-[0.5em] p-[0.6em] mb-[0.7em]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-[1.2em] h-[1.2em] mr-[0.6em] text-gray-500 shrink-0"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.678 4.498-7.678-4.498A2.25 2.25 0 0 1 12.896 9.5l7.678 4.498 7.678-4.498a2.25 2.25 0 0 1 1.07-1.916V6.75"
                />
              </svg>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className="w-full border-none outline-none text-[1em]"
                required
              />
            </div>

            {/* Password */}
            <div className="flex items-center border-[0.08em] border-gray-300 rounded-[0.5em] p-[0.6em] mb-[0.7em]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-[1.2em] h-[1.2em] mr-[0.6em] text-gray-500 shrink-0"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25z"
                />
              </svg>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password (min 8 characters)"
                className="w-full border-none outline-none text-[1em]"
                required
              />
            </div>

            {/* Confirm Password */}
            <div className="flex items-center border-[0.08em] border-gray-300 rounded-[0.5em] p-[0.6em] mb-[0.7em]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-[1.2em] h-[1.2em] mr-[0.6em] text-gray-500 shrink-0"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25z"
                />
              </svg>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm Password"
                className="w-full border-none outline-none text-[1em]"
                required
              />
            </div>

            {/* Checkbox */}
            <div className="flex items-center gap-[0.5em] my-[0.8em] text-[0.9em]">
              <input type="checkbox" className="w-[1em] h-[1em]" required />
              <span>I agree to all terms and privacy policy</span>
            </div>

            {/* Register Button */}
            <div className="text-center mt-[0.5em]">
              <button
                type="submit"
                disabled={loading}
                className={`bg-[#ff7a7a] hover:bg-[#ff6666] text-white font-medium rounded-[0.5em] py-[0.7em] px-[2em] w-full text-[1em] cursor-pointer transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Creating Account...' : 'Register'}
              </button>
            </div>
          </form>

          {/* Sign In Link */}
          <div className="text-center text-[0.85em] mt-[1em]">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 font-semibold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
