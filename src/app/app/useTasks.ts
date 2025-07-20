import { useQuery } from '@tanstack/react-query'

import { fetchApi } from '@core/api/fetchApi'

import { GetTasksResultData, TaskWithRelations } from '@/app/api/tasks/route'

const fetchTasks = async (): Promise<TaskWithRelations[]> => {
  const result = await fetchApi<GetTasksResultData>(() => fetch('/api/tasks'))

  if (!result.success) {
    throw new Error(result.error)
  }

  return result.data.tasks
}

export function useTasks({ profileId }: { profileId: string }) {
  return useQuery({
    queryKey: ['tasks', { profileId: profileId }],
    queryFn: fetchTasks,
  })
}
