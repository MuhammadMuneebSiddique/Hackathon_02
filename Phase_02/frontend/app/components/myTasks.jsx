import TaskLayout from './TaskLayout';
import { TaskProvider } from '@/context/TaskContext';

export default function MyTasks() {
  // No filter - show all tasks
  const allTasksFilter = null;

  return (
    <TaskProvider>
      <TaskLayout
        taskCategory="tasks"
        title="My Tasks"
        taskFilter={allTasksFilter}
      />
    </TaskProvider>
  );
}