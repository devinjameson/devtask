import { useMutation, useQueryClient } from '@tanstack/react-query'

import { DeleteTaskResult } from '../api/tasks/[id]/route'
import { tasksQueryKey } from './queryKey'

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tasksQueryKey(profileId) })
    },
  })
}
