import { Effect } from 'effect'
import { UnknownException } from 'effect/Cause'
import { ServiceException } from '../serviceException'
import { prisma } from '@/lib/prisma'
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
    if (!payload.title || !payload.statusId) {
      return yield* Effect.fail({ message: 'Missing required fields', status: 400 })
    }

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
      catch: () => ({ message: 'Failed createTask', status: 500 }),
    })

    return newTask
  })
