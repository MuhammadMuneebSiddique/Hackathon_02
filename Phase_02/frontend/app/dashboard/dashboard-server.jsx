import { getTasksServer } from '@/lib/server-tasks';
import { getSessionData } from '@/lib/authentication-methods';
import DashboardClient from './dashboard-client';

export default async function DashboardServer() {
  // Get session server-side
  const session = await getSessionData();

  if (!session || !session.user) {
    // Redirect would be handled by parent component
    return <div>Not authenticated</div>;
  }

  // Fetch tasks server-side
  const tasks = await getTasksServer();

  return <DashboardClient initialTasks={tasks} session={session} />;
}