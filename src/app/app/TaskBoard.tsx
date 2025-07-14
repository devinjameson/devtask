'use client'

import { useState } from 'react'
import {
  closestCorners,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { Category, Status } from '@/generated/prisma'
import { TaskWithRelations } from '@/app/api/tasks/route'

import AddTaskModal from './AddTaskModal'
import StatusColumn from './StatusColumn'
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
  const [activeTask, setActiveTask] = useState<TaskWithRelations | null>(null)

  const queryClient = useQueryClient()

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    }),
  )

  const moveTaskMutation = useMutation({
    mutationFn: async ({
      taskId,
      destinationIndex,
      destinationStatusId,
    }: {
      taskId: string
      destinationIndex: number
      destinationStatusId?: string
    }) => {
      const response = await fetch(`/api/tasks/${taskId}/move`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          destinationIndex,
          destinationStatusId,
        }),
      })
      if (!response.ok) {
        throw new Error('Failed to move task')
      }
      return response.json()
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

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

  const selectedTask = selectedTaskId ? tasks.find(({ id }) => id === selectedTaskId) : undefined

  const handleDragStart = (event: DragStartEvent) => {
    const task = event.active.data.current?.task as TaskWithRelations
    setActiveTask(task)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null)
    const { active, over } = event

    if (!over || active.id === over.id) return

    const activeTask = active.data.current?.task as TaskWithRelations | undefined
    const overData = over.data.current

    if (!activeTask) return

    const isOverATask = overData?.type === 'task'
    const isOverAStatus = overData?.type === 'status'

    if (isOverATask) {
      const overTask = overData.task as TaskWithRelations

      if (activeTask.statusId === overTask.statusId) {
        // Moving within the same status - use the target task's order
        if (activeTask.order !== overTask.order) {
          moveTaskMutation.mutate({
            taskId: activeTask.id,
            destinationIndex: overTask.order,
          })
        }
      } else {
        // Moving to different status - use the target task's order
        moveTaskMutation.mutate({
          taskId: activeTask.id,
          destinationIndex: overTask.order,
          destinationStatusId: overTask.statusId,
        })
      }
    }

    if (isOverAStatus) {
      const overStatus = overData.status as Status

      if (activeTask.statusId !== overStatus.id) {
        // Moving to empty status or end of status - find the highest order + 1
        const statusTasks = tasks.filter((task) => task.statusId === overStatus.id)
        const maxOrder =
          statusTasks.length > 0 ? Math.max(...statusTasks.map((task) => task.order)) : -1

        moveTaskMutation.mutate({
          taskId: activeTask.id,
          destinationIndex: maxOrder + 1,
          destinationStatusId: overStatus.id,
        })
      }
    }
  }

  return (
    <>
      <DndContext
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        sensors={sensors}
        collisionDetection={closestCorners}
      >
        <div className="grid grid-cols-[repeat(auto-fit,minmax(16rem,1fr))] gap-6 p-2 flex-1 overflow-hidden">
          {statuses.map((status) => {
            const statusTasks = tasks
              .filter((task) => task.statusId === status.id)
              .sort((a, b) => b.order - a.order)

            return (
              <StatusColumn
                key={status.id}
                status={status}
                tasks={statusTasks}
                onAddTask={handleClickAddTask}
                onTaskClick={handleClickTask}
              />
            )
          })}
        </div>

        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} onClick={() => {}} /> : null}
        </DragOverlay>
      </DndContext>

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
        task={selectedTask ?? null}
        statuses={statuses}
        categories={categories}
      />
    </>
  )
}
