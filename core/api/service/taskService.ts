import { Effect } from 'effect'
import { UnknownException } from 'effect/Cause'
import { generateKeyBetween } from 'fractional-indexing'

import { mapNullable, mapUndefined } from '@core/lib/mapNullable'
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

export const getTask = (
  id: string,
): Effect.Effect<TaskWithRelations, ServiceException | UnknownException> =>
  Effect.gen(function* () {
    const task = yield* Effect.tryPromise({
      try: () =>
        prisma.task.findUniqueOrThrow({
          where: { id },
          include: { category: true, status: true },
        }),
      catch: () => {
        return { message: `Failed getTask`, status: 404 }
      },
    })

    return task
  })

export const getTaskForProfile = (
  id: string,
  profileId: string,
): Effect.Effect<TaskWithRelations, ServiceException | UnknownException> =>
  Effect.gen(function* () {
    const task = yield* Effect.tryPromise({
      try: () =>
        prisma.task.findUniqueOrThrow({
          where: {
            id,
            profileId,
          },
          include: { category: true, status: true },
        }),
      catch: () => {
        return { message: `Failed getTask`, status: 404 }
      },
    })

    return task
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
          const firstTask = await tx.task.findFirst({
            where: { statusId: payload.statusId },
            orderBy: { order: 'asc' },
            select: { order: true },
          })

          const order = generateKeyBetween(null, firstTask?.order ?? null)

          return tx.task.create({
            data: {
              title: payload.title,
              description: payload.description || undefined,
              statusId: payload.statusId,
              categoryId: payload.categoryId || undefined,
              dueDate: mapUndefined(payload.dueDate, (date) => new Date(date)),
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

export type PatchTaskPayload = {
  id: string
  title?: string
  statusId?: string
  description?: string | null
  categoryId?: string | null
  dueDate?: string | null
}

export type PatchTaskForProfilePayload = {
  id: string
  profileId: string
  title?: string
  statusId?: string
  description?: string | null
  categoryId?: string | null
  dueDate?: string | null
}

export const patchTask = (
  payload: PatchTaskPayload,
): Effect.Effect<Task, ServiceException | UnknownException> =>
  Effect.gen(function* () {
    const patchedTask = yield* Effect.tryPromise({
      try: () =>
        prisma.$transaction(async (tx) => {
          return tx.task.update({
            where: { id: payload.id },
            data: {
              title: payload.title,
              description: payload.description || null,
              statusId: payload.statusId,
              categoryId: payload.categoryId,
              dueDate: mapNullable(payload.dueDate, (date) => new Date(date)),
            },
          })
        }),
      catch: () => {
        return { message: `Failed patchTask`, status: 500 }
      },
    })

    return patchedTask
  })

export const patchTaskForProfile = (
  payload: PatchTaskForProfilePayload,
): Effect.Effect<Task, ServiceException | UnknownException> =>
  Effect.gen(function* () {
    const patchedTask = yield* Effect.tryPromise({
      try: () =>
        prisma.$transaction(async (tx) => {
          return tx.task.update({
            where: {
              id: payload.id,
              profileId: payload.profileId,
            },
            data: {
              title: payload.title,
              description: payload.description || null,
              statusId: payload.statusId,
              categoryId: payload.categoryId,
              dueDate: mapNullable(payload.dueDate, (date) => new Date(date)),
            },
          })
        }),
      catch: () => {
        return { message: `Failed patchTask`, status: 404 }
      },
    })

    return patchedTask
  })

export const deleteTask = (id: string): Effect.Effect<Task, ServiceException | UnknownException> =>
  Effect.gen(function* () {
    const deletedTask = yield* Effect.tryPromise({
      try: () =>
        prisma.task.delete({
          where: { id },
        }),
      catch: () => {
        return { message: `Failed deleteTask`, status: 404 }
      },
    })

    return deletedTask
  })

export const deleteTaskForProfile = (
  id: string,
  profileId: string,
): Effect.Effect<Task, ServiceException | UnknownException> =>
  Effect.gen(function* () {
    const deletedTask = yield* Effect.tryPromise({
      try: () =>
        prisma.task.delete({
          where: {
            id,
            profileId,
          },
        }),
      catch: () => {
        return { message: `Failed deleteTask`, status: 404 }
      },
    })

    return deletedTask
  })

type MoveTaskPayload = {
  id: string
  afterTaskId: string | null
  destinationStatusId?: string
}

export const moveTask = (
  payload: MoveTaskPayload,
): Effect.Effect<Task, ServiceException | UnknownException> =>
  Effect.gen(function* () {
    const updatedTask = yield* Effect.tryPromise({
      try: () =>
        prisma.$transaction(async (tx) => {
          const { id, afterTaskId } = payload

          const task = await tx.task.findUnique({
            where: { id },
          })

          if (!task) {
            throw new Error('Task not found')
          }

          const destinationStatusId = payload.destinationStatusId ?? task.statusId

          const newOrder = await getNewOrder({
            tx,
            id,
            afterTaskId,
            destinationStatusId,
          })

          return tx.task.update({
            where: { id },
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

const getNewOrder = async ({
  tx,
  id,
  afterTaskId,
  destinationStatusId,
}: {
  tx: Prisma.TransactionClient
  id: string
  afterTaskId: string | null
  destinationStatusId: string
}): Promise<string> => {
  const isMoveToLowestOrder = afterTaskId === null

  if (isMoveToLowestOrder) {
    const lowestOrderTask = await tx.task.findFirst({
      where: { statusId: destinationStatusId },
      orderBy: { order: 'asc' },
      select: { order: true },
    })

    const newOrder = generateKeyBetween(null, lowestOrderTask?.order ?? null)

    return newOrder
  } else {
    const afterTask = await tx.task.findUniqueOrThrow({
      where: { id: afterTaskId },
      select: { order: true },
    })

    const followingTask = await tx.task.findFirst({
      where: {
        statusId: destinationStatusId,
        order: { gt: afterTask.order },
        id: { not: id },
      },
      orderBy: { order: 'asc' },
      select: { order: true },
    })

    const newOrder = generateKeyBetween(afterTask.order, followingTask?.order ?? null)

    return newOrder
  }
}
