import { useMutation, useQueryClient } from '@tanstack/react-query'

import { ApiSuccess } from '@core/api/apiResult'

import { MoveTaskBody, MoveTaskResult, MoveTaskResultData } from '@/app/api/tasks/[id]/move/route'

import { tasksQueryKey } from '../queryKey'

export type MoveTaskMutationParams = {
  taskId: string
  profileId: string
} & MoveTaskBody

export const useMoveTaskMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<ApiSuccess<MoveTaskResultData>, Error, MoveTaskMutationParams>({
    mutationFn: async ({ taskId, ...body }: MoveTaskMutationParams) => {
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
    onSuccess: (_data, { profileId }) => {
      queryClient.invalidateQueries({ queryKey: tasksQueryKey(profileId) })
    },
  })
}
