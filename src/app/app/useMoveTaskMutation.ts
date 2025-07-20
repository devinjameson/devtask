import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Array, Option, Order, pipe } from 'effect'

import { ApiSuccess } from '@core/api/apiResult'
import { TaskWithRelations } from '@core/api/service/taskService'

import { MoveTaskBody, MoveTaskResult, MoveTaskResultData } from '../api/tasks/[id]/move/route'

export type MoveTaskMutationParams = {
  taskId: string
  profileId: string
} & MoveTaskBody

type Context = {
  previous: TaskWithRelations[]
  profileId: string
}

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
      queryClient.invalidateQueries({ queryKey: ['tasks', { profileId }] })
    },
  })
}

const updateTasks = ({
  tasksWithRelations,
  taskId,
  destinationIndex,
  destinationStatusId,
}: {
  tasksWithRelations: TaskWithRelations[]
  taskId: string
  destinationIndex: number
  destinationStatusId?: string
}): TaskWithRelations[] => {
  const task = tasksWithRelations.find(({ id }) => id === taskId)

  if (!task) {
    throw new Error(`Task with id ${taskId} not found`)
  }

  const { statusId: originStatusId } = task

  const isMoveWithinStatus = !destinationStatusId || originStatusId === destinationStatusId

  if (isMoveWithinStatus) {
    const adjustedIndex = destinationIndex > task.order ? destinationIndex - 1 : destinationIndex

    return pipe(
      tasksWithRelations,
      Array.filter(({ id, statusId }) => statusId === originStatusId && id !== taskId),
      Array.sort(Order.mapInput(Order.number, ({ order }: TaskWithRelations) => order)),
      Array.insertAt(adjustedIndex, task),
      Option.map((tasks) =>
        pipe(
          tasks,
          Array.map((taskWithRelations, idx) => ({
            ...taskWithRelations,
            order: idx,
          })),
          Array.appendAll(tasksWithRelations.filter(({ statusId }) => statusId !== originStatusId)),
        ),
      ),
      Option.getOrThrowWith(() => new Error('Failed to update tasks')),
    )
  } else {
    return tasksWithRelations
  }
}
