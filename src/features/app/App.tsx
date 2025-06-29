'use client'

import { AsyncResult } from '@/lib'
import { useTasks } from './useTasks'

export default function App() {
  const queryResult = useTasks()
  const asyncTasks = AsyncResult.fromQueryResult(queryResult)

  return (
    <div className="space-y-4 p-4">
      {AsyncResult.match(asyncTasks, {
        onOk: (tasks) => (
          <ul className="space-y-2">
            {tasks.map((task) => (
              <li key={task.id} className="border rounded p-2">
                <div className="font-medium">{task.title}</div>
                <div className="text-sm text-gray-500">
                  {task.category?.name} • {task.status.name}
                </div>
              </li>
            ))}
          </ul>
        ),
        onLoading: () => <div className="text-gray-500">Loading tasks...</div>,
        onErr: (error) => <div className="text-red-600">Error loading tasks: {error.message}</div>,
      })}
    </div>
  )
}
