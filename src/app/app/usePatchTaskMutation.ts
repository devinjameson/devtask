import { useMutation, useQueryClient } from '@tanstack/react-query'

import { PatchTaskBody, PatchTaskResult } from '../api/tasks/[id]/route'
import { TaskWithRelations } from '../api/tasks/route'
import { tasksQueryKey } from './queryKey'

export const usePatchTaskMutation = ({ profileId }: { profileId: string }) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...body }: { id: string } & PatchTaskBody) => {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      const result: PatchTaskResult = await response.json()

      if (!result.success) {
        throw new Error(result.error)
      }

      return result
    },
    onMutate: ({ id, ...updates }) => {
      const previousTasks = queryClient.getQueryData<TaskWithRelations[]>(tasksQueryKey(profileId))

      if (previousTasks) {
        const updatedTasks = previousTasks.map((task) => {
          if (task.id === id) {
            return {
              ...task,
              ...updates,
              dueDate: updates.dueDate ? new Date(updates.dueDate) : task.dueDate,
              updatedAt: new Date(),
            }
          }
          return task
        })

        queryClient.setQueryData<TaskWithRelations[]>(tasksQueryKey(profileId), updatedTasks)
      }

      return { previousTasks }
    },
    onError: (_error, _variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(tasksQueryKey(profileId), context.previousTasks)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tasksQueryKey(profileId) })
    },
  })
}
