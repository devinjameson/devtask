import { useMutation, useQueryClient } from '@tanstack/react-query'
import { generateKeyBetween } from 'fractional-indexing'

import type { Category, Status } from '@/generated/prisma'

import { CreateTaskBody, CreateTaskResult, TaskWithRelations } from '../api/tasks/route'
import { categoriesQueryKey, statusesQueryKey, tasksQueryKey } from './queryKey'

export const useCreateTaskMutation = ({ profileId }: { profileId: string }) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (body: CreateTaskBody) => {
      const response = await fetch(`/api/tasks?profileId=${encodeURIComponent(profileId)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      const result: CreateTaskResult = await response.json()

      if (!result.success) {
        throw new Error(result.error)
      }

      return result
    },
    onMutate: (newTask) => {
      const previousTasks = queryClient.getQueryData<TaskWithRelations[]>(tasksQueryKey(profileId))

      const categories = queryClient.getQueryData<Category[]>(categoriesQueryKey(profileId))
      const statuses = queryClient.getQueryData<Status[]>(statusesQueryKey(profileId))

      if (previousTasks === undefined) {
        return { previousTasks }
      }

      const status = statuses?.find(({ id }) => id === newTask.statusId)

      if (!status) {
        return { previousTasks }
      }

      const category =
        newTask.categoryId && categories
          ? categories.find(({ id }) => id === newTask.categoryId) || null
          : null

      if (newTask.categoryId && !category) {
        return { previousTasks }
      }

      const tasksInStatus = previousTasks.filter(({ statusId }) => statusId === newTask.statusId)
      const firstTaskOrder = tasksInStatus.length > 0 ? (tasksInStatus[0]?.order ?? null) : null
      const optimisticOrder = generateKeyBetween(null, firstTaskOrder)

      const optimisticTask: TaskWithRelations = {
        id: crypto.randomUUID(),
        title: newTask.title,
        description: newTask.description || null,
        dueDate: newTask.dueDate ? new Date(newTask.dueDate) : null,
        statusId: newTask.statusId,
        categoryId: newTask.categoryId ?? null,
        profileId,
        order: optimisticOrder,
        createdAt: new Date(),
        updatedAt: new Date(),
        category,
        status,
      }

      const statusTasks = previousTasks.filter((task) => task.statusId === newTask.statusId)
      const otherTasks = previousTasks.filter((task) => task.statusId !== newTask.statusId)

      const updatedTasks = [optimisticTask, ...statusTasks, ...otherTasks]

      queryClient.setQueryData<TaskWithRelations[]>(tasksQueryKey(profileId), updatedTasks)

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
