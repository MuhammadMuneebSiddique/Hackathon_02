

import TaskLayout from './TaskLayout';
import { TaskProvider } from '@/context/TaskContext';

export default function CompletedTasks() {
  // Filter for completed tasks - check both status and is_completed field
  const completedTaskFilter = (task) => task.is_completed || (task.status && task.status.toLowerCase() === 'completed');

  return (
    <TaskProvider>
      <TaskLayout
        taskCategory="completed"
        title="Completed Tasks"
        taskFilter={completedTaskFilter}
      />
    </TaskProvider>
  );
}