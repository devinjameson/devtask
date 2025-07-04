import { GetTasksResponseData, TaskWithRelations } from '@/app/api/tasks/route'
import { fetchJson } from '@/lib/api/fetchJson'
import { useQuery } from '@tanstack/react-query'

const fetchTasks = async (): Promise<TaskWithRelations[]> => {
  const result = await fetchJson<GetTasksResponseData>(() => fetch('/api/tasks'))

  if (!result.success) {
    throw new Error(result.error)
  }

  return result.data.tasks
}

export function useTasks() {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: fetchTasks,
  })
}
