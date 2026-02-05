"use client"
import {
  LayoutDashboard,
  TriangleAlert,
  ListTodo,
  Folders,
  Settings,
  HelpCircle,
  LogOut,
} from 'lucide-react';
import { TextAlignJustify, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getSessionData, logout } from '../../lib/authentication-methods';
import { useRouter } from 'next/navigation';

export  default function Header(){

    const [dateTime, setDateTime] = useState({
        day: "",
        date: ""
    });
    const [session, setSession] = useState(null)

    const [isMenu, setIsMenu] = useState(false);
    const router = useRouter();

    const handleLogout = async () => {

        try {
            await logout();
            router.push('/login');
            setSession(null)
        } catch (error) {
            console.error('Logout error:', error);
            // Even if logout API fails, clear local data and redirect
            router.push('/login');
        }
    };

    useEffect(() => {

        const getSession = async () => {
            const session = await getSessionData()
            setSession(session)
        } 

        const updateDate = () => {
        const now = new Date();

        // Get Day Name (e.g., Tuesday)
        const dayName = now.toLocaleDateString('en-GB', { weekday: 'long' });

        // Get Date in DD/MM/YYYY format
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();
        const dateString = `${day}/${month}/${year}`;

        setDateTime({ day: dayName, date: dateString });
        };

        getSession()
        updateDate();
        // Optional: Update at midnight if the dashboard stays open
        const timer = setInterval(updateDate, 1000 * 60);
        return () => clearInterval(timer);
    }, []);




  if (session){
    return (
        <header className="w-full h-[12vw] mobile:h-[6vw] md:h-[5vw] lg:h-[4.5vw] flex justify-between items-center px-[1.5vw] bg-[#f5f5f5] border-b border-gray-200 shadow-sm text-[3vw] mobile:text-[1.5vw] sm:text-[1.4vw] md:text-[1.3vw] lg:text-[1vw]">

        {/* --- Left Section: Brand --- */}
        <div className="flex items-center">
            <h1 className="font-bold text-[1.6em] leading-none">
            <span className="text-[#ff5a5f]">Dash</span>
            <span className="text-black">board</span>
            </h1>
        </div>

        <div className='block sm:hidden'>
            <TextAlignJustify onClick={() => setIsMenu(!isMenu)} className={` ${isMenu ? "hidden" : "block"} w-[2.5em] h-[2.5em]`} />
            <X  onClick={() => setIsMenu(!isMenu)} className={` ${isMenu ? "block" : "hidden"} w-[2.5em] h-[2.5em]`} />
        </div>

        <div className={` ${isMenu ? "block" : "hidden"} w-[45vw] fixed z-40 top-0 left-0 h-screen`}>
            <MobileSideBar onLogout={handleLogout} />
        </div>

        {/* --- Center Section: Search Bar --- */}
        <div className="hidden sm:flex w-[40%] justify-center">
            <div className="flex w-full items-center shadow-sm">
            <input
                type="text"
                placeholder="Search your task here..."
                className="flex-1 h-[2.4em] px-[1em] text-[1em] border border-gray-200 rounded-l-[0.4em] outline-none bg-white placeholder:text-gray-400"
            />
            <button className="h-[2.4em] w-[2.6em] bg-[#ff5a5f] rounded-r-[0.4em] flex items-center justify-center cursor-pointer transition-colors hover:bg-red-600">
                <svg className="w-[1.1em] h-[1.1em] text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </button>
            </div>
        </div>

        {/* --- Right Section: Actions & Date --- */}
        <div className="hidden sm:flex items-center gap-[1.5vw]">

            {/* Icons */}
            <div className="flex gap-[0.8vw]">
            {/* Notification Icon */}
            <div className="relative bg-[#ff8a8d] p-[0.5em] rounded-[0.5em] text-white cursor-pointer">
                <svg className="w-[1.2em] h-[1.2em]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {/* Red Dot */}
                <span className="absolute top-[0.4em] right-[0.4em] w-[0.35em] h-[0.35em] bg-white rounded-full border border-[#ff8a8d]"></span>
            </div>

            {/* Calendar Icon */}
            <div className="bg-[#ff8a8d] p-[0.5em] rounded-[0.5em] text-white cursor-pointer">
                <svg className="w-[1.2em] h-[1.2em]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            </div>

            {/* Logout Button */}
            <button
                onClick={handleLogout}
                className="bg-[#ff6f6f] p-[0.5em] rounded-[0.5em] text-white cursor-pointer hover:bg-red-600 transition-colors"
                title="Logout"
            >
                <LogOut className="w-[1.2em] h-[1.2em]" />
            </button>
            </div>

            {/* Dynamic Date Container */}
            <div className="flex flex-col items-end leading-tight">
            <span className="font-bold text-[1em] text-black">
                {dateTime.day || "Loading..."}
            </span>
            <span className="text-[0.8em] text-[#4db8ff] font-medium">
                {dateTime.date}
            </span>
            </div>
        </div>

        </header>
  );
  }else{
    return ""
  }
};


