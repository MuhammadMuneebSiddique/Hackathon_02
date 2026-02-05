import TaskLayout from './TaskLayout';
import { TaskProvider } from '@/context/TaskContext';

export default function VitalTasks() {
  // Filter for tasks with extreme priority
  const vitalTaskFilter = (task) => task.priority && (task.priority.toLowerCase() === 'extreme');

  return (
    <TaskProvider>
      <TaskLayout
        taskCategory="vital"
        title="Vital Tasks"
        taskFilter={vitalTaskFilter}
      />
    </TaskProvider>
  );
}