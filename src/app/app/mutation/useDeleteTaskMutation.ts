import { useMutation, useQueryClient } from '@tanstack/react-query'

import { DeleteTaskResult } from '@/app/api/tasks/[id]/route'
import { TaskWithRelations } from '@/app/api/tasks/route'

import { tasksQueryKey } from '../queryKey'

export const useDeleteTaskMutation = ({ profileId }: { profileId: string }) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      })

      const result: DeleteTaskResult = await response.json()

      if (!result.success) {
        throw new Error(result.error)
      }

      return result
    },
    onMutate: ({ id }) => {
      const previousTasks = queryClient.getQueryData<TaskWithRelations[]>(tasksQueryKey(profileId))

      if (previousTasks) {
        const updatedTasks = previousTasks.filter((task) => task.id !== id)

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
