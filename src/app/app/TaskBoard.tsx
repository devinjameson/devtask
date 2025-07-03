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
    <div className="grid grid-cols-4 gap-4 flex-1 overflow-hidden">
      {statuses.map((status) => (
        <section
          key={status.id}
          aria-labelledby={`status-${status.id}`}
          className="bg-gray-50 rounded p-2 flex flex-col"
        >
          <h2 id={`status-${status.id}`} className="text-lg font-semibold mb-2">
            {status.name}
          </h2>
          <ul className="flex flex-col gap-2 overflow-auto">
            {tasks
              .filter((task) => task.statusId === status.id)
              .map((task) => (
                <li key={task.id} className="rounded border p-2">
                  <h3 className="font-medium">{task.title}</h3>
                  <p className="text-sm text-gray-500">{task.category?.name}</p>
                </li>
              ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
