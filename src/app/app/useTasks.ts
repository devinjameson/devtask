import { GetTasksResultData, TaskWithRelations } from '@/app/api/tasks/route'
import { fetchApi } from '@/lib/api/fetchApi'
import { useQuery } from '@tanstack/react-query'

const fetchTasks = async (): Promise<TaskWithRelations[]> => {
  const result = await fetchApi<GetTasksResultData>(() => fetch('/api/tasks'))

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
