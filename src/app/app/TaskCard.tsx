import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import { TaskWithRelations } from '../api/tasks/route'

export default function TaskCard({
  task,
  onClick,
}: {
  task: TaskWithRelations
  onClick: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: {
      type: 'task',
      task,
    },
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
      className={`rounded-lg bg-white shadow p-3 hover:bg-gray-100 hover:shadow-md transition cursor-grab active:cursor-grabbing ${
        isDragging ? 'opacity-50' : ''
      }`}
      onClick={onClick}
    >
      <h3 className="font-medium mb-1">{task.title}</h3>

      {task.description && <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>}

      <div className="flex items-center mt-4">
        <div className="w-1.5 h-1.5 rounded-full mr-1 bg-blue-700 mb-px" />
        <p className="text-sm font-medium text-gray-800 spacing leading-0">{task.category?.name}</p>
      </div>
    </li>
  )
}
