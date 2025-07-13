import { Effect, Function, Match } from 'effect'
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

const TEMP_ORDER = -1

type Move = 'ToHigherOrderInStatus' | 'ToLowerOrderInStatus' | 'ToDifferentStatus' | 'None'

const determineMove = ({
  originOrder,
  destinationOrder,
  originStatusId,
  destinationStatusId,
}: {
  originOrder: number
  destinationOrder: number
  originStatusId: string
  destinationStatusId: string
}): Move => {
  if (originStatusId !== destinationStatusId) {
    return 'ToDifferentStatus'
  } else if (destinationOrder > originOrder) {
    return 'ToHigherOrderInStatus'
  } else if (destinationOrder < originOrder) {
    return 'ToLowerOrderInStatus'
  } else {
    return 'None'
  }
}

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
          const { profileId, taskId, destinationIndex: destinationOrder } = payload

          const task = await tx.task.findUnique({
            where: { id: taskId, profileId },
          })

          if (!task) {
            throw new Error('Task not found')
          }

          const { order: originOrder, statusId: originStatusId } = task

          const destinationStatusId = payload.destinationStatusId ?? originStatusId

          const move = determineMove({
            originOrder,
            destinationOrder,
            originStatusId,
            destinationStatusId,
          })

          const makeRoomForMove = Match.value(move).pipe(
            Match.when('None', Function.constVoid),
            Match.when('ToHigherOrderInStatus', async () => {
              await tx.task.update({
                where: { id: payload.taskId },
                data: { order: TEMP_ORDER },
              })

              await tx.task.updateMany({
                where: {
                  statusId: originStatusId,
                  order: { gt: originOrder, lte: destinationOrder },
                },
                data: { order: { decrement: 1 } },
              })
            }),
            Match.when('ToLowerOrderInStatus', async () => {
              await tx.task.update({
                where: { id: payload.taskId },
                data: { order: TEMP_ORDER },
              })

              await tx.task.updateMany({
                where: {
                  statusId: originStatusId,
                  order: { gte: destinationOrder },
                },
                data: { order: { increment: 1 } },
              })
            }),
            Match.when('ToDifferentStatus', async () => {
              await tx.task.update({
                where: { id: payload.taskId },
                data: { order: TEMP_ORDER },
              })

              await tx.task.updateMany({
                where: {
                  statusId: originStatusId,
                  order: { gt: originOrder },
                },
                data: { order: { decrement: 1 } },
              })

              await tx.task.updateMany({
                where: {
                  statusId: destinationStatusId,
                  order: { gte: destinationOrder },
                },
                data: { order: { increment: 1 } },
              })
            }),
            Match.exhaustive,
          )

          await makeRoomForMove

          return tx.task.update({
            where: { id: payload.taskId },
            data: {
              statusId: destinationStatusId,
              order: destinationOrder,
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
