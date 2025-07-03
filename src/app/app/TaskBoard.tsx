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
    <div className="grid grid-cols-[repeat(auto-fit,minmax(16rem,1fr))] gap-6 p-2 flex-1 overflow-hidden">
      {statuses.map((status) => (
        <section
          key={status.id}
          aria-labelledby={`status-${status.id}`}
          className="bg-gray-50 rounded p-3 flex flex-col"
        >
          <h2
            id={`status-${status.id}`}
            className="mb-3 border-b pb-1 border-gray-200 tracking-wide uppercase font-semibold text-sm"
          >
            {status.name}
          </h2>
          <ul className="flex flex-col gap-4">
            {tasks
              .filter((task) => task.statusId === status.id)
              .map((task) => (
                <li
                  key={task.id}
                  className="rounded-lg bg-white shadow p-3 hover:bg-blue-50 hover:shadow-md transition"
                >
                  <h3 className="font-medium mb-1">{task.title}</h3>
                  <p className="text-sm text-gray-500">{task.category?.name}</p>
                </li>
              ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
