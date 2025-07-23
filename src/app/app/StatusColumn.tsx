import { UniqueIdentifier, useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { PlusIcon } from '@heroicons/react/24/solid'
import clsx from 'clsx'

import { Status } from '@/generated/prisma'
import { TaskWithRelations } from '@/app/api/tasks/route'

import TaskCard from './TaskCard'

export default function StatusColumn({
  status,
  taskIds,
  allTasks,
  disableAnimations,
  onAddTask,
  onClickTask,
  isDragging,
  dragDisabled = false,
}: {
  status: Status
  taskIds: UniqueIdentifier[]
  allTasks: TaskWithRelations[]
  disableAnimations: boolean
  onAddTask: (statusId: string) => void
  onClickTask: (taskId: string) => void
  isDragging: boolean
  dragDisabled?: boolean
}) {
  const { setNodeRef } = useDroppable({
    id: status.id,
    data: { type: 'status', status },
  })

  return (
    <section
      ref={setNodeRef}
      aria-labelledby={`status-${status.id}`}
      className={clsx('bg-gray-50 rounded-md p-3 flex flex-col border', {
        'border-gray-50': !isDragging,
        'border-blue-300 border-dashed': isDragging,
      })}
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
          onClick={() => onAddTask(status.id)}
          aria-label="Add task"
        >
          <PlusIcon className="h-5 w-5 stroke-2 group-hover:scale-120 transition" />
        </button>
      </div>

      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <ul className="flex flex-col gap-4 min-h-[100px] flex-1">
          {taskIds.map((taskId) => {
            const task = allTasks.find(({ id }) => id === taskId)

            return task ? (
              <TaskCard
                key={task.id}
                task={task}
                dragDisabled={dragDisabled}
                disableAnimations={disableAnimations}
                onClick={() => onClickTask(task.id)}
              />
            ) : null
          })}
        </ul>
      </SortableContext>
    </section>
  )
}
