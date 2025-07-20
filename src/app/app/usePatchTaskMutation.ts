import { useMutation, useQueryClient } from '@tanstack/react-query'

import { PatchTaskBody, PatchTaskResult } from '../api/tasks/[id]/route'

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', { profileId }] })
    },
  })
}
