'use client'

import { useTasks } from './useTasks'

export default function App() {
  const { data: tasks, isLoading, error } = useTasks()

  if (isLoading) return <div>Loading tasks…</div>
  if (error) return <div>Failed to load tasks</div>

  return (
    <div className="space-y-4 p-4">
      <ul className="space-y-2">
        {tasks?.map((task) => (
          <li key={task.id} className="border rounded p-2">
            <div className="font-medium">{task.title}</div>
            <div className="text-sm text-gray-500">
              {task.category?.name} • {task.status.name}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
