import { Effect } from 'effect'
import { UnknownException } from 'effect/Cause'
import { ServiceException } from '../serviceException'
import { prisma } from '@core/prisma'
import { Prisma, Task } from '@/generated/prisma'

export const listTasks = (
  profileId: string,
): Effect.Effect<TaskWithRelations[], ServiceException | UnknownException> =>
  Effect.gen(function* () {
    const tasks = yield* Effect.tryPromise(() =>
      prisma.task.findMany({
        where: { profileId },
        include: { category: true, status: true },
        orderBy: { order: 'desc' },
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
          const taskWithMaxOrder = await tx.task.findFirst({
            where: { statusId: payload.statusId },
            orderBy: { order: 'desc' },
            select: { order: true },
          })

          const order = taskWithMaxOrder ? taskWithMaxOrder.order + 1 : 0

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
  toIndex: number
  toStatusId?: string
}
export const moveTask = (
  payload: MoveTaskPayload,
): Effect.Effect<Task, ServiceException | UnknownException> =>
  Effect.gen(function* () {
    const updatedTask = yield* Effect.tryPromise({
      try: () =>
        prisma.$transaction(async (tx) => {
          const task = await tx.task.findUnique({
            where: { id: payload.taskId, profileId: payload.profileId },
          })

          if (!task) {
            throw new Error('Task not found')
          }

          const fromStatusId = task.statusId
          const toStatusId = payload.toStatusId ?? fromStatusId

          const movingToDifferentStatus = toStatusId !== fromStatusId

          if (movingToDifferentStatus) {
            await tx.task.updateMany({
              where: {
                statusId: fromStatusId,
                order: { gt: task.order },
              },
              data: { order: { decrement: 1 } },
            })

            await tx.task.updateMany({
              where: {
                statusId: toStatusId,
                order: { gte: payload.toIndex },
              },
              data: { order: { increment: 1 } },
            })
          } else {
            const movingUp = payload.toIndex > task.order

            if (movingUp) {
              await tx.task.updateMany({
                where: {
                  statusId: toStatusId,
                  order: { gt: task.order, lte: payload.toIndex },
                  id: { not: payload.taskId },
                },
                data: { order: { decrement: 1 } },
              })
            } else {
              await tx.task.update({
                where: { id: payload.taskId },
                data: { order: -1 },
              })

              await tx.task.updateMany({
                where: {
                  statusId: toStatusId,
                  order: { gte: payload.toIndex },
                },
                data: { order: { increment: 1 } },
              })
            }
          }

          return tx.task.update({
            where: { id: payload.taskId },
            data: {
              statusId: toStatusId,
              order: payload.toIndex,
            },
          })
        }),
      catch: () => ({
        message: `Failed moveTask`,
        status: 500,
      }),
    })

    return updatedTask
  })
