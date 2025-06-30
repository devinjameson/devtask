import { TaskWithRelations } from '@/app/api/tasks/route'
import { Status } from '@/generated/prisma'

export default function TaskBoard({
  tasks,
  statuses,
}: {
  tasks: TaskWithRelations[]
  statuses: Status[]
}) {
  return (
    <ul className="space-y-2">
      {statuses.map((status) => (
        <li key={status.id} className="border rounded p-2">
          <div className="font-medium">{status.name}</div>
          <ul className="space-y-1 mt-2">
            {tasks
              .filter((task) => task.statusId === status.id)
              .map((task) => (
                <li key={task.id} className="border rounded p-2">
                  <div className="font-medium">{task.title}</div>
                  <div className="text-sm text-gray-500">
                    {task.category?.name} • {task.status.name}
                  </div>
                </li>
              ))}
          </ul>
        </li>
      ))}
    </ul>
  )
}
