import { useQuery } from '@tanstack/react-query'

import { fetchApi } from '@core/api/fetchApi'

import { GetTasksResultData, TaskWithRelations } from '@/app/api/tasks/route'

import { tasksQueryKey } from './queryKey'

export const fetchTasks = async (profileId: string): Promise<TaskWithRelations[]> => {
  const result = await fetchApi<GetTasksResultData>(() =>
    fetch(`/api/tasks?profileId=${encodeURIComponent(profileId)}`),
  )

  if (!result.success) {
    throw new Error(result.error)
  }

  return result.data.tasks
}

export function useTasks({ profileId }: { profileId: string }) {
  return useQuery({
    queryKey: tasksQueryKey(profileId),
    queryFn: () => fetchTasks(profileId),
    enabled: profileId !== '',
  })
}
