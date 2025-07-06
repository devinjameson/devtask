'use client'

import { TaskWithRelations } from '@/app/api/tasks/route'
import { Category, Status } from '@/generated/prisma'
import { PlusIcon } from '@heroicons/react/24/solid'
import { useState } from 'react'
import AddTaskModal from './AddTaskModal'
import TaskCard from './TaskCard'
import TaskDetailsModal from './TaskDetailsModal'

export default function TaskBoard({
  tasks,
  statuses,
  categories,
}: {
  tasks: TaskWithRelations[]
  statuses: Status[]
  categories: Category[]
}) {
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false)
  const [statusId, setStatusId] = useState<string | null>(null)
  const [isTaskDetailsModalOpen, setIsTaskDetailsModalOpen] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)

  const handleClickAddTask = (statusId_: string) => {
    setStatusId(statusId_)
    setIsAddTaskModalOpen(true)
  }

  const handleCloseAddTaskModal = () => {
    setIsAddTaskModalOpen(false)
  }

  const handleClickTask = (taskId: string) => {
    setSelectedTaskId(taskId)
    setIsTaskDetailsModalOpen(true)
  }

  const handleCloseTaskDetailsModal = () => {
    setIsTaskDetailsModalOpen(false)
  }

  return (
    <>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(16rem,1fr))] gap-6 p-2 flex-1 overflow-hidden">
        {statuses.map((status) => (
          <section
            key={status.id}
            aria-labelledby={`status-${status.id}`}
            className="bg-gray-50 rounded p-3 flex flex-col"
          >
            <div className="flex justify-between items-center mb-3 border-b border-gray-200 pb-2">
              <h2
                id={`status-${status.id}`}
                className="tracking-wide uppercase font-semibold text-sm ml-1"
              >
                {status.name}
              </h2>
              <button
                className="text-gray-500 rounded-full bg-gray-200 p-2 hover:bg-gray-300 transition group"
                onClick={() => handleClickAddTask(status.id)}
                aria-label="Add task"
              >
                <PlusIcon className="h-5 w-5 stroke-2 group-hover:scale-120 transition" />
              </button>
            </div>
            <ul className="flex flex-col gap-4">
              {tasks
                .filter((task) => task.statusId === status.id)
                .map((task) => (
                  <TaskCard key={task.id} task={task} onClick={() => handleClickTask(task.id)} />
                ))}
            </ul>
          </section>
        ))}
      </div>

      <AddTaskModal
        open={isAddTaskModalOpen}
        onCloseAction={handleCloseAddTaskModal}
        statusId={statusId}
        statuses={statuses}
        categories={categories}
      />

      <TaskDetailsModal
        open={isTaskDetailsModalOpen}
        onCloseAction={handleCloseTaskDetailsModal}
        taskId={selectedTaskId}
        tasks={tasks}
      />
    </>
  )
}
