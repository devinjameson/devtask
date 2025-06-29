'use client'

import { AsyncResult } from '@/lib'
import { useTasks } from './useTasks'
import TaskBoard from './TaskBoard'

export default function App() {
  const queryResult = useTasks()
  const asyncTasks = AsyncResult.fromQueryResult(queryResult)

  return (
    <div className="space-y-4 p-4">
      {AsyncResult.match(asyncTasks, {
        onOk: (tasks) => <TaskBoard tasks={tasks} />,
        onLoading: () => <div className="text-gray-500">Loading tasks...</div>,
        onErr: (error) => <div className="text-red-600">Error loading tasks: {error.message}</div>,
      })}
    </div>
  )
}
