'use client'

import { useState } from 'react'
import {
  closestCorners,
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  UniqueIdentifier,
  useSensor,
  useSensors,
} from '@dnd-kit/core'

import { Category, Status } from '@/generated/prisma'
import { TaskWithRelations } from '@/app/api/tasks/route'

import AddTaskModal from './AddTaskModal'
import { isTaskItem } from './dragItem'
import StatusColumn from './StatusColumn'
import TaskCard from './TaskCard'
import TaskDetailsModal from './TaskDetailsModal'
import { useMoveTaskMutation } from './useMoveTaskMutation'

export default function TaskBoard({
  tasks,
  statuses,
  categories,
}: {
  tasks: TaskWithRelations[]
  statuses: Status[]
  categories: Category[]
}) {
  const [addTaskStatusId, setAddTaskStatusId] = useState<string | null>(null)
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false)

  const [taskDetailsTaskId, setTaskDetailsTaskId] = useState<string | null>(null)
  const [isTaskDetailsModalOpen, setIsTaskDetailsModalOpen] = useState(false)

  const [draggedTask, setDraggedTask] = useState<TaskWithRelations | null>(null)

  const [overId, setOverId] = useState<UniqueIdentifier | null>(null)

  const moveTaskMutation = useMoveTaskMutation()

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

  const handleClickAddTask = (statusId_: string) => {
    setAddTaskStatusId(statusId_)
    setIsAddTaskModalOpen(true)
  }

  const handleCloseAddTaskModal = () => {
    setIsAddTaskModalOpen(false)
  }

  const handleClickTask = (taskId: string) => {
    setTaskDetailsTaskId(taskId)
    setIsTaskDetailsModalOpen(true)
  }

  const handleCloseTaskDetailsModal = () => {
    setIsTaskDetailsModalOpen(false)
  }

  const handleDragStart = (event: DragStartEvent) => {
    const item = event.active.data.current

    if (isTaskItem(item)) {
      setDraggedTask(item.task)
    }
  }

  const handleDragOver = (event: DragOverEvent) => {
    setOverId(event.over?.id ?? null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    // TODO: read the docs and do this properly, hardest part for sure
  }

  const selectedTask = taskDetailsTaskId
    ? tasks.find(({ id }) => id === taskDetailsTaskId)
    : undefined

  return (
    <>
      <DndContext
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
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
                onClickTask={handleClickTask}
                draggedTask={draggedTask}
                overId={overId}
              />
            )
          })}
        </div>

        <DragOverlay>
          {draggedTask ? <TaskCard task={draggedTask} onClick={() => {}} /> : null}
        </DragOverlay>
      </DndContext>

      <AddTaskModal
        open={isAddTaskModalOpen}
        onCloseAction={handleCloseAddTaskModal}
        statusId={addTaskStatusId}
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
