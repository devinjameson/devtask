import { AnimateLayoutChanges, defaultAnimateLayoutChanges, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { CalendarIcon } from '@heroicons/react/16/solid'
import clsx from 'clsx'
import { DateTime } from 'effect'

import { TaskWithRelations } from '@/app/api/tasks/route'

const animateLayoutChanges: AnimateLayoutChanges = (args) =>
  defaultAnimateLayoutChanges({ ...args, wasDragging: true })

export default function TaskCard({
  task,
  onClick,
  className,
  dragDisabled = false,
  disableAnimations = false,
}: {
  task: TaskWithRelations
  onClick: () => void
  className?: string
  dragDisabled?: boolean
  disableAnimations?: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    disabled: dragDisabled,
    data: {
      type: 'task',
      task,
    },
    animateLayoutChanges: disableAnimations ? () => false : animateLayoutChanges,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={clsx(
        'rounded-lg bg-white shadow p-3 list-none select-none',
        { 'opacity-0': isDragging },
        className,
      )}
      onClick={onClick}
    >
      <h3 className="text-sm">{task.title}</h3>

      {task.description && <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>}

      {(task.dueDate || task.category) && (
        <div className="flex items-end justify-between mt-4">
          <div>
            {task.dueDate && (
              <span className="flex items-center bg-rose-100 px-2 py-0.5 rounded-md">
                <CalendarIcon className="h-4 w-4 text-rose-800" />
                <span className="text-sm font-medium mt-px ml-1 text-rose-900">
                  {DateTime.unsafeMake(task.dueDate).pipe(
                    DateTime.format({
                      month: 'short',
                      day: 'numeric',
                    }),
                  )}
                </span>
              </span>
            )}
          </div>
          <div>
            {task.category && (
              <div className="flex items-center bg-gray-200 px-2 py-0.5 rounded-md">
                <p className="text-sm font-medium spacing">{task.category.name}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </li>
  )
}
