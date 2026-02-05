'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSessionData } from '@/lib/authentication-methods';
import { ClipboardList, Plus, Circle, ClipboardCheck, ChartBar } from "lucide-react"
import DashBoardSideBar from "@/app/components/dashboardSideBar"
import AddNewTask from "@/app/components/taskForm"
import MyTasks from "@/app/components/myTasks"
import VitalTasks from "@/app/components/vitalTasks"
import CompletedTasks from "@/app/components/completedTasks"
import ViewTask from "@/app/components/viewTask"
import SettingsPage from "@/app/setting/page"
import { authToken } from '../../lib/better-auth-client';
import { TaskProvider } from '@/context/TaskContext'; // Wrap with TaskProvider
import SharedTaskList from '@/app/components/sharedTaskList';
import { useTaskContext } from '@/context/TaskContext';

export default function DashboardContent({ session }) {
  const [isTaskForm, setTaskForm] = useState(false)
  const [isViewTask, setViewTask] = useState(false)
  const [page, setPage] = useState("dashboard")
  const [forceRefresh, setForceRefresh] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showEditTask, setShowEditTask] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);

  const router = useRouter();

  const handlePage = (value) => {
    setPage(value)
  }

  const showTaskForm = () => {
    setTaskForm(!isTaskForm)
  }

  const showViewTask = () => {
    setViewTask(!isViewTask)
  }

  // Callback function to handle when a task is created
  const handleTaskCreated = (newTask) => {
    // Refresh the task list by triggering a re-render of DashboardCom
    setForceRefresh(prev => !prev);
    // Clear the task to edit state after successful update/create
    setTaskToEdit(null);
    setShowEditTask(false);
  };

  if("dashboard" == page){
    return(
      <TaskProvider> {/* Wrap the dashboard content with TaskProvider */}
        <div className='sm:grid bg-zinc-50 sm:grid-cols-[1fr_4.5fr] '>
          <DashBoardSideBar handlePage={handlePage} page={page} />
          <div className="min-h-screen bg-zinc-50 p-[2vw] text-[3vw] mobile:text-[1.7vw] sm:text-[1.4vw] md:text-[1.2vw] lg:text-[1vw] font-sans text-slate-800">

            {/* Top Greeting Section */}
            <header className="mb-[1.5vw] w-full">
              <h1 className="text-[1.6em] font-bold">Welcome back, {session?.user?.name || 'User'} 👋</h1>
            </header>

            {/* Main Dashboard Grid */}
            <main className="grid grid-cols-1 grid-rows-1 mobile:grid-rows-2 sm:grid-rows-1 sm:grid-cols-[1.5fr_1.3fr] gap-[1.5vw]">

              {/* LEFT COLUMN – TASK LIST */}
              <section className="flex flex-col gap-[1vw]">
                <div className="bg-white rounded-2xl p-[1.5vw] sm:shadow-sm sm:border border-slate-100">

                  {/* Task Header */}
                  <div className="flex justify-between items-center mb-[0.1vw]">
                    <div className='flex items-center gap-[0.7em]'>
                      <ClipboardList className='w-[1.5em] h-[1.5em]' />
                      <h2 className="text-[1.5em] text-[#ff6f6f]  font-bold">To-Do</h2>
                    </div>
                    <button onClick={showTaskForm} className="text-[1em] flex items-center gap-[0.3em] text-[#ff6f6f] font-medium cursor-pointer hover:underline">
                      <Plus className='w-[1.3em] h-[1.3em]' /> Add task
                    </button>
                  </div>
                  <p className="text-[0.9em] mb-[1vw]">20 June - <span className='text-[#A1A3AB]'>Today</span></p>

                  {/* Task Items */}
                  <SharedTaskList
                    taskCategory="dashboard"
                    title="To-Do"
                    taskFilter={(task) => true} // Show all tasks
                    onViewTask={() => setViewTask(!isViewTask)}
                    onTaskSelected={setSelectedTask}
                    onNavigateToTasks={() => handlePage("tasks")}
                  />
                </div>
              </section>

              {/* RIGHT COLUMN – STATUS & COMPLETED TASKS */}
              <aside className="flex flex-col-reverse mobile:flex-row-reverse sm:flex-col gap-[1.5vw]">

                {/* Task Status Card */}
                <div className="bg-white w-full h-fit rounded-2xl p-[1.5vw] sm:shadow-sm sm:border border-slate-100">
                  <div className='flex items-center gap-[0.7em] mb-[1.5vw]'>
                    <ChartBar className='w-[1.5em] h-[1.5em]' />
                    <h2 className="text-[1.5em]  leading-[1em] text-[#ff6f6f]  font-bold ">Task Status</h2>
                  </div>

                  <div className="flex justify-between items-center">
                    {/* Progress Item: Completed */}
                    <div className="flex flex-col items-center gap-[0.5vw]">
                      <div className="relative flex items-center justify-center">
                        <svg className="w-[6em] h-[6em] transform -rotate-90" viewBox='0 0 100 100'>
                          <circle cx="50" cy="50" r="45" fill="transparent" stroke="#f1f5f9" strokeWidth="8" />
                          <circle cx="50" cy="50" r="45" fill="transparent" stroke="#22c55e" strokeWidth="8" strokeDasharray="291"
                            strokeDashoffset="291" // This will be calculated based on context data
                            strokeLinecap="round" />
                        </svg>
                        <span className="absolute text-[1.3em] font-semibold text-[#05A301]">0%</span>
                      </div>
                      <div className='flex items-center gap-[0.4em]'>
                        <span className='w-3 h-3 bg-[#05A301] rounded-full'></span>
                        <span className="text-[1.15em] text-[#05A301] font-medium">Completed</span>
                      </div>
                    </div>

                    {/* Progress Item: In Progress */}
                    <div className="flex flex-col items-center gap-[0.5vw]">
                      <div className="relative flex items-center justify-center">
                        <svg className="w-[6em] h-[6em] transform -rotate-90" viewBox='0 0 100 100'>
                          <circle cx="50" cy="50" r="45" fill="transparent" stroke="#f1f5f9" strokeWidth="8" />
                          <circle cx="50" cy="50" r="45" fill="transparent" stroke="#3b82f6" strokeWidth="8" strokeDasharray="291"
                            strokeDashoffset="291" // This will be calculated based on context data
                            strokeLinecap="round" />
                        </svg>
                        <span className="absolute text-[1.3em] font-semibold text-[#0225FF]">0%</span>
                      </div>
                      <div className='flex items-center gap-[0.4em]'>
                        <span className='w-3 h-3 bg-[#0225FF] rounded-full'></span>
                        <span className="text-[1.15em] text-[#0225FF] font-medium">In Progress</span>
                      </div>
                    </div>
                    {/* Progress Item: Not Started */}
                    <div className="flex flex-col items-center gap-[0.5vw]">
                      <div className="relative flex items-center justify-center">
                        <svg className="w-[6em] h-[6em] transform -rotate-90" viewBox='0 0 100 100'>
                          <circle cx="50" cy="50" r="45" fill="transparent" stroke="#f1f5f9" strokeWidth="8" />
                          <circle cx="50" cy="50" r="45" fill="transparent" stroke="#ef4444" strokeWidth="8" strokeDasharray="291"
                            strokeDashoffset="291" // This will be calculated based on context data
                            strokeLinecap="round" />
                        </svg>
                        <span className="absolute text-[1.3em] font-semibold text-[#F21E1E]">0%</span>
                      </div>
                      <div className='flex items-center gap-[0.4em]'>
                        <span className='w-3 h-3 bg-[#F21E1E] rounded-full'></span>
                        <span className="text-[1.15em] text-[#F21E1E] font-medium">Not Started</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Completed Task Card */}
                <div className="bg-white w-full rounded-2xl p-[1.5vw] sm:shadow-sm sm:border border-slate-100">
                  <div className='flex items-center gap-[0.7em] mb-[1vw]'>
                    <ClipboardCheck className='w-[1.5em] h-[1.5em]' />
                    <h2 className="text-[1.5em] leading-[1em] text-[#ff6f6f] font-bold">Completed Task</h2>
                  </div>

                  <div className="text-center py-[1vw] text-gray-500">Completed tasks will be loaded from server data...</div>
                </div>

              </aside>
            </main>

          </div>
        </div>
      </TaskProvider>
    )
  }else if("tasks" == page){
    return(
      <div className='sm:grid bg-zinc-50 sm:grid-cols-[1fr_4.5fr] '>
        <DashBoardSideBar handlePage={handlePage} page={page} />
        <MyTasks />
      </div>
    )
  }else if("vital" == page){
    return(
      <div className='sm:grid bg-zinc-50 sm:grid-cols-[1fr_4.5fr] '>
        <DashBoardSideBar handlePage={handlePage} page={page} />
        <VitalTasks />
      </div>
    )
  }else if("completed" == page){
    return(
      <div className='sm:grid bg-zinc-50 sm:grid-cols-[1fr_4.5fr] '>
        <DashBoardSideBar handlePage={handlePage} page={page} />
        <CompletedTasks />
      </div>
    )
  }else if("settings" == page){
    return(
      <div className='sm:grid bg-zinc-50 sm:grid-cols-[1fr_4.5fr] '>
        <DashBoardSideBar handlePage={handlePage} page={page} />
        <SettingsPage />
      </div>
    )
  }
}