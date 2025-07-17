import { useMutation, useQueryClient } from '@tanstack/react-query'

import { MoveTaskBody, MoveTaskResult } from '../api/tasks/[id]/move/route'

export const useMoveTaskMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      taskId,
      ...body
    }: {
      taskId: string
    } & MoveTaskBody) => {
      const response = await fetch(`/api/tasks/${taskId}/move`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      const result: MoveTaskResult = await response.json()

      if (!result.success) {
        throw new Error(result.error)
      }

      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}
