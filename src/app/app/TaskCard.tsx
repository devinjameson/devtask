import { TaskWithRelations } from '../api/tasks/route'

export default function TaskCard({ task }: { task: TaskWithRelations }) {
  return (
    <li
      key={task.id}
      className="rounded-lg bg-white shadow p-3 hover:bg-blue-50 hover:shadow-md transition"
    >
      <h3 className="font-medium mb-1">{task.title}</h3>

      {task.description && <p className="text-sm text-gray-600">{task.description}</p>}

      <div className="flex items-center mt-4">
        <div className="w-2 h-2 rounded-full mr-2 bg-gray-700" />
        <p className="text-sm font-medium text-gray-800 leading-0">{task.category?.name}</p>
      </div>
    </li>
  )
}
