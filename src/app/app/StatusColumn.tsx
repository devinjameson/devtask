import { UniqueIdentifier, useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { PlusIcon } from '@heroicons/react/24/solid'

import { Status } from '@/generated/prisma'
import { TaskWithRelations } from '@/app/api/tasks/route'

import { DragItem } from './dragItem'
import TaskCard from './TaskCard'

export default function StatusColumn({
  status,
  tasks,
  onAddTask,
  onClickTask,
  draggedTask,
  overId,
}: {
  status: Status
  tasks: TaskWithRelations[]
  onAddTask: (statusId: string) => void
  onClickTask: (taskId: string) => void
  draggedTask: TaskWithRelations | null
  overId: UniqueIdentifier | null
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: status.id,
    data: {
      type: 'status',
      status,
    } satisfies DragItem,
  })

  const taskIds = tasks.map(({ id }) => id)

  // TODO: This seems sus, research more
  let sortableItems = [...taskIds]

  const isDraggingOverThisColumn = draggedTask && isOver

  if (draggedTask && isDraggingOverThisColumn) {
    sortableItems = sortableItems.filter((id) => id !== draggedTask.id)

    const overIndex = sortableItems.indexOf(overId as string)
    const insertAt = overIndex >= 0 ? overIndex : sortableItems.length

    sortableItems = [
      ...sortableItems.slice(0, insertAt),
      draggedTask.id,
      ...sortableItems.slice(insertAt),
    ]
  }

  return (
    <section
      ref={setNodeRef}
      aria-labelledby={`status-${status.id}`}
      className={`bg-gray-50 rounded p-3 flex flex-col transition-colors ${
        isOver ? 'bg-blue-50 border-2 border-blue-200 border-dashed' : ''
      }`}
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

      <SortableContext items={sortableItems} strategy={verticalListSortingStrategy}>
        <ul className="flex flex-col gap-4 min-h-[100px] flex-1">
          {sortableItems.map((taskId) => {
            const task =
              tasks.find(({ id }) => id === taskId) ??
              (taskId === draggedTask?.id && isDraggingOverThisColumn ? draggedTask : null)

            if (!task) return null

            return <TaskCard key={task.id} task={task} onClick={() => onClickTask(task.id)} />
          })}
        </ul>
      </SortableContext>
    </section>
  )
}
