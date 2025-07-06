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
  description?: string
  categoryId?: string
  profileId: string
}

export const createTask = (
  payload: CreateTaskPayload,
): Effect.Effect<Task, ServiceException | UnknownException> =>
  Effect.gen(function* () {
    const { title, statusId, description, categoryId, profileId } = payload

    if (!title || !statusId) {
      return yield* Effect.fail({ message: 'Missing required fields', status: 400 })
    }

    const newTask = yield* Effect.tryPromise(() =>
      prisma.$transaction(async (tx) => {
        const taskWithMaxOrder = await tx.task.findFirst({
          where: { statusId },
          orderBy: { order: 'desc' },
          select: { order: true },
        })

        const order = taskWithMaxOrder ? taskWithMaxOrder.order + 1 : 0

        return tx.task.create({
          data: {
            title,
            description,
            statusId,
            categoryId,
            profileId,
            order,
          },
        })
      }),
    )

    return newTask
  })