const MobileSideBar = ({ onLogout }) => {
    return <aside className="w-full relative h-screen bg-[#ff6f6f] py-[1.2em] text-[3vw] mobile:text-[2vw]">
        {/* User Profile Section */}
        <div className="flex flex-col items-center my-[1em]">
            {/* TODO: Replace the src with your actual profile image URL */}
            <p className="mt-[0.5em] text-[1em] font-medium text-white">Sachin Vandei</p>
            <p className="text-[0.8em] text-[#ffeaea]">sachinvandei@gmail.com</p>
        </div>

        {/* Navigation Menu */}
        <nav className="flex flex-col px-[1em]  w-full mt-[1em] gap-[0.4em]">
            {/* Dashboard - Active */}
            <div className="flex items-center gap-[0.6em] px-[1em] py-[0.7em] text-[0.95em] bg-white text-[#ff6f6f] cursor-pointer rounded-[0.6em]">
            <LayoutDashboard className="w-[1em] h-[1em]" />
            <span>Dashboard</span>
            </div>

            {/* Vital Task */}
            <div className="flex items-center gap-[0.6em] px-[1em] py-[0.7em] text-[0.95em] text-white cursor-pointer rounded-[0.6em] hover:bg-white/10 transition-colors">
            <TriangleAlert className="w-[1em] h-[1em]" />
            <span>Vital Task</span>
            </div>

            {/* My Task */}
            <div className="flex items-center gap-[0.6em] px-[1em] py-[0.7em] text-[0.95em] text-white cursor-pointer rounded-[0.6em] hover:bg-white/10 transition-colors">
            <ListTodo className="w-[1em] h-[1em]" />
            <span>My Task</span>
            </div>

            {/* Task Categories */}
            <div className="flex items-center gap-[0.6em] px-[1em] py-[0.7em] text-[0.95em] text-white cursor-pointer rounded-[0.6em] hover:bg-white/10 transition-colors">
            <Folders className="w-[1em] h-[1em]" />
            <span>Task Categories</span>
            </div>

            {/* Settings */}
            <div className="flex items-center gap-[0.6em] px-[1em] py-[0.7em] text-[0.95em] text-white cursor-pointer rounded-[0.6em] hover:bg-white/10 transition-colors">
            <Settings className="w-[1em] h-[1em]" />
            <span>Settings</span>
            </div>

            {/* Help */}
            <div className="flex items-center gap-[0.6em] px-[1em] py-[0.7em] text-[0.95em] text-white cursor-pointer rounded-[0.6em] hover:bg-white/10 transition-colors">
            <HelpCircle className="w-[1em] h-[1em]" />
            <span>Help</span>
            </div>
        </nav>

        {/* Logout */}
        <div className="w-full absolute bottom-0 flex px-[1em] pb-[1em]">
            <button
                onClick={onLogout}
                className="flex items-center gap-[0.6em] px-[1em] py-[0.7em] text-[0.95em] text-white cursor-pointer rounded-[0.6em] hover:bg-white/10 transition-colors w-full"
            >
            <LogOut className="w-[1em] h-[1em]" />
            <span>Logout</span>
            </button>
        </div>
        </aside>
}