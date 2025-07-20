import { Effect } from 'effect'
import { UnknownException } from 'effect/Cause'
import { generateKeyBetween } from 'fractional-indexing'

import { prisma } from '@core/prisma'

import { Prisma, Task } from '@/generated/prisma'

import { ServiceException } from '../serviceException'

export const listTasks = (
  profileId: string,
): Effect.Effect<TaskWithRelations[], ServiceException | UnknownException> =>
  Effect.gen(function* () {
    const tasks = yield* Effect.tryPromise(() =>
      prisma.task.findMany({
        where: { profileId },
        include: { category: true, status: true },
        orderBy: { order: 'asc' },
      }),
    )

    return tasks
  })

export type TaskWithRelations = Prisma.TaskGetPayload<{
  include: {
    category: true
    status: true
  }
}>

export type CreateTaskPayload = {
  title: string
  statusId: string
  profileId: string
  description?: string
  categoryId?: string
  dueDate?: string
}

export const createTask = (
  payload: CreateTaskPayload,
): Effect.Effect<Task, ServiceException | UnknownException> =>
  Effect.gen(function* () {
    const newTask = yield* Effect.tryPromise({
      try: () =>
        prisma.$transaction(async (tx) => {
          const lastTask = await tx.task.findFirst({
            where: { statusId: payload.statusId },
            orderBy: { order: 'desc' },
            select: { order: true },
          })

          const order = generateKeyBetween(lastTask?.order ?? null, null)

          return tx.task.create({
            data: {
              title: payload.title,
              description: payload.description || undefined,
              statusId: payload.statusId,
              categoryId: payload.categoryId || undefined,
              dueDate: payload.dueDate ? new Date(payload.dueDate) : undefined,
              profileId: payload.profileId,
              order,
            },
          })
        }),
      catch: () => {
        return { message: `Failed createTask`, status: 500 }
      },
    })

    return newTask
  })

type MoveTaskPayload = {
  profileId: string
  taskId: string
  destinationIndex: number
  destinationStatusId?: string
}

export const moveTask = (
  payload: MoveTaskPayload,
): Effect.Effect<Task, ServiceException | UnknownException> =>
  Effect.gen(function* () {
    const updatedTask = yield* Effect.tryPromise({
      try: () =>
        prisma.$transaction(async (tx) => {
          const { profileId, taskId, destinationIndex } = payload

          const task = await tx.task.findUnique({
            where: { id: taskId, profileId },
          })

          if (!task) {
            throw new Error('Task not found')
          }

          const destinationStatusId = payload.destinationStatusId ?? task.statusId

          const destinationTasks = await tx.task.findMany({
            where: { statusId: destinationStatusId, id: { not: taskId } },
            orderBy: { order: 'asc' },
            select: { order: true },
          })

          const beforeTask = destinationIndex > 0 ? destinationTasks[destinationIndex - 1] : null
          const afterTask = destinationTasks[destinationIndex] ?? null

          const newOrder = generateKeyBetween(beforeTask?.order ?? null, afterTask?.order ?? null)

          return tx.task.update({
            where: { id: taskId },
            data: {
              statusId: destinationStatusId,
              order: newOrder,
            },
          })
        }),
      catch: (error) => {
        return {
          message: `Failed moveTask: ${error}`,
          status: 500,
        }
      },
    })

    return updatedTask
  })
