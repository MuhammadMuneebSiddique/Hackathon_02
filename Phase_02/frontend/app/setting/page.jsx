'use client';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { getSessionData } from '../../lib/authentication-methods';
import { authClient } from '../../lib/better-auth-client';


export default function AccountInformation() {
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    loading: true
  });

  const [formState, setFormState] = useState({
    firstName: '',
    lastName: '',
    email: '',
    isSubmitting: false,
    submitSuccess: false,
    submitError: ''
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const session = await getSessionData();
        if (session && session.user) {
          const fullName = session.user.name || '';
          const nameParts = fullName.split(' ');
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';

          const userDataObj = {
            firstName: firstName,
            lastName: lastName,
            email: session.user.email || '',
            loading: false
          };

          setUserData(userDataObj);

          // Initialize form state with user data
          setFormState(prev => ({
            ...prev,
            firstName: firstName,
            lastName: lastName,
            email: session.user.email || ''
          }));
        } else {
          setUserData({
            firstName: '',
            lastName: '',
            email: '',
            loading: false
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUserData({
          firstName: '',
          lastName: '',
          email: '',
          loading: false
        });
      }
    };

    fetchUserData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: value,
      submitError: '' // Clear error when user starts typing
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormState(prev => ({ ...prev, isSubmitting: true, submitError: '' }));

    try {
      // Validate input
      if (!formState.firstName.trim()) {
        throw new Error('First name is required');
      }

      if (!formState.email.trim()) {
        throw new Error('Email is required');
      }

      // Prepare data to send
      const updatedData = {
        name: `${formState.firstName} ${formState.lastName}`.trim(),
        email: formState.email
      };

      // Use Better Auth's updateUser method instead of backend API
      const result = await authClient.user.update({
        name: updatedData.name,
        email: updatedData.email
      });

      if (result.error) {
        throw new Error(result.error.message || 'Failed to update profile');
      }

      // Update local state with the new data
      setUserData(prev => ({
        ...prev,
        firstName: formState.firstName,
        lastName: formState.lastName,
        email: formState.email
      }));

      setFormState(prev => ({
        ...prev,
        isSubmitting: false,
        submitSuccess: true,
        submitError: ''
      }));

      // Reset success message after 3 seconds
      setTimeout(() => {
        setFormState(prev => ({ ...prev, submitSuccess: false }));
      }, 3000);

    } catch (error) {
      console.error('Error updating user profile:', error);
      setFormState(prev => ({
        ...prev,
        isSubmitting: false,
        submitError: error.message || 'Failed to update profile. Please try again.'
      }));
    }
  };

  if (userData.loading) {
    return (
      <div className="w-full min-h-screen bg-[#f6f8fb] p-[2em] text-[1vw] flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#f6f8fb] p-[2em] text-[1vw]">
      {/* Main Card Wrapper - centered for better readability on large screens */}
      <div className="max-w-full h-full mx-auto bg-white rounded-[1em] p-[2em] border-[0.08em] border-solid border-[#e5e7eb]">

        {/* Card Header Section */}
        <div className="flex justify-between items-center mb-[1.5em]">
          <div className="flex flex-col">
            <h1 className="text-[1.3em] font-semibold text-[#111827]">Account Information</h1>
            <div className="w-[3em] h-[0.2em] bg-[#ff4d4d] mt-[0.3em]" />
          </div>
          <a href="#" className="text-[0.85em] text-[#6b7280] cursor-pointer hover:underline">
            Go Back
          </a>
        </div>

        {/* User Info Summary Section */}
        <div className="flex items-center gap-[1em] mb-[1.5em]">
          <div className="flex flex-col">
            <div className="text-[1em] font-medium text-[#111827]">{formState.firstName || userData.firstName} {formState.lastName || userData.lastName}</div>
            <div className="text-[0.85em] text-[#6b7280]">{formState.email || userData.email}</div>
          </div>
        </div>

        {/* Account Form Container */}
        <div className="bg-[#f9fafb] rounded-[0.8em] p-[1.5em] border-[0.08em] border-solid border-[#e5e7eb]">
          <form onSubmit={handleSubmit}>
            {/* First Name */}
            <div className="flex flex-col mb-[1em]">
              <label className="text-[0.85em] mb-[0.3em] text-[#374151]">First Name</label>
              <input
                type="text"
                name="firstName"
                value={formState.firstName}
                onChange={handleInputChange}
                className="border-[0.08em] border-solid border-[#d1d5db] rounded-[0.4em] p-[0.6em] text-[0.9em] outline-none focus:border-[#ff4d4d] focus:ring-2 focus:ring-[#ff4d4d]/20"
                disabled={formState.isSubmitting}
              />
            </div>

            {/* Last Name */}
            <div className="flex flex-col mb-[1em]">
              <label className="text-[0.85em] mb-[0.3em] text-[#374151]">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formState.lastName}
                onChange={handleInputChange}
                className="border-[0.08em] border-solid border-[#d1d5db] rounded-[0.4em] p-[0.6em] text-[0.9em] outline-none focus:border-[#ff4d4d] focus:ring-2 focus:ring-[#ff4d4d]/20"
                disabled={formState.isSubmitting}
              />
            </div>

            {/* Email Address */}
            <div className="flex flex-col mb-[1em]">
              <label className="text-[0.85em] mb-[0.3em] text-[#374151]">Email Address</label>
              <input
                type="email"
                name="email"
                value={formState.email}
                onChange={handleInputChange}
                className="border-[0.08em] border-solid border-[#d1d5db] rounded-[0.4em] p-[0.6em] text-[0.9em] outline-none focus:border-[#ff4d4d] focus:ring-2 focus:ring-[#ff4d4d]/20"
                disabled={formState.isSubmitting}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-[0.8em] mt-[1.2em]">
              <button
                type="submit"
                disabled={formState.isSubmitting}
                className={`bg-[#ff4d1c] text-white rounded-[0.4em] py-[0.6em] px-[1.2em] text-[0.9em] cursor-pointer hover:bg-[#e64400] transition ${formState.isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {formState.isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => {
                  // Reset form to original values
                  setFormState(prev => ({
                    ...prev,
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    email: userData.email,
                    submitError: ''
                  }));
                }}
                className="bg-gray-500 text-white rounded-[0.4em] py-[0.6em] px-[1.2em] text-[0.9em] cursor-pointer hover:bg-gray-600 transition"
              >
                Cancel
              </button>
            </div>

            {/* Success/Error Messages */}
            {formState.submitSuccess && (
              <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-lg">
                Profile updated successfully!
              </div>
            )}
            {formState.submitError && (
              <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
                {formState.submitError}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}