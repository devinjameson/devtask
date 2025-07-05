import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AddTaskBody, AddTaskResult } from '../api/tasks/route'

export const useAddTaskMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (body: AddTaskBody) => {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      const result: AddTaskResult = await response.json()

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
