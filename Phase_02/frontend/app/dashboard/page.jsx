import { Suspense } from 'react';
import DashboardClient from './dashboard-client';
import { TaskProvider } from '../../context/TaskContext';

// Server component wrapper - no session fetching during build
export default function Dashboard() {
  return (
    <TaskProvider>
      <DashboardClient />
    </TaskProvider>
  );
}