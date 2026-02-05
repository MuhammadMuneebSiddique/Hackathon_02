'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ClipboardList, Plus, Circle, ClipboardCheck, ChartBar } from "lucide-react"
import DashBoardSideBar from "@/app/components/dashboardSideBar"
import AddNewTask from "@/app/components/taskForm"
import MyTasks from "@/app/components/myTasks"
import VitalTasks from "@/app/components/vitalTasks"
import CompletedTasks from "@/app/components/completedTasks"
import ViewTask from "@/app/components/viewTask"
import SettingsPage from "@/app/setting/page"
import { useTaskContext } from '@/context/TaskContext';
import { getSessionData } from '@/lib/authentication-methods';

const DashboardCom = ({ showTaskForm, showViewTask, setSelectedTask, handlePage }) => {
  const { tasks, loading, error } = useTaskContext(); // Get tasks from context

  const getPriorityColor = (priority) => {
    switch(priority?.toLowerCase()) {
      case 'high':
        return '#42ADE2'; // Blue for high priority (as per requirements)
      case 'extreme':
        return '#F21E1E'; // Red for extreme priority (as per requirements)
      case 'low':
        return '#22c55e'; // Green for low priority (as per requirements)
      default:
        return '#A1A3AB'; // Default gray
    }
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'completed':
        return '#05A301'; // Green for completed
      case 'in progress':
        return '#0225FF'; // Blue for in progress
      case 'not started':
        return '#F21E1E'; // Red for not started
      default:
        return '#A1A3AB'; // Default gray
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-[2vw] text-[3vw] mobile:text-[1.7vw] sm:text-[1.4vw] md:text-[1.2vw] lg:text-[1vw] font-sans text-slate-800">

      {/* Top Greeting Section */}
      <header className="mb-[1.5vw] w-full">
        <h1 className="text-[1.6em] font-bold">Welcome back, Sachin 👋</h1>
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
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {loading ? (
                <div className="text-center py-[2vw] text-gray-500">Loading tasks...</div>
              ) : error ? (
                <div className="text-center py-[2vw] text-red-500">Error: {error}</div>
              ) : tasks.length > 0 ? (
                <>
                  {tasks.slice(0, 3).map((task) => (
                    <div
                      key={task.id}
                      onClick={() => {
                        setSelectedTask(task);
                        showViewTask();
                      }}
                      className="flex cursor-pointer gap-[1em] items-start sm:border border-[#A1A3AB] rounded-[1em] p-[1vw] mb-[1vw] last:mb-0"
                    >
                      <Circle className='w-[1.4em]  mt-[0.5em] h-[1.4em]' style={{color: task.is_completed ? '#05A301' : getPriorityColor(task.priority)}} />
                      {/* Task Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[1.4em] font-medium truncate">{task.title}</h3>
                        <p className="text-[1em] text-gray-500 mt-1 line-clamp-2">
                          {task.description?.slice(0,50)}...
                        </p>
                        <div className="flex flex-col  gap-[0.2em] mt-[0.5vw] text-[1em] text-black">
                          <span>Priority: <span className="font-medium" style={{color: getPriorityColor(task.priority)}}>{task.priority}</span></span>
                          <span>Status: <span className='font-medium' style={{color: getStatusColor(task.status)}}>{task.status}</span></span>
                          <span>Created on: {task.createdDate || 'Unknown'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {tasks.length > 3 && (
                    <div className="text-center">
                      <button
                        onClick={() => handlePage("tasks")}
                        className="text-[1em] text-[#ff6f6f] font-medium cursor-pointer hover:underline"
                      >
                        View More
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-[2vw] text-gray-500">No tasks found. Click "Add task" to create your first task!</div>
              )}
            </div>
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
                      strokeDashoffset={291 - (291 * (tasks.filter(t => t.status?.toLowerCase() === 'completed' || t.is_completed).length / Math.max(tasks.length, 1)))}
                      strokeLinecap="round" />
                  </svg>
                  <span className="absolute text-[1.3em] font-semibold text-[#05A301]">{Math.round((tasks.filter(t => t.status?.toLowerCase() === 'completed' || t.is_completed).length / Math.max(tasks.length, 1)) * 100) || 0}%</span>
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
                      strokeDashoffset={291 - (291 * (tasks.filter(t => t.status?.toLowerCase() === 'in progress').length / Math.max(tasks.length, 1)))}
                      strokeLinecap="round" />
                  </svg>
                  <span className="absolute text-[1.3em] font-semibold text-[#0225FF]">{Math.round((tasks.filter(t => t.status?.toLowerCase() === 'in progress').length / Math.max(tasks.length, 1)) * 100) || 0}%</span>
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
                      strokeDashoffset={291 - (291 * (tasks.filter(t => (t.status?.toLowerCase() === 'not started' || t.status?.toLowerCase() !== 'completed') && !t.is_completed).length / Math.max(tasks.length, 1)))}
                      strokeLinecap="round" />
                  </svg>
                  <span className="absolute text-[1.3em] font-semibold text-[#F21E1E]">{Math.round((tasks.filter(t => (t.status?.toLowerCase() === 'not started' || t.status?.toLowerCase() !== 'completed') && !t.is_completed).length / Math.max(tasks.length, 1)) * 100) || 0}%</span>
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

            {tasks.filter(t => t.status?.toLowerCase() === 'completed' || t.is_completed).length > 0 ? (
              <>
                {tasks.filter(t => t.status?.toLowerCase() === 'completed' || t.is_completed).slice(0, 2).map((task) => (
                  <div key={task.id} className="flex items-start rounded-[1em] gap-[1vw] border-[0.1em] p-[1em] border-[#A1A3AB] pb-[1vw] mb-[1vw]">
                    <Circle className='w-[1.4em] h-[1.4em] text-[#05A301]' />
                    <div className="flex flex-col flex-1">
                      <h3 className="text-[1.4em] leading-[1em] font-bold">{task.title}</h3>
                      <p className="text-[1em] my-[0.5em] text-gray-500">{task.description}</p>
                      <div className='flex gap-[0.5em] capitalize text-[1em] '>
                        <h3>status: </h3>
                        <h3 className='text-[#05A301] font-medium'>{task.status}</h3>
                      </div>
                      <span className="text-[1em] text-gray-400 mt-[0.2vw]">Completed on {task.createdDate || 'Unknown'}</span>
                    </div>
                  </div>
                ))}
                {tasks.filter(t => t.status?.toLowerCase() === 'completed' || t.is_completed).length > 2 && (
                  <div className="text-center">
                    <button
                      onClick={() => handlePage("completed")}
                      className="text-[1em] text-[#ff6f6f] font-medium cursor-pointer hover:underline"
                    >
                      View More
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-[1vw] text-gray-500">No completed tasks yet.</div>
            )}
          </div>

        </aside>
      </main>

    </div>
  );
};

export default function DashboardClient() {
  const [isTaskForm, setTaskForm] = useState(false)
  const [isViewTask, setViewTask] = useState(false)
  const [page, setPage] = useState("dashboard")
  const [selectedTask, setSelectedTask] = useState(null);
  const [showEditTask, setShowEditTask] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();

  // Check session on component mount
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        const sessionData = await getSessionData();
        setSession(sessionData);

        if (!sessionData) {
          // If not authenticated, redirect to login page
          router.push('/login');
        }
      } catch (error) {
        // If there's an error (e.g., network issue), redirect to login
        console.error('Authentication error:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  // If no session was found during authentication check, don't render anything
  // The redirect should have happened in useEffect
  if (!session) {
    return null;
  }

  const handlePage = (value) => {
    setPage(value)
  }

  const showTaskForm = () => {
    setTaskForm(!isTaskForm)
  }

  const showViewTask = () => {
    setViewTask(!isViewTask)
  }

  if(page == "dashboard"){
    return(
      <div className='sm:grid bg-zinc-50 sm:grid-cols-[1fr_4.5fr] '>
        <DashBoardSideBar handlePage={handlePage} page={page} />
        <DashboardCom session={session} showTaskForm={showTaskForm} showViewTask={showViewTask} setSelectedTask={setSelectedTask} handlePage={handlePage} />
        <AddNewTask
          isActive={isTaskForm || showEditTask}
          setIsActive={(state) => {
            setTaskForm(state);
            setShowEditTask(state); // Sync both states
          }}
          onTaskCreated={() => {}}
          taskToEdit={taskToEdit}
        />
        <ViewTask
          isActive={isViewTask}
          setIsActive={setViewTask}
          task={selectedTask}
          onTaskUpdated={() => {}}
          onTaskDeleted={() => {}}
          setShowEditTask={setShowEditTask}
          setTaskToEdit={setTaskToEdit}
        />
      </div>
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