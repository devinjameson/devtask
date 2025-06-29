import { TaskWithRelations } from '@/app/api/tasks/route'

export default function TaskBoard({ tasks }: { tasks: TaskWithRelations[] }) {
  return (
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
  )
}
