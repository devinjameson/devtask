import { TaskWithRelations } from '@/lib/types'
import { useQuery } from '@tanstack/react-query'

const fetchTasks = async () => {
  const res = await fetch('/api/tasks')
  if (!res.ok) throw new Error('Failed to fetch tasks')
  return res.json() as Promise<TaskWithRelations[]>
}

export function useTasks() {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: fetchTasks,
  })
}
