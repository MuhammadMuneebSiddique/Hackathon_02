"use client"

import {
  LayoutDashboard,
  TriangleAlert,
  ListTodo,
  Settings,
  LogOut,
  LaptopMinimalCheck,
  MessageSquare,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { getSessionData, logout } from '../../util/authentication-methods';
import { useRouter } from 'next/navigation';



export default function DashboardSideBar({handlePage, page} ) {
  const [userData, setUserData] = useState({
    name: 'User',
    email: 'user@example.com'
  });
  const router = useRouter();

  const handleLogout = async () => {

    try {
        await logout();
        router.push('/login');
    } catch (error) {
        console.error('Logout error:', error);
        // Even if logout API fails, clear local data and redirect
        router.push('/login');
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const session = await getSessionData();
        if (session && session.user) {
          setUserData({
            name: session.user.name || 'User',
            email: session.user.email || 'user@example.com'
          });
        }
      } catch (error) {
        console.error('Error fetching user data for sidebar:', error);
      }
    };

    fetchUserData();
  }, []);

  return (
        <aside className="hidden h-full sm:block w-[18vw] relative bg-[#ff6f6f] py-[1.2em] text-[1.5vw] md:text-[1.3vw] lg:text-[1.1vw]">
          {/* User Profile Section */}
          <div className="flex flex-col items-center">
              <p className="mt-[0.5em] text-[1em] font-medium text-white">{userData.name}</p>
              <p className="text-[0.8em] text-[#ffeaea]">{userData.email}</p>
          </div>

          {/* Navigation Menu */}
          <nav className="flex flex-col px-[1em]  w-full mt-[1em] gap-[0.4em]">
              {/* Dashboard - Active */}
              <div onClick={() => handlePage("dashboard")} className={` ${page == "dashboard" ? "bg-white text-[#ff6f6f]" : "text-white hover:bg-white/10 transition-colors"} flex items-center gap-[0.6em] px-[1em] py-[0.7em] text-[0.95em] cursor-pointer rounded-[0.6em]`}>
              <LayoutDashboard className="w-[1em] h-[1em]" />
              <span>Dashboard</span>
              </div>

              {/* Vital Task */}
              <div onClick={() => handlePage("vital")} className={` ${page == "vital" ? "bg-white text-[#ff6f6f]" : "text-white hover:bg-white/10 transition-colors"} flex items-center gap-[0.6em] px-[1em] py-[0.7em] text-[0.95em] cursor-pointer rounded-[0.6em]`}>
              <TriangleAlert className="w-[1em] h-[1em]" />
              <span>Vital Task</span>
              </div>

              {/* My Task */}
              <div onClick={() => handlePage("tasks")}  className={` ${page == "tasks" ? "bg-white text-[#ff6f6f]" : "text-white hover:bg-white/10 transition-colors"} flex items-center gap-[0.6em] px-[1em] py-[0.7em] text-[0.95em] cursor-pointer rounded-[0.6em]`}>
              <ListTodo className="w-[1em] h-[1em]" />
              <span>My Task</span>
              </div>

              {/* AI Chat */}
              <div onClick={() => handlePage("chat")}  className={` ${page == "chat" ? "bg-white text-[#ff6f6f]" : "text-white hover:bg-white/10 transition-colors"} flex items-center gap-[0.6em] px-[1em] py-[0.7em] text-[0.95em] cursor-pointer rounded-[0.6em]`}>
              <MessageSquare className="w-[1em] h-[1em]" />
              <span>Task Assistant</span>
              </div>

              {/* Vital Task */}
              <div onClick={() => handlePage("completed")}  className={` ${page == "completed" ? "bg-white text-[#ff6f6f]" : "text-white hover:bg-white/10 transition-colors"} flex items-center gap-[0.6em] px-[1em] py-[0.7em] text-[0.95em] cursor-pointer rounded-[0.6em]`}>
              <LaptopMinimalCheck className="w-[1em] h-[1em]" />
              <span>Completed Task</span>
              </div>

              {/* Settings */}
              <div onClick={() => handlePage("settings")} className={` ${page == "settings" ? "bg-white text-[#ff6f6f]" : "text-white hover:bg-white/10 transition-colors"} flex items-center gap-[0.6em] px-[1em] py-[0.7em] text-[0.95em] cursor-pointer rounded-[0.6em]`}>
              <Settings className="w-[1em] h-[1em]" />
              <span>Settings</span>
              </div>
          </nav>

          {/* Logout */}
          <div className="w-full absolute bottom-0 flex px-[1em] pb-[1em]">
              <div onClick={handleLogout} className="flex items-center gap-[0.6em] px-[1em] py-[0.7em] text-[0.95em] text-white cursor-pointer rounded-[0.6em] hover:bg-white/10 transition-colors">
              <LogOut className="w-[1em] h-[1em]" />
              <span>Logout</span>
              </div>
          </div>
        </aside>
  )
}

